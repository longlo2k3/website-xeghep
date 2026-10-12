import { getPayloadInstance } from '../../../../../lib/api/ctx';
import { CORS_HEADERS, jsonError, jsonOk, optionsCorsResponse } from '../../../../../lib/api/envelope';
import { sendFallbackEmail } from '../../../../../lib/notify/email';
import { sendTelegramMessage } from '../../../../../lib/notify/telegram';
import { loadNotificationConfig } from '../../../../../lib/notify/worker';

export const dynamic = 'force-dynamic';

export async function OPTIONS(): Promise<Response> {
  return optionsCorsResponse();
}

export async function POST(req: Request): Promise<Response> {
  const isTestAdmin =
    process.env.NODE_ENV === 'test' && req.headers.get('x-test-role') === 'admin';
  let isAdmin = isTestAdmin;
  let payload: any = null;

  if (!isAdmin) {
    try {
      payload = await getPayloadInstance();
      const authRes = await payload.auth({ headers: req.headers });
      if (authRes?.user && authRes.user.role === 'admin') {
        isAdmin = true;
      }
    } catch {
      isAdmin = false;
    }
  }

  if (!isAdmin) {
    return new Response(
      JSON.stringify({
        success: false,
        statusCode: 401,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Yêu cầu quyền quản trị viên (Admin)',
        },
      }),
      {
        status: 401,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          ...CORS_HEADERS,
        },
      },
    );
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const channel = body?.channel;
  let savedConfig: any = {
    telegramEnabled: true,
    telegramBotToken: (process.env.TELEGRAM_BOT_TOKEN ?? '').trim(),
    telegramChatId: (process.env.TELEGRAM_CHAT_ID ?? '').trim(),
    emailEnabled: true,
    emailWebhookUrl: (process.env.NOTIFY_EMAIL_WEBHOOK ?? '').trim(),
    emailTo: (process.env.NOTIFY_EMAIL_TO ?? '').trim(),
  };

  try {
    if (!payload) payload = await getPayloadInstance();
    if (payload) savedConfig = await loadNotificationConfig(payload);
  } catch {
    // Fallback về env
  }

  if (channel === 'telegram') {
    const token = (body?.telegram?.botToken || savedConfig.telegramBotToken || '').trim();
    const chatId = (body?.telegram?.chatId || savedConfig.telegramChatId || '').trim();

    if (!token || !chatId) {
      return jsonError('VALIDATION_ERROR', 'Vui lòng cung cấp Bot Token và Chat ID để kiểm tra');
    }

    const nowIso = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    const testMessage = `🚨 <b>[Xe Ghép Liên Tỉnh] KIỂM TRA KẾT NỐI</b>\n━━━━━━━━━━━━━━━━━━━━\n✅ Hệ thống thông báo tự động kết nối thành công tới Telegram Bot!\n⏰ Thời gian: ${nowIso}`;
    const sent = await sendTelegramMessage(testMessage, { token, chatId });

    if (!sent.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          statusCode: 400,
          error: {
            code: 'INTERNAL_ERROR',
            message: `Lỗi kết nối Telegram: ${sent.error}`,
          },
        }),
        {
          status: 400,
          headers: {
            'content-type': 'application/json; charset=utf-8',
            ...CORS_HEADERS,
          },
        },
      );
    }

    return jsonOk(
      { channel: 'telegram', sentAt: new Date().toISOString() },
      { message: 'Gửi tin nhắn Telegram thử nghiệm thành công' },
    );
  }

  if (channel === 'email') {
    const webhook = (body?.email?.webhookUrl || savedConfig.emailWebhookUrl || '').trim();
    const to = (body?.email?.emailTo || savedConfig.emailTo || '').trim();

    if (!webhook) {
      return jsonError('VALIDATION_ERROR', 'Vui lòng cung cấp Webhook URL gửi email để kiểm tra');
    }

    const nowIso = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    const subject = `[Xe Ghép Liên Tỉnh] Kiểm tra cấu hình Email Webhook (${nowIso})`;
    const bodyText = `Kiểm tra kết nối thành công từ hệ thống Xe Ghép Liên Tỉnh lúc ${nowIso}.`;
    const sent = await sendFallbackEmail(subject, bodyText, { webhook, to });

    if (!sent.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          statusCode: 400,
          error: {
            code: 'INTERNAL_ERROR',
            message: `Lỗi kết nối Webhook Email: ${sent.error}`,
          },
        }),
        {
          status: 400,
          headers: {
            'content-type': 'application/json; charset=utf-8',
            ...CORS_HEADERS,
          },
        },
      );
    }

    return jsonOk(
      { channel: 'email', sentAt: new Date().toISOString() },
      { message: 'Gửi thử nghiệm Email thành công' },
    );
  }

  return jsonError('VALIDATION_ERROR', 'Kênh thông báo không hợp lệ (hỗ trợ telegram hoặc email)');
}
