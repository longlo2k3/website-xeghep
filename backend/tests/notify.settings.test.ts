import { beforeEach, describe, expect, it, vi } from 'vitest';

import { NotificationSettings } from '../src/globals/NotificationSettings';
import { sendTelegramMessage } from '../src/lib/notify/telegram';
import { sendFallbackEmail } from '../src/lib/notify/email';
import { loadNotificationConfig } from '../src/lib/notify/worker';
import { POST as postTestNotify } from '../src/app/api/v1/notify/test/route';

vi.mock('../src/lib/api/ctx', async () => {
  const actual = await vi.importActual<any>('../src/lib/api/ctx');
  return {
    ...actual,
    getPayloadInstance: vi.fn().mockResolvedValue({
      auth: vi.fn().mockResolvedValue({ user: null }),
      findGlobal: vi.fn().mockResolvedValue({}),
    }),
  };
});

describe('NotificationSettings Global Schema & Access', () => {
  it('định nghĩa đúng slug notification_settings', () => {
    expect(NotificationSettings.slug).toBe('notification_settings');
  });

  it('chỉ cho phép admin đọc và sửa (access.read & access.update)', () => {
    const adminReq = { req: { user: { role: 'admin' } } };
    const editorReq = { req: { user: { role: 'editor' } } };
    const guestReq = { req: {} };

    const canRead = NotificationSettings.access?.read as any;
    const canUpdate = NotificationSettings.access?.update as any;

    expect(canRead(adminReq)).toBe(true);
    expect(canRead(editorReq)).toBe(false);
    expect(canRead(guestReq)).toBe(false);

    expect(canUpdate(adminReq)).toBe(true);
    expect(canUpdate(editorReq)).toBe(false);
    expect(canUpdate(guestReq)).toBe(false);
  });

  it('có đầy đủ các trường cấu hình Telegram và Email', () => {
    const fieldNames = NotificationSettings.fields.map((f: any) => f.name);
    expect(fieldNames).toContain('telegramEnabled');
    expect(fieldNames).toContain('telegramBotToken');
    expect(fieldNames).toContain('telegramChatId');
    expect(fieldNames).toContain('emailEnabled');
    expect(fieldNames).toContain('emailWebhookUrl');
    expect(fieldNames).toContain('emailTo');
  });
});

describe('sendTelegramMessage with dynamic options', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('ưu tiên token & chatId truyền từ options thay vì process.env', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await sendTelegramMessage('test message', {
      token: 'custom_bot_token_123',
      chatId: '-100999888',
    });

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.telegram.org/botcustom_bot_token_123/sendMessage');
    const body = JSON.parse(init.body as string);
    expect(body.chat_id).toBe('-100999888');
    expect(body.text).toBe('test message');
  });

  it('khi token rỗng thì skip gửi và trả về skipped', async () => {
    const origToken = process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_BOT_TOKEN;

    const result = await sendTelegramMessage('test', { token: '', chatId: '' });
    expect(result.ok).toBe(true);
    if ('skipped' in result) {
      expect(result.skipped).toBe(true);
    }

    if (origToken) process.env.TELEGRAM_BOT_TOKEN = origToken;
  });
});

describe('sendFallbackEmail with dynamic options', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('ưu tiên webhook & to truyền từ options thay vì process.env', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await sendFallbackEmail('Subject test', 'Body test', {
      webhook: 'https://webhook.site/test-email',
      to: 'dispatch@xegheplientinh.vn',
    });

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://webhook.site/test-email');
    const body = JSON.parse(init.body as string);
    expect(body.to).toBe('dispatch@xegheplientinh.vn');
    expect(body.subject).toBe('Subject test');
  });
});

describe('loadNotificationConfig — nạp cấu hình động kết hợp env fallback', () => {
  it('nạp cấu hình từ DB khi có dữ liệu', async () => {
    const mockPayload: any = {
      findGlobal: vi.fn().mockResolvedValue({
        telegramEnabled: true,
        telegramBotToken: 'db_token',
        telegramChatId: 'db_chat',
        emailEnabled: false,
        emailWebhookUrl: 'https://db-webhook.site',
        emailTo: 'db@example.com',
      }),
    };

    const config = await loadNotificationConfig(mockPayload);
    expect(config.telegramEnabled).toBe(true);
    expect(config.telegramBotToken).toBe('db_token');
    expect(config.telegramChatId).toBe('db_chat');
    expect(config.emailEnabled).toBe(false);
    expect(config.emailWebhookUrl).toBe('https://db-webhook.site');
    expect(config.emailTo).toBe('db@example.com');
  });

  it('fallback về env nếu trường trong DB để trống', async () => {
    const origBot = process.env.TELEGRAM_BOT_TOKEN;
    const origChat = process.env.TELEGRAM_CHAT_ID;
    process.env.TELEGRAM_BOT_TOKEN = 'env_bot_token';
    process.env.TELEGRAM_CHAT_ID = 'env_chat_id';

    const mockPayload: any = {
      findGlobal: vi.fn().mockResolvedValue({
        telegramEnabled: true,
        telegramBotToken: '',
        telegramChatId: '',
      }),
    };

    const config = await loadNotificationConfig(mockPayload);
    expect(config.telegramBotToken).toBe('env_bot_token');
    expect(config.telegramChatId).toBe('env_chat_id');

    if (origBot) process.env.TELEGRAM_BOT_TOKEN = origBot;
    else delete process.env.TELEGRAM_BOT_TOKEN;
    if (origChat) process.env.TELEGRAM_CHAT_ID = origChat;
    else delete process.env.TELEGRAM_CHAT_ID;
  });
});

describe('POST /api/v1/notify/test — handler', () => {
  it('từ chối 401 nếu không có quyền admin', async () => {
    const req = new Request('http://localhost/api/v1/notify/test', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ channel: 'telegram' }),
    });

    const res = await postTestNotify(req);
    expect(res.status).toBe(401);
  });

  it('gửi test telegram thành công khi có quyền admin và đủ thông tin', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const req = new Request('http://localhost/api/v1/notify/test', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-test-role': 'admin' },
      body: JSON.stringify({
        channel: 'telegram',
        telegram: { botToken: '123:ABC', chatId: '-100123' },
      }),
    });

    const res = await postTestNotify(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toContain('thành công');
  });

  it('xử lý lỗi khi telegram API phản hồi thất bại', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ ok: false, description: 'Bad Request: chat not found' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const req = new Request('http://localhost/api/v1/notify/test', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-test-role': 'admin' },
      body: JSON.stringify({
        channel: 'telegram',
        telegram: { botToken: '123:ABC', chatId: '-999' },
      }),
    });

    const res = await postTestNotify(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.message).toContain('chat not found');
  });

  it('báo lỗi 422 khi thiếu thông tin botToken hoặc chatId', async () => {
    const origToken = process.env.TELEGRAM_BOT_TOKEN;
    const origChat = process.env.TELEGRAM_CHAT_ID;
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_CHAT_ID;

    const req = new Request('http://localhost/api/v1/notify/test', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-test-role': 'admin' },
      body: JSON.stringify({
        channel: 'telegram',
        telegram: { botToken: '', chatId: '' },
      }),
    });

    const res = await postTestNotify(req);
    expect(res.status).toBe(422);

    if (origToken) process.env.TELEGRAM_BOT_TOKEN = origToken;
    if (origChat) process.env.TELEGRAM_CHAT_ID = origChat;
  });

  it('gửi test email thành công khi có quyền admin và đủ webhook', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
    });
    vi.stubGlobal('fetch', fetchMock);

    const req = new Request('http://localhost/api/v1/notify/test', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-test-role': 'admin' },
      body: JSON.stringify({
        channel: 'email',
        email: { webhookUrl: 'https://webhook.site/test', emailTo: 'admin@test.com' },
      }),
    });

    const res = await postTestNotify(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.message).toContain('thành công');
  });
});
