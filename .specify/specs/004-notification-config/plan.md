# Plan: Kế Hoạch Kỹ Thuật Quản Trị Cấu Hình Gửi Thông Báo

- **Feature Name**: `004-notification-config`
- **Spec Reference**: [.specify/specs/004-notification-config/spec.md](spec.md)
- **Constitution Checkpoints**:
  - `[CP-§2.2]` Server Authority & Contract Fidelity (Hợp đồng API chuẩn envelope `{ success, statusCode, message, data }`, server kiểm soát cấu hình).
  - `[CP-§2.3]` Security & Privacy (RBAC nghiêm ngặt: Token bot và Webhook URL chỉ tài khoản `admin` mới được đọc/sửa; không bao giờ công khai ra ngoài).
  - `[CP-§2.4]` Testing — TDD là bắt buộc (Viết unit & integration tests trước, bảo toàn 100% test xanh).
  - `[CP-§2.5]` Performance (Worker chạy bất đồng bộ với cấu hình động, không ảnh hưởng API booking p95 ≤ 400ms).
  - `[CP-§2.6]` User Experience (Giao diện Admin nhất quán, trực quan, hỗ trợ che/hiện token, nút gửi test phản hồi ngay lập tức).

---

## 1. Bản Đồ Cấu Trúc File & Kiến Trúc (Architecture Mapping)

```
cms/
├── backend/
│   ├── src/
│   │   ├── payload.config.ts                           # [CP-§2.2] Đăng ký Global NotificationSettings
│   │   ├── globals/
│   │   │   └── NotificationSettings.ts                 # [CP-§2.2, CP-§2.3] Định nghĩa Global notification_settings (Admin-only read/write)
│   │   ├── lib/notify/
│   │   │   ├── telegram.ts                             # [CP-§2.2] Hỗ trợ truyền tùy chọn token/chatId động
│   │   │   ├── email.ts                                # [CP-§2.2] Hỗ trợ truyền tùy chọn webhook/to động
│   │   │   └── worker.ts                               # [CP-§2.5] Nạp cấu hình động từ DB kết hợp fallback env
│   │   └── app/api/v1/notify/
│   │       └── test/
│   │           └── route.ts                            # [CP-§2.2, CP-§2.3] API POST /api/v1/notify/test gửi tin nhắn thử nghiệm
│   └── tests/
│       ├── notify.settings.test.ts                     # [CP-§2.4] Test suite kiểm thử cấu hình thông báo & worker động
│       └── notify.test.ts                              # [CP-§2.4] Cập nhật / bổ sung test cases kiểm tra telegram/email options
├── admin/
│   ├── src/
│   │   ├── types/
│   │   │   └── settings.ts                             # [CP-§2.2] Định nghĩa kiểu NotificationSettings
│   │   ├── features/settings/
│   │   │   ├── NotificationSettingsForm.tsx            # [CP-§2.6] Form quản trị thông báo, toggle kênh, gửi test
│   │   │   ├── SettingsPage.tsx                        # [CP-§2.6] Tích hợp tab 'notification' và icon Bell
│   │   │   └── index.ts                                # Export NotificationSettingsForm
│   │   └── tests/
│   │       └── notification.settings.test.tsx          # [CP-§2.4] Test suite frontend cho màn hình cấu hình thông báo
```

---

## 2. Thiết Kế Hợp Đồng API & Dữ Liệu Chi Tiết

### 2.1 Payload CMS Global: `notification_settings`
- **Slug**: `notification_settings`
- **Access**:
  - `read`: `isAdmin` (Chỉ tài khoản admin)
  - `update`: `isAdmin` (Chỉ tài khoản admin)
- **Fields**:
  - `telegramEnabled` (boolean, default: `true`, Label: "Kích hoạt Telegram")
  - `telegramBotToken` (text, Label: "Telegram Bot Token", admin description: "Token từ @BotFather")
  - `telegramChatId` (text, Label: "Telegram Chat ID", admin description: "ID nhóm hoặc người nhận")
  - `emailEnabled` (boolean, default: `true`, Label: "Kích hoạt Email Fallback")
  - `emailWebhookUrl` (text, Label: "Email Webhook URL")
  - `emailTo` (text, Label: "Email nhận thông báo")

### 2.2 Endpoint Gửi Thử Nghiệm: `POST /api/v1/notify/test`
- **Headers**: `Authorization: Bearer <token>` hoặc Cookie session admin.
- **Request Body**:
```json
{
  "channel": "telegram" | "email",
  "telegram": {
    "botToken": "123456:ABC-DEF...",
    "chatId": "-100123456789"
  },
  "email": {
    "webhookUrl": "https://hooks.zapier.com/...",
    "emailTo": "admin@xegheplientinh.vn"
  }
}
```
*(Nếu thông số rỗng, API sẽ tự động lấy từ cấu hình Global đã lưu hoặc biến môi trường).*
- **Response Format (Chuẩn Envelope §2.2)**:
  - Thành công:
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Gửi tin nhắn Telegram thử nghiệm thành công!",
      "data": { "channel": "telegram", "sentAt": "2026-10-12T17:30:00.000Z" }
    }
    ```
  - Thất bại:
    ```json
    {
      "success": false,
      "statusCode": 400,
      "message": "Lỗi kết nối Telegram: Bad Request: chat not found",
      "error": "TELEGRAM_SEND_FAILED"
    }
    ```

---

## 3. Kế Hoạch Triển Khai Chi Tiết (Phases & TDD)

### Giai đoạn 1: Backend — Global Schema, Dynamic Worker & Test API [CP-§2.2, CP-§2.3, CP-§2.4]
1. **Red Test Backend**:
   - Viết `backend/tests/notify.settings.test.ts`:
     - Test nạp cấu hình động: ưu tiên database global, fallback sang `process.env`.
     - Test bật/tắt `telegramEnabled = false` thì bỏ qua gửi Telegram.
     - Test hàm `sendTelegramMessage` và `sendFallbackEmail` nhận tham số ghi đè.
     - Test API `POST /api/v1/notify/test`: yêu cầu quyền admin, gửi test thành công và xử lý lỗi khi sai token.
2. **Triển khai Global `NotificationSettings`**:
   - Tạo `backend/src/globals/NotificationSettings.ts` với quyền `isAdmin`.
   - Đăng ký vào `backend/src/payload.config.ts`.
3. **Cập nhật Logic Gửi Thông Báo**:
   - Cập nhật `backend/src/lib/notify/telegram.ts` nhận options `{ token?: string; chatId?: string }`.
   - Cập nhật `backend/src/lib/notify/email.ts` nhận options `{ webhook?: string; to?: string }`.
   - Cập nhật `backend/src/lib/notify/worker.ts` đọc cấu hình từ `payload.findGlobal({ slug: 'notification_settings' })`.
4. **Triển khai API Test Notify**:
   - Tạo `backend/src/app/api/v1/notify/test/route.ts` với xác thực vai trò `admin`.
5. **Chạy Green Test Backend**: Chạy `npm test` xác nhận 100% tests pass.

### Giai đoạn 2: Admin Frontend — Types, Form & UI Integration [CP-§2.6, CP-§2.4]
1. **Red Test Frontend**:
   - Tạo `admin/src/tests/notification.settings.test.tsx`:
     - Test load dữ liệu từ `GET /api/globals/notification_settings`.
     - Test submit lưu cấu hình qua `POST /api/globals/notification_settings`.
     - Test tương tác nút "Gửi thử nghiệm Telegram" gọi `POST /api/v1/notify/test`.
     - Test toggle bật/tắt các kênh và ẩn/hiện token.
2. **Cập nhật Types**:
   - Bổ sung `NotificationSettings` trong `admin/src/types/settings.ts`.
3. **Triển khai Component `NotificationSettingsForm`**:
   - Xây dựng form chuẩn UI với Ant Design/Tailwind tokens sẵn có.
   - Hỗ trợ đầy đủ các trường, switch toggle, nút test với loading state.
4. **Tích hợp vào `SettingsPage`**:
   - Thêm tab "Cấu hình Thông báo" (`notification`) vào `SettingsPage.tsx`.
   - Xuất component trong `admin/src/features/settings/index.ts`.
5. **Chạy Green Test Frontend**: Chạy `npm test` admin xác nhận 100% tests pass.

### Giai đoạn 3: Toàn Diện & Đóng Gói (Full Verification)
1. Chạy linter & build check cả `backend` và `admin`.
2. Kiểm tra không phát sinh hồi quy, cập nhật `task_plan.md`, `findings.md`, `progress.md`.

---

## 4. Quản Lý Rủi Ro & Chiến Lược Rollback

| Rủi ro tiềm ẩn | Mức độ | Biện pháp giảm thiểu |
|---|---|---|
| Cấu hình DB bị trống hoặc lỗi format gây đứt gãy thông báo | Cao | Luôn tự động fallback về biến môi trường `process.env` nếu DB trống hoặc lỗi. |
| Lộ token bot Telegram qua API công khai | Nghiêm trọng | Phân quyền `read: isAdmin` và `update: isAdmin`. Tuyệt đối không cho phép truy cập nặc danh. |
| Gọi test liên tục làm nghẽn hoặc bị rate limit bởi Telegram | Trung bình | Giao diện hiển thị loading disable nút trong thời gian gửi; rate limit API endpoint test nếu cần. |
