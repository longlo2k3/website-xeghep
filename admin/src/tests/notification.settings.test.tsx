import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NotificationSettingsForm } from '@/features/settings/NotificationSettingsForm';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { apiClient } from '@/lib/api-client';

// Mock apiClient
vi.mock('@/lib/api-client', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api-client')>('@/lib/api-client');
  return {
    ...actual,
    apiClient: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    },
  };
});

const mockNotificationSettings = {
  telegramEnabled: true,
  telegramBotToken: '123456789:ABCdefGHIjklMNOpqrsTUVwxyz',
  telegramChatId: '-100987654321',
  emailEnabled: true,
  emailWebhookUrl: 'https://webhook.site/test-relay',
  emailTo: 'dieuhanh@xegheplientinh.vn',
};

describe('NotificationSettingsForm Component (T306)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('nạp dữ liệu từ GET /api/globals/notification_settings và hiển thị form đầy đủ', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockNotificationSettings });

    render(
      <MemoryRouter>
        <NotificationSettingsForm />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/globals/notification_settings');
    });

    expect(screen.getByDisplayValue('123456789:ABCdefGHIjklMNOpqrsTUVwxyz')).toBeDefined();
    expect(screen.getByDisplayValue('-100987654321')).toBeDefined();
    expect(screen.getByDisplayValue('https://webhook.site/test-relay')).toBeDefined();
    expect(screen.getByDisplayValue('dieuhanh@xegheplientinh.vn')).toBeDefined();
  });

  it('cho phép chỉnh sửa và lưu cấu hình thành công qua POST /api/globals/notification_settings', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockNotificationSettings });
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { message: 'Thành công' } });

    render(
      <MemoryRouter>
        <NotificationSettingsForm />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/globals/notification_settings');
    });

    const chatIdInput = screen.getByDisplayValue('-100987654321');
    fireEvent.change(chatIdInput, { target: { value: '-100555666777' } });

    const saveButton = screen.getByRole('button', { name: /Lưu cấu hình thông báo/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith(
        '/globals/notification_settings',
        expect.objectContaining({
          telegramChatId: '-100555666777',
        })
      );
    });

    expect(await screen.findByText(/Đã lưu cấu hình thông báo thành công/i)).toBeDefined();
  });

  it('gửi test Telegram gọi đúng API POST /v1/notify/test và hiển thị phản hồi', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockNotificationSettings });
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { success: true, message: 'Gửi tin nhắn Telegram thử nghiệm thành công' },
    });

    render(
      <MemoryRouter>
        <NotificationSettingsForm />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/globals/notification_settings');
    });

    const testTgButton = screen.getByRole('button', { name: /Gửi thử nghiệm Telegram/i });
    fireEvent.click(testTgButton);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith(
        '/v1/notify/test',
        expect.objectContaining({
          channel: 'telegram',
          telegram: expect.objectContaining({
            botToken: '123456789:ABCdefGHIjklMNOpqrsTUVwxyz',
            chatId: '-100987654321',
          }),
        })
      );
    });

    expect(await screen.findByText(/Gửi tin nhắn Telegram thử nghiệm thành công/i)).toBeDefined();
  });

  it('gửi test Email gọi đúng API POST /v1/notify/test và hiển thị phản hồi', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockNotificationSettings });
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { success: true, message: 'Gửi thử nghiệm Email thành công' },
    });

    render(
      <MemoryRouter>
        <NotificationSettingsForm />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/globals/notification_settings');
    });

    const testEmailButton = screen.getByRole('button', { name: /Gửi thử nghiệm Email/i });
    fireEvent.click(testEmailButton);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith(
        '/v1/notify/test',
        expect.objectContaining({
          channel: 'email',
          email: expect.objectContaining({
            webhookUrl: 'https://webhook.site/test-relay',
            emailTo: 'dieuhanh@xegheplientinh.vn',
          }),
        })
      );
    });

    expect(await screen.findByText(/Gửi thử nghiệm Email thành công/i)).toBeDefined();
  });

  it('SettingsPage tích hợp tab Thông báo và chuyển tab mượt mà', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: mockNotificationSettings });

    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    const notifyTab = screen.getByRole('button', { name: /Cấu hình Thông báo & Bot/i });
    expect(notifyTab).toBeDefined();

    fireEvent.click(notifyTab);

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/globals/notification_settings');
    });
  });
});
