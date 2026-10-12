import type { GlobalConfig } from "payload";

import { isAdmin } from "../collections/shared/access";

export const NotificationSettings: GlobalConfig = {
  slug: "notification_settings",
  access: {
    read: isAdmin,
    update: isAdmin,
  },
  admin: {
    description: "Cấu hình gửi thông báo tự động Telegram Bot & Email Fallback.",
  },
  fields: [
    {
      name: "telegramEnabled",
      type: "checkbox",
      label: "Kích hoạt gửi thông báo qua Telegram Bot",
      defaultValue: true,
      admin: {
        description: "Bật/tắt tự động gửi thông báo đơn đặt xe mới tới nhóm Telegram.",
      },
    },
    {
      name: "telegramBotToken",
      type: "text",
      label: "Telegram Bot Token",
      admin: {
        description:
          "Bot token tạo từ @BotFather (ví dụ: 123456789:ABCdef...). Để trống sẽ dùng biến môi trường TELEGRAM_BOT_TOKEN.",
      },
    },
    {
      name: "telegramChatId",
      type: "text",
      label: "Telegram Chat ID / Group ID",
      admin: {
        description:
          "ID người nhận hoặc ID nhóm chat Telegram (ví dụ: -100123456789). Để trống sẽ dùng TELEGRAM_CHAT_ID.",
      },
    },
    {
      name: "emailEnabled",
      type: "checkbox",
      label: "Kích hoạt Email Fallback",
      defaultValue: true,
      admin: {
        description:
          "Bật/tắt gửi email cảnh báo khi Telegram gửi thất bại liên tiếp 3 lần.",
      },
    },
    {
      name: "emailWebhookUrl",
      type: "text",
      label: "Email Webhook URL",
      admin: {
        description:
          "URL webhook tiếp nhận gửi email (ví dụ: Zapier, Make, n8n hoặc Relay). Để trống sẽ dùng NOTIFY_EMAIL_WEBHOOK.",
      },
    },
    {
      name: "emailTo",
      type: "text",
      label: "Email nhận thông báo",
      admin: {
        description:
          "Địa chỉ email nhận cảnh báo đơn chưa thông báo. Để trống sẽ dùng NOTIFY_EMAIL_TO.",
      },
    },
  ],
};
