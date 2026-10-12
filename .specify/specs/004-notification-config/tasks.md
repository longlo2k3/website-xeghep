# Tasks: Danh Sách Công Việc Chi Tiết (004-notification-config)

> **Feature**: `004-notification-config` · **Mode**: Spec-Kit · **Complexity**: Standard
> **Spec**: [spec.md](spec.md) · **Plan**: [plan.md](plan.md)

---

## Danh Sách Nhiệm Vụ (T301–T311)

### Giai đoạn 1: Backend — Cấu hình Global & Tiến trình Gửi thông báo động
- [x] **T301**: [P1] [Backend] Viết Red tests `backend/tests/notify.settings.test.ts` kiểm thử logic cấu hình động, fallback env, và endpoint gửi test.
  - *File*: `backend/tests/notify.settings.test.ts`
  - *Acceptance Criteria*: AC1.1, AC1.4, AC2.1, AC3.1, AC4.1.
- [x] **T302**: [P1] [Backend] Tạo Global `NotificationSettings` và đăng ký trong `backend/src/payload.config.ts`.
  - *Files*: `backend/src/globals/NotificationSettings.ts`, `backend/src/payload.config.ts`
  - *Acceptance Criteria*: AC1.1, AC2.1, AC4.1 (Admin-only read/write).
- [x] **T303**: [P1] [Backend] Cập nhật `telegram.ts`, `email.ts`, `worker.ts` hỗ trợ truyền tham số động và nạp cấu hình từ Global với fallback env.
  - *Files*: `backend/src/lib/notify/telegram.ts`, `backend/src/lib/notify/email.ts`, `backend/src/lib/notify/worker.ts`
  - *Acceptance Criteria*: AC1.1, AC1.2, AC1.4, AC2.2, AC2.3.
- [x] **T304**: [P1] [Backend] Triển khai API `POST /api/v1/notify/test` để kiểm tra kết nối Telegram/Email với quyền Admin và chuẩn envelope.
  - *File*: `backend/src/app/api/v1/notify/test/route.ts`
  - *Acceptance Criteria*: AC3.1, AC3.2, AC3.3, AC4.1.
- [x] **T305**: [P1] [Backend] Chạy kiểm thử toàn bộ backend (`npm test`), xác nhận 100% tests pass.
  - *Command*: `npm test` trong `backend/`
  - *Acceptance Criteria*: Bảo toàn toàn bộ test suites hiện tại và mới (23 files / 343 tests).

### Giai đoạn 2: Admin Frontend — Giao diện Quản trị Cấu hình Thông báo
- [x] **T306**: [P1] [Frontend] Viết Red tests `admin/src/tests/notification.settings.test.tsx` cho màn hình cấu hình thông báo.
  - *File*: `admin/src/tests/notification.settings.test.tsx`
  - *Acceptance Criteria*: AC1.1, AC1.3, AC3.1, AC3.2.
- [x] **T307**: [P2] [Frontend] Định nghĩa types `NotificationSettings` trong `admin/src/types/settings.ts`.
  - *File*: `admin/src/types/settings.ts`
  - *Acceptance Criteria*: Đồng bộ với schema backend.
- [x] **T308**: [P1] [Frontend] Xây dựng component `NotificationSettingsForm.tsx` (toggle kích hoạt, che/hiện token, nút gửi test).
  - *Files*: `admin/src/features/settings/NotificationSettingsForm.tsx`, `admin/src/features/settings/index.ts`
  - *Acceptance Criteria*: AC1.1, AC1.2, AC1.3, AC2.1, AC3.1, AC3.2, AC3.3.
- [x] **T309**: [P1] [Frontend] Tích hợp tab 'notification' vào `SettingsPage.tsx` với icon `Bell`.
  - *File*: `admin/src/features/settings/SettingsPage.tsx`
  - *Acceptance Criteria*: AC4.2.
- [x] **T310**: [P1] [Frontend] Chạy kiểm thử toàn bộ frontend (`npm test`), xác nhận 100% tests pass.
  - *Command*: `npm test` trong `admin/`
  - *Acceptance Criteria*: Mọi unit/integration test admin xanh 100% (18 files / 214 tests).

### Giai đoạn 3: Toàn Diện & Đóng Gói (Full Verification)
- [x] **T311**: [P1] [Full] Kiểm tra build (`npm run build`) cho cả `backend` và `admin`, cập nhật `findings.md` và `progress.md`.
  - *Files*: `findings.md`, `progress.md`, `task_plan.md`
  - *Acceptance Criteria*: Build thành công không có lỗi typecheck/lint.
