# Task Plan — Quản Trị Cấu Hình Gửi Thông Báo Tự Động (004-notification-config)

> **Project**: `cms/` — Admin CMS Frontend (`admin/`) & Backend (`backend/`)
> **Mode**: Spec-Kit (`.spec-mode` = `spec-kit`) · **Complexity**: Standard
> **Current Feature**: `004-notification-config`
> **Spec**: [.specify/specs/004-notification-config/spec.md](.specify/specs/004-notification-config/spec.md) (G1 ✅)
> **Plan**: [.specify/specs/004-notification-config/plan.md](.specify/specs/004-notification-config/plan.md) (G2 ✅)
> **Tasks**: [.specify/specs/004-notification-config/tasks.md](.specify/specs/004-notification-config/tasks.md) (T301–T311 ✅)
> **Current Phase**: Phase 5 — Archive & Verification (G4 ✅)

---

## 0. Trạng thái Phase (Feature 004)

| Phase | Mô tả | Status |
|---|---|---|
| 0 | Session init & Clarification: làm rõ scope kênh Telegram, Email fallback, global settings, nút test | ✅ done |
| 1 | Specification: `spec.md` (4 User Stories, AC1.1–AC4.2) | ✅ G1 passed |
| 2 | Planning: `plan.md` (Checkpoints CP-§2.2, CP-§2.3, CP-§2.4, CP-§2.5, CP-§2.6) + `tasks.md` (T301–T311) | ✅ G2 passed |
| 3 | UI/UX: Thiết kế giao diện tab Cấu hình Thông báo trong Admin Settings | ✅ done |
| 4 | Implementation: Thực thi T301–T311 (TDD-first cho cả backend & admin) | ✅ done |
| 5 | Archive: Toàn bộ kiểm thử & build verification xanh (41 test files / 557 tests GREEN) | ✅ G4 passed |

---

## 1. File Structure Mapping

```
cms/
├── backend/
│   ├── src/
│   │   ├── payload.config.ts                           # [T302] Đăng ký Global NotificationSettings
│   │   ├── globals/
│   │   │   └── NotificationSettings.ts                 # [T302] Định nghĩa Global notification_settings
│   │   ├── lib/notify/
│   │   │   ├── telegram.ts                             # [T303] Tham số token/chatId động
│   │   │   ├── email.ts                                # [T303] Tham số webhook/to động
│   │   │   └── worker.ts                               # [T303] Đọc cấu hình động từ DB + fallback env
│   │   └── app/api/v1/notify/
│   │       └── test/
│   │           └── route.ts                            # [T304] API POST /api/v1/notify/test
│   └── tests/
│       └── notify.settings.test.ts                     # [T301] Red tests backend notify settings (13 tests)
├── admin/
│   ├── src/
│   │   ├── types/
│   │   │   └── settings.ts                             # [T307] Types NotificationSettings
│   │   ├── features/settings/
│   │   │   ├── NotificationSettingsForm.tsx            # [T308] Form cấu hình thông báo & nút test
│   │   │   ├── SettingsPage.tsx                        # [T309] Tab 'notification' với icon Bell
│   │   │   └── index.ts                                # [T308] Export component
│   │   └── tests/
│   │       └── notification.settings.test.tsx          # [T306] Red tests frontend notification settings (5 tests)
```

---

## 2. Master Checklist (T301–T311)

### Giai đoạn 1: Backend — Cấu hình Global & Tiến trình Gửi thông báo động
- [x] T301 Viết Red tests `backend/tests/notify.settings.test.ts`
- [x] T302 Tạo Global `NotificationSettings` & đăng ký trong `payload.config.ts`
- [x] T303 Cập nhật `telegram.ts`, `email.ts`, `worker.ts` với cấu hình động & fallback env
- [x] T304 Triển khai API `POST /api/v1/notify/test` kiểm tra kết nối với quyền Admin
- [x] T305 Chạy kiểm thử toàn bộ backend (`npm test`), xác nhận 100% tests pass (23 files / 343 tests)

### Giai đoạn 2: Admin Frontend — Giao diện Quản trị Cấu hình Thông báo
- [x] T306 Viết Red tests `admin/src/tests/notification.settings.test.tsx`
- [x] T307 Định nghĩa types `NotificationSettings` trong `admin/src/types/settings.ts`
- [x] T308 Xây dựng component `NotificationSettingsForm.tsx` (toggle, token mask, nút test)
- [x] T309 Tích hợp tab 'notification' vào `SettingsPage.tsx`
- [x] T310 Chạy kiểm thử toàn bộ frontend (`npm test`), xác nhận 100% tests pass (18 files / 214 tests)

### Giai đoạn 3: Toàn Diện & Đóng Gói
- [x] T311 Kiểm tra build (`npm run build`) cả `backend` và `admin`, cập nhật `findings.md` và `progress.md`
