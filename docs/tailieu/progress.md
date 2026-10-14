# Progress — Headless CMS + Booking + SEO

> Nhật ký hoạt động + evidence nghiệm thu. Format: ISO timestamp · phase · việc làm · kết quả.

## 2026-10-09 · Phase 0 — Session init
- Chạy skill `spec-first-superpowers` → chọn mode: không có tín hiệu cũ trong `cms/` (mới 1 file) → **Spec-Kit**; ghi `.spec-mode` = `spec-kit`.
- Đọc `CMS_BACKEND_SEO_SPECIFICATION_v1.1.md` (1536 dòng, bản 1.1.0) → đủ đầu vào spec.
- Khảo sát môi trường: Node 24.14.1, npm 11.11.0, specify 1.0.5.dev0, Docker 29.4.1, không psql host.
- Hỏi người dùng 4 quyết định → **Thorough / Payload CMS 3 monolith / frontend mới trong cms/frontend / PostgreSQL Docker**.
- `specify init --here --force --non-interactive --integration opencode --script ps --ignore-agent-tools` → **OK** (`.specify/` scaffold).

## 2026-10-09 · Phase 1 — Specification (Gate G1)
- Viết `.specify/memory/constitution.md` v1.0 (6 nguyên tắc: SEO preservation, server authority/contract, security/privacy, TDD, performance, UX + gate map G1–G4).
- Viết `.specify/specs/001-headless-cms-booking-seo/spec.md`: 8 user stories, 58 acceptance scenarios, 47 FR (A–E), 16 SC, 14 edge cases, assumptions D1–D12.
- **Inline spec review**: phát hiện tên stack (Payload/Next/Postgres) vi phạm §4 doc separation → gỡ sang `plan.md`, spec giữ wording trung tính → pass.
- **Gate G1**: user ✅ xác nhận spec + ✅ giữ toàn bộ mặc định D1–D12.

## 2026-10-09 · Phase 2 — Planning (Gate G2 — chờ xác nhận)
- Explore agent khảo sát `TestSEO/` hoàn tất → báo cáo đầy đủ (seed data, BookingForm gap, redirects, thiếu ảnh, 8 chỗ hardcode 150k) → ghi `findings.md` mục C.
- Viết `plan.md` (Technical Context, Constitution Check 9/9 ✅, Project Structure, AD-1…AD-13, Risks).
- Viết `data-model.md` (10 collections + 2 globals, bảng con, index, access roles, hooks).
- Viết `contracts/api.md` (envelope, error codes, rate limits, cache tags, 15 endpoint checklist).
- Viết `tasks.md` T001–T088 chia 12 phase, TDD-first (test fail → implement), đánh dấu [P] song song.
- Viết `task_plan.md`, `findings.md`, `progress.md` (file này) ở root.

### Evidence giai đoạn
```
specify init → "Project ready." (exit 0)
spec.md → 8 US / 58 AC / 47 FR / 16 SC (self-review pass)
plan.md Constitution Check → 9/9 checkpoint ✅, 0 violation
tasks.md → T001–T088, mọi task có file path + test point
```

---

## 2026-10-09 · Phase 3 — Fix toolchain + DB push + seed admin (evidence)
- **Encoding**: 3 file bị mojibake (double-encoded cp1252→UTF-8): `collections/Bookings/index.ts`, `scripts/pushSchema.ts`, `seed/seedAdmin.ts` → reverse round-trip cp1252,0 ký tự FFFD còn lại.
- **Typecheck**: sửa nốt datetime→date sót trong Bookings (pickupDatetime/notifiedAt/statusHistory.at), Pages `beforeDelete` chặn xóa trang system (APIError), Users access bỏ optional-chain sai → `tsc --noEmit` pass.
- **Runner**: `payload run` / `payload generate:types` hỏng trên Node 24.14 (payload issue #16949 — tsx `?namespace=` query phá resolver/undici) → chuyển backend sang `"type": "module"`, chạy script bằng `node --import tsx`; env load qua `loadEnv()` từ `payload/node`.
- **Schema**: `datetime → date` (field type) — lưu ý payload postgres map cả `date` và `datetime` → `timestamptz(3)` (drizzle `traverseFields.js case 'date'`), nên DB column timestamptz là đúng design; `date` đổi cách serialize/ngoại admin.

### Evidence
```
npm run typecheck      → exit 0
npm run db:push        → exit 0; psql \dt →33 tables (idempotent khi chạy lại)
npm run seed:admin     → "Đã tạo admin: admin@example.com"; psql users → id=1 role=admin
npm run generate:types → exit 0; src/payload-types.ts cập nhật17:48
next dev :3001         → GET /admin200 (compile43.8s), GET /api/users/me200
POST /api/users/login  →200, role=admin, token285 ký tự
npm test               →5 files /44 tests pass
```
---
*(Tiếp tục ghi ở đây khi Phase 3+ chạy — mỗi phase 1 entry + evidence command/kết quả.)*

---

## 2026-10-09/10 · Phase 4 — Implementation US1–US8 + Polish (các session trước, tổng hợp)

- US1 (T013–T025, T029): pricing engine (golden A1–A20), booking API + token + rate-limit, routes collection/API, seed routes+media. **CANCELLED** T026–T028 (frontend, pivot).
- US2 (T031, T034, T037, T040, T041): sitemap lib+tests, pages collection + endpoint (`chinh-sach--bao-mat`), priceValidUntil warning (virtual `priceValidUntilWarning`), seedPages. **CANCELLED** T030/T032/T033/T035/T036/T038/T039.
- US3 (T042–T044, T047): routes arrays/details + validate tests, list API `meta.regions`, seed media (16 ảnh TestSEO, alt bắt buộc). **CANCELLED** T045–T046.
- US4 (T049–T055): stateMachine + notify (Telegram retry + email fallback) + access roles (editor masked phone).
- US5 (T056–T059, T061): sanitize/TOC + tests, Articles collection, articles API, seed 2 bài. **CANCELLED** T060.
- US6 (T062–T065): redirectRules RD-1…RD-4 + tests, createRedirectOnSlugChange hook, redirects API. **CANCELLED** T066–T067.
- US7 (T068–T071): CompanySettings/PricingSettings globals, AirportPricing/DistanceRates validate, 4 endpoints. **CANCELLED** T072–T074.

## 2026-10-10 · Phase 11 — Hoàn tất backend (session này)

### T080 — Media `/media` + Sharp sizes ✅
- Config `imageSizes`: card 640w / hero 1600w / og 1200×630 crop-cover; bản gốc cap ≤2400px; `staticURL: '/media'`.
- **Live test** (upload banner.png 2400×1340 qua `POST /api/media`): original `banner-1.png` 2400×1340 · card `-640x357` · hero `-1600x893` · og `-1200x630` — mọi URL dưới `/media/*`, **0 file dưới `/api/`**. Xóa test doc → `DELETE 200`, file dọn sạch.

### T086 — Anonymize PII ✅ (fix operator)
- Bug: payload v3 chỉ nhận operator snake_case → đổi `createdAt.lessThan` → `less_than` trong `anonymizePii.ts`.
- `npm run anonymize:pii -- --dry-run` → exit 0, "0 đơn đủ điều kiện" (DB mới, đúng); validate `ANONYMIZE_MONTHS=0` bị chặn (phải ≥1). Doc FR-B08 đã có sẵn trong `README.md`.

### T048 — Seed scripts còn lại ✅
- Viết: `seedAirport.ts` (12 quận, upsert theo slug), `seedDistance.ts` (4 dải 0–30/31–100/101–200/201+), `seedRedirects.ts` (5 URL cũ từ next.config, `source='seed'`, 301), `seedCompany.ts` (`updateGlobal`, 6 cam kết + 2 phương thức + 4 đánh giá), `seedPricingSettings.ts` (`priceValidUntil=2027-12-31`), `seedUsers.ts` (editor/dispatcher), `seed.ts` tổng (spawn tuần tự 10 bước, exit ≠ 0 → dừng).
- package.json: thêm `seed:airport|distance|redirects|company|pricing|users`; sửa `seed` → `node --import tsx`.
- **Evidence (live DB)**: 6 script exit 0 → airport 12, distance 4, redirects 5, company hotline=0962.298.293, pricing parcel=150000/validUntil=2027-12-31, users 2.
- **API contract**: `/api/v1/pricing/airport` 200 (12) · `/pricing/distance` 200 (4 rates) · `/settings/company` 200 (derived `hotlineHref=tel:+84962298293`) · `/settings/pricing` 200 (`priceValidUntilWarning` có) · `/redirects` 200 (5 rules). Login `editor@example.com`/`dispatcher@example.com` → 200 đúng role.

### T077 — Revalidate webhook client + hooks ✅
- `src/lib/revalidate/webhookClient.ts`: `sendRevalidateEvent` (POST `{collection,slug,previousSlug,action}` + `x-revalidate-secret`, timeout 5s, không ném lỗi, không log secret), `fireAndForgetRevalidate` (void promise — không chặn admin), `resolveAfterChangeAction` (create/publish/unpublish/update), base URL `REVALIDATE_URL || FRONTEND_URL`.
- `src/collections/hooks/revalidateHooks.ts`: factory afterChange/afterDelete gắn cho đủ **8 collection/global** (routes, articles, pages, redirects via fromUrl, airport_pricing, distance_rates via label, company_settings, pricing_settings — globals không slug).
- `tests/revalidate.client.test.ts`: 13 test (action mapping, body contract §5.5, thiếu env → không gọi fetch, HTTP 200 → ok, fetch throw → ok:false, fire-and-forget không throw).

### T081/T083 — Admin security + branding ✅ (đã có từ session trước, xác minh lại)
- `middleware.ts` set `X-Robots-Tag: noindex, nofollow` cho `/admin`; `tests/admin.security.test.ts` 4 test xanh.

### T085 — Full verification backend ✅
```
npm run typecheck  → exit 0
npm test           → 22 files / 332 tests PASSED (14s)
npm run build      → exit 0 — "Compiled successfully", 21 routes
                     (gồm /media/[...path], đủ 15 endpoint /api/v1 + /admin)
```
- Fix 2 lỗi build phát hiện: (1) `pages/[slug]/route.ts` export helper `normalizeSlug/resolvePageSlug/serializePage` → chuyển sang `pages/serialize.ts` (Next chỉ cho export route handler/config); (2) `articles/route.ts` export `ARTICLES_CACHE_HEADERS` → chuyển sang `articles/serialize.ts`. Sửa luôn mojibake category labels articles (`Khuyến mãi`, `Tin tuyến & Báo giá` theo TestSEO) + comment.
- Lưu ý: backend không có script `lint` riêng — `next build` đã chạy lint + type validation.

### T087 — Smoke nghiệm thu (dev server :3001, sau khi build)
```
GET /admin                      → 200, X-Robots-Tag: noindex, nofollow
GET /api/v1/seo/sitemap         → 200, 20 entries
GET /media/banner.webp          → 200 image/webp (không nằm dưới /api/)
GET /api/media/banner.webp      → 500 (đúng — file không phục vụ dưới /api/)
GET /api/v1/pricing/airport     → 200, 12 quận
GET /api/v1/redirects           → 200, 5 rules
```

### Evidence giai đoạn (tổng)
```
seed (6 script mới)     → exit 0; API 200 đúng số bản ghi; login editor/dispatcher 200
anonymize:pii --dry-run → exit 0 (operator less_than fix)
typecheck               → exit 0
npm test                → 22 files / 332 tests PASSED
npm run build           → exit 0 (21 routes)
smoke /admin + 5 API    → toàn bộ đúng contract (xem trên)
```

---

## 2026-10-10 · Gate G4 — Nghiệm thu ✅

- User xác nhận nghiệm thu: "okie nhé".
- Re-verify cuối trước khi chốt:
  ```
  npm test           → 22 files / 332 tests PASSED
  npm run typecheck  → exit 0
  GET /admin         → 200, X-Robots-Tag: noindex, nofollow
  GET /api/v1/redirects / settings/company / pricing/airport / seo/sitemap → 200 đúng contract
  ```
- 88/88 task tick trong tasks.md; task_plan.md cập nhật trạng thái toàn bộ phase.
- **Kết quả dự án**: Backend Payload CMS 3 monolith (`cms/backend`) — 10 collections + 2 globals, 15 endpoint REST `/api/v1`, admin `/admin` (branding "Xe Ghép Liên Tỉnh"), media `/media/*` sharp sizes, seeds đầy đủ (idempotent), anonymize PII, revalidate webhook hooks.
- **Đã hủy theo pivot**: frontend public-site (site TestSEO ngoài repo tự nối API + webhook receiver `REVALIDATE_URL` khi cần).

**PROJECT CLOSED — Gate G4 passed.**


---

## 2026-10-11 · Feature 002: Frontend Admin CMS (`admin/`)

### Phase 0 & 1 — Specification (Gate G1 ✅)
- Người dùng yêu cầu xây dựng Frontend Admin CMS dựa trên backend có sẵn.
- Khảo sát backend: Payload CMS 3 (port 3001) với 10 collections và 2 globals, auth JWT, 15 API endpoints.
- Làm rõ yêu cầu: React 19 + Vite + TypeScript + Tailwind CSS + shadcn/ui + TanStack Query, thư mục `admin/`, đầy đủ các phân hệ quản trị + RBAC (admin, editor, dispatcher).
- Soạn thảo `.specify/specs/002-admin-cms-frontend/spec.md` (8 User Stories, AC1.1–AC8.2). Inline review pass.
- User xác nhận: "oke" -> Gate G1 passed.

### Phase 2 — Planning (Gate G2 ✅)
- Soạn thảo `.specify/specs/002-admin-cms-frontend/plan.md` (Constitution Checkpoints CP-1...CP-7, Bản đồ cấu trúc file, Rủi ro & Kiểm soát).
- Soạn thảo `.specify/specs/002-admin-cms-frontend/tasks.md` (T101–T122 chia 9 giai đoạn, TDD-first).
- Cập nhật `task_plan.md` theo dõi tiến độ T101–T122.

### Phase 3, 4 & 5 — Implementation & Verification (Gate G4 ✅)
- Triển khai toàn bộ 22 nhiệm vụ (T101–T122) theo chiến lược Subagent-Driven Development:
  - **T101**: Scaffolding dự án `admin/` bằng Vite 6 + React 19 + TypeScript + Tailwind CSS + Vitest + reverse proxy `/api` và `/media` tới `:3001`.
  - **T102**: Định nghĩa hệ thống Types TypeScript đồng bộ 100% với backend Payload CMS (Auth, Routes, Articles, Pages, Bookings, Drivers, Media, Settings, Redirects).
  - **T103**: Bộ tiện ích định dạng VND, format ngày giờ Việt Nam, mask số điện thoại, và Booking State Machine (26 unit tests).
  - **T104**: Lớp API Client Axios tự động gắn JWT Bearer token, interceptor bắt lỗi 401 tự động logout, chuẩn hóa message tiếng Việt.
  - **T105**: AuthContext (`useAuth`) và trang `LoginPage` giao diện hiện đại với icon Lucide.
  - **T106**: `ProtectedRoute` & `RoleGuard` bảo vệ định tuyến và phân quyền (Admin / Editor / Dispatcher).
  - **T107**: `DashboardLayout` kết nối Sidebar điều hướng phân quyền động, Header, Breadcrumbs, xác nhận đăng xuất.
  - **T108**: Bộ UI Primitives & Components dùng chung (`Button`, `Input`, `Dialog`, `StatusBadge`, `ConfirmDialog`, `DataTable` phân trang và tìm kiếm).
  - **T109**: Thư viện Media (`MediaGallery`, `MediaUploadModal` với bắt buộc Alt text cho SEO và trợ năng).
  - **T110**: `MediaPickerModal` chọn ảnh tái sử dụng trực tiếp trong các form.
  - **T111**: `RichTextEditor` xuất HTML chuẩn kèm tự sinh id cho thẻ H2 phục vụ TOC, và `SeoPreview` thanh đếm độ dài + Google SERP simulator.
  - **T112**: Quản lý Bài viết (`ArticleList`, `ArticleForm` với danh mục, slug, cảnh báo 301 khi sửa slug bài published).
  - **T113**: Quản lý Trang (`PageList`, `PageForm` bảo vệ không cho xóa trang kind='system', soạn nội dung trang kind='content').
  - **T114**: Danh sách Tuyến đường (`RouteList` với banner top, bộ lọc vùng miền, định dạng giá cước).
  - **T115**: Form Tuyến đường (`RouteForm`, `PricingTiersSection` 4 hạng vé, tự tính `priceFrom`, điểm đón/trả, FAQs, cảnh báo 301 khi sửa slug tuyến active).
  - **T116**: Quản lý Đơn đặt xe (`BookingList`, `BookingDetailModal`, tự động mask số điện thoại khách đối với vai trò editor).
  - **T117**: Chuyển trạng thái tuân thủ nghiêm ngặt Booking State Machine (`StatusTransitionActions`) và Quản lý Tài xế (`DriverList`, `DriverFormModal`).
  - **T118**: Cấu hình Doanh nghiệp (`CompanySettingsForm`), Giá chung (`PricingSettingsForm`), Bảng giá Sân bay 12 quận (`AirportPricingTable`), Bảng giá km (`DistanceRatesTable`).
  - **T119**: Quản lý Chuyển hướng 301 (`RedirectList`, `RedirectFormModal` chống vòng lặp from===to) và Giám sát Sitemap (`SitemapMonitor`).
  - **T120**: Quản lý Tài khoản Quản trị (`UserList`, `UserFormModal`, chống tự xóa chính mình).
  - **T121**: Bảng điều khiển Tổng quan (`DashboardOverview` với KPI cards, quick actions theo role, widget đơn chờ xử lý).
  - **T122**: Tích hợp toàn diện, mở rộng CORS/CSRF backend, cập nhật README, verify build & test.

### Evidence nghiệm thu (Gate G4 Verification):
```
admin/ npm test           → 18 test files / 219 tests PASSED (100% GREEN)
admin/ npm run typecheck  → exit 0 (0 errors)
admin/ npm run build      → exit 0 (Vite build dist/ thành công trong 6.36s)
backend/ npm test         → 22 test files / 332 tests PASSED (100% GREEN)
Tổng số test toàn dự án   → 40 test files / 551 tests PASSED (100% GREEN)
```

**FEATURE 002 (Admin CMS Frontend) COMPLETED — Gate G4 Passed.**

---

## 2026-10-12 · Feature 003: Loại Bỏ Nghiệp Vụ Tài Xế (Driver)

### Phase 0 & 1 — Specification (Gate G1 ✅)
- Yêu cầu người dùng: `/spec-first-superpowers Hãy bỏ đi logic nghiệp vụ liên quan đến driver`.
- Khảo sát & làm rõ:
  1. State machine: Bỏ trạng thái `assigned`. Luồng mới: `pending` -> `confirmed` -> `in_progress` -> `completed` (hủy `cancelled` từ các trạng thái chưa kết thúc).
  2. Thực thể Driver: Xóa bỏ collection `Drivers`, gỡ trường quan hệ `driver` trong `Bookings`, xóa hàm `driverIsActive`, cập nhật mô tả quyền của `dispatcher` trong `Users`.
  3. Lý do hủy: Bỏ `no_driver` khỏi `CancelReason` (chỉ giữ `customer_cancel`, `unreachable`, `other`).
  4. Giao diện Admin: Xóa module `features/drivers`, route `/drivers`, menu Sidebar "Tài xế", cột "Tài xế" trong `BookingList`, modal gán tài xế trong `StatusTransitionActions`, khối thông tin tài xế trong `BookingDetailModal`, thay KPI tài xế trên Dashboard bằng "Đơn hoàn thành".
- Soạn thảo `.specify/specs/003-remove-driver-logic/spec.md` (4 User Stories, AC1.1–AC4.2). Inline review pass (Gate G1 ✅).

### Phase 2 — Planning (Gate G2 ✅)
- Soạn thảo `.specify/specs/003-remove-driver-logic/plan.md` (Checkpoints CP-§2.2 Server Authority, CP-§2.3 Data Integrity, CP-§2.4 TDD, CP-§2.6 UI/UX).
- Soạn thảo `.specify/specs/003-remove-driver-logic/tasks.md` (T201–T212 chia 4 nhóm, TDD-first).
- Khởi tạo `task_plan.md` cho feature 003, ghi nhận `findings.md` mục H.

### Phase 3, 4 & 5 — Implementation & Verification (Gate G4 ✅)
- **T201–T205 (Backend)**:
  - Cập nhật Red tests `backend/tests/booking.stateMachine.test.ts` & `tests/api.endpoints.test.ts`.
  - Cập nhật máy trạng thái `backend/src/lib/booking/stateMachine.ts` & `backend/src/lib/api/serialize.ts`.
  - Cập nhật collection `backend/src/collections/Bookings/index.ts` (bỏ `driverIsActive`, hook validation, trường `driver`, options `assigned`/`no_driver`).
  - Xóa collection `backend/src/collections/Drivers/`, gỡ khỏi `payload.config.ts`, cập nhật mô tả quyền trong `Users/index.ts` & `shared/access.ts`.
  - Chạy `npm run generate:types` sinh lại `payload-types.ts` sạch sẽ.
  - Verification Backend: 22 test files / 330 tests PASSED; `npm run typecheck` exit 0.
- **T206–T211 (Admin Frontend)**:
  - Cập nhật Types `admin/src/types/bookings.ts`, xóa `drivers.ts`, gỡ export trong `types/index.ts`.
  - Đồng bộ máy trạng thái `admin/src/lib/stateMachine.ts` và cập nhật Red test `stateMachine.test.ts`.
  - Xóa module `features/drivers/` (`DriverList.tsx`, `DriverFormModal.tsx`), gỡ route `/drivers`, gỡ menu Sidebar "Tài xế" (đổi logo icon sang `MapPin`).
  - Cập nhật `StatusTransitionActions.tsx` (chuyển thẳng `confirmed` -> `in_progress`, bỏ `no_driver`), `BookingDetailModal.tsx` (bỏ khối tài xế), `BookingList.tsx` (bỏ cột driver, bỏ lọc assigned), `StatusBadge.tsx` (gỡ status driver).
  - Cập nhật `DashboardOverview.tsx` (thay KPI tài xế bằng "Đơn hoàn thành", tối ưu API fetch).
  - Cập nhật toàn bộ test suite admin (`drivers.test.tsx` đã xóa, cập nhật `layout.test.tsx`, `bookings.test.tsx`, `dashboard.test.tsx`, `components.test.tsx`).
- **T212 (Full Build & Verification)**:
  - Chạy build kiểm tra cả backend và admin.

### Evidence nghiệm thu (Gate G4 Verification):
```
backend/ npm test         → 22 test files / 330 tests PASSED (100% GREEN)
backend/ npm run typecheck→ exit 0 (0 errors)
admin/ npm test           → 17 test files / 209 tests PASSED (100% GREEN)
admin/ npm run build      → exit 0 (tsc && vite build thành công trong 5.47s)
Tổng số test toàn dự án   → 39 test files / 539 tests PASSED (100% GREEN)
```

**FEATURE 003 (Remove Driver Logic) COMPLETED — Gate G4 Passed.**

---

## 2026-10-12 · Feature 004: Quản trị Cấu hình Gửi Thông Báo Tự Động (004-notification-config)

### Phase 0 — Session init & Clarification
- Tiếp nhận yêu cầu: "Thêm chức năng cấu hình gửi notify".
- Khảo sát hiện trạng: `backend/src/lib/notify/` hiện đọc tĩnh từ `process.env`. `admin/src/features/settings` đã có tabs Company & Pricing.
- Clarification với người dùng qua interactive modal:
  1. Hỗ trợ Telegram (Bot Token, Chat ID) & Email Fallback (Webhook, Email nhận) + Nút gửi tin nhắn test.
  2. Lưu trữ cấu hình trong Payload Global `notification_settings`, quản trị trên Admin CMS.
  3. Mức độ phức tạp: Standard.

### Phase 1 & 2 — Specification & Planning (Gate G1 / G2 ✅)
- Khởi tạo tài liệu SDD:
  - Spec: `.specify/specs/004-notification-config/spec.md` (4 User Stories, AC1.1–AC4.2, tuân thủ phân tách What & Why).
  - Plan: `.specify/specs/004-notification-config/plan.md` (Checkpoints CP-§2.2 đến CP-§2.6, schema Global, API contract `POST /api/v1/notify/test`, TDD plan).
  - Tasks: `.specify/specs/004-notification-config/tasks.md` (T301–T311).
- Cập nhật `task_plan.md`, `findings.md` mục I, `progress.md`.
- Inline spec self-review: Kiểm tra không chứa code/framework trong spec, không mâu thuẫn constitution, phân quyền an toàn `read/write: isAdmin` §2.3 → **PASS**.
- Gate G1: Người dùng phê duyệt spec ("okie") → chuyển sang thực thi.

### Phase 4 & 5 — Implementation & Verification (Gate G4 ✅)
- **T301–T305 (Backend)**:
  - Viết Red tests `backend/tests/notify.settings.test.ts` (13 tests) kiểm thử schema Global, quyền admin, fallback env, và endpoint gửi test.
  - Tạo Global `backend/src/globals/NotificationSettings.ts` (slug `notification_settings`, `read: isAdmin`, `update: isAdmin`) và đăng ký trong `backend/src/payload.config.ts`.
  - Cập nhật `telegram.ts` & `email.ts` nhận options token/chatId/webhook/to động.
  - Cập nhật `worker.ts` với `loadNotificationConfig` đọc cấu hình từ Global với fallback env và kiểm tra `telegramEnabled`/`emailEnabled`.
  - Triển khai endpoint `backend/src/app/api/v1/notify/test/route.ts` hỗ trợ gửi test Telegram/Email với quyền Admin và định dạng envelope.
  - Cập nhật `payload-types.ts` qua `npm run generate:types`.
  - Verification Backend: `npm test` pass 23 files / 343 tests (100% GREEN); `tsc --noEmit` exit 0; `next build` pass exit 0 (compile 2.6min, 21 routes).
- **T306–T310 (Admin Frontend)**:
  - Viết Red tests `admin/src/tests/notification.settings.test.tsx` (5 tests) kiểm thử form, lưu cấu hình, gửi test Telegram/Email và tab navigation.
  - Định nghĩa types `NotificationSettings` trong `admin/src/types/settings.ts`.
  - Xây dựng component `admin/src/features/settings/NotificationSettingsForm.tsx` với switch toggle, mask token Telegram, nút test và thông báo phản hồi.
  - Tích hợp tab `Cấu hình Thông báo & Bot` (`notification`) với icon `Bell` trong `admin/src/features/settings/SettingsPage.tsx`.
  - Verification Frontend: `npm test` pass 18 files / 214 tests (100% GREEN); `npm run build` pass exit 0 (tsc && vite build thành công).
- **T311 (Full Build & Verification)**:
  - Toàn bộ test suite và build 2 phân hệ đều xanh 100%.

### Evidence nghiệm thu (Gate G4 Verification):
```
backend/ npm test         → 23 test files / 343 tests PASSED (100% GREEN)
backend/ npm run typecheck→ exit 0 (0 errors)
backend/ npm run build    → exit 0 (Next.js 15 route /api/v1/notify/test created)
admin/ npm test           → 18 test files / 214 tests PASSED (100% GREEN)
admin/ npm run build      → exit 0 (tsc && vite build thành công trong 7.44s)
Tổng số test toàn dự án   → 41 test files / 557 tests PASSED (100% GREEN)
```

**FEATURE 004 (Notification Configuration) COMPLETED — Gate G4 Passed.**


