# Findings — Headless CMS + Booking + SEO

## A. Môi trường (khảo sát 2026-10-09)

- Node v24.14.1, npm 11.11.0, uv 0.12.9, **specify 1.0.5.dev0** (đã cài), **Docker 29.4.1** (Postgres chạy được), không có `psql` trên host.
- `specify init --integration opencode` cần `--ignore-agent-tools` (binary `opencode không nằm trên PATH dù đang chạy trong opencode).
- Working dir `cms/` trống → mode mặc định theo heuristic: **Spec-Kit** (đã ghi `.spec-mode`).

## B. Quyết định của người dùng (Gate G0/pre-G1)

| # | Quyết định | Chọn |
|---|---|---|
| 1 | Complexity | **Thorough** |
| 2 | Backend architecture | **Payload CMS 3 monolith** (`cms/backend`, admin `/admin`, API `/api/v1`) |
| 3 | Frontend | ~~Tạo mới trong `cms/frontend`~~ → **PIVOT 2026-10-10: xóa `frontend/`; site TestSEO public đã dựng sẵn ngoài repo, tự nối `/api/v1` sau. Admin = `/admin` Payload + branding** |
| 4 | Database | **PostgreSQL Docker** |
| 5 | Gate G1 | ✅ Xác nhận spec |
| 6 | Điểm nghiệp vụ D1–D12 | ✅ **Giữ toàn bộ mặc định spec v1.1** |

## C. Khảo sát `TestSEO/` — nguồn seed & design (báo cáo explore)

### Dữ liệu seed
- `src/data/routes.ts`: **9 tuyến** (`POPULAR_ROUTES`), giá text (`"400k – 500k"`, `"từ 899k"`, `"Liên hệ thỏa thuận"`), `priceFrom` number; `BANNER_TOP_ROUTES` = 7 (dùng nhãn "⇔" khác "⇄" của name → giữ ở `bannerLabel`).
- Slug 9 tuyến: `hai-phong-bac-ninh-bac-giang`, `hai-phong-ha-noi-noi-bai`, `hai-phong-ha-long`, `hai-phong-mong-cai`, `ha-long-bac-ninh-bac-giang`, `ha-noi-mong-cai`, `ha-noi-ha-long`, `hai-phong-hai-duong`, `hai-phong-thai-nguyen`.
- `company-info.ts`: COMPANY_INFO (16 field), SIX_COMMITMENTS (6, icon lucide), PAYMENT_METHODS (2), TESTIMONIALS (4).
- `articles.ts`: **2 bài** (`kinh-nghiem-dat-xe-ghep-lien-tinh-tiet-kiem` → `/photo02.avif`, `bang-gia-xe-ghep-lien-tinh-moi-nhat-2026` → `/photo01.avif`), content HTML string + TOC sẵn.
- `airport-pricing.ts`: **12 quận**; `long-distance-pricing.ts`: **4 dải km** + 4 policy text.
- **Nằm ngoài `src/data/`** (phải lấy từ components): `ROUTE_SLIDES_MAP` + `DEFAULT_SLIDES` (`components/routes/RouteImageSlideshow.tsx`), `ROUTE_LOCATION_IMAGES` (`components/home/RoutePricingGrid.tsx`) — 9 thumbnail map.

### SEO hiện tại
- `src/lib/seo.ts`: `SITE_DOMAIN=https://xegheplientinh.vn`, `BRAND_NAME`, `DEFAULT_OG_IMAGE=/images/og-xe-ghep-lien-tinh.webp` (**file này KHÔNG tồn tại trong public/**), `constructMetadata`.
- `src/lib/schema.ts`: global @graph (Organization + TaxiService `priceRange "150.000đ - 2.500.000đ"` hardcode + WebSite), Breadcrumb, Service+Offer **`priceValidUntil: "2026-12-31"` hardcode**, Article.
- `app/robots.ts`: disallow `/dat-xe/thanh-cong` (thiếu `/admin`, `/api/` — spec F10).
- `app/sitemap.ts`: 19 URL tĩnh (8 static + 9 routes + 2 articles).
- Root layout: title template `%s | Xe Ghép Liên Tỉnh`, **không canonical ở root** (SEO-6 đã tuân sẵn).

### Redirects (next.config.ts) — 5 cái cần seed rồi xóa (RD-6)
1. `/dich-vu-xe-ghep` → `/tuyen-lien-tinh`
2. `/bang-gia` → `/tuyen-lien-tinh`
3. `/taxi-dua-don-san-bay-noi-bai` → `/tuyen-lien-tinh/hai-phong-ha-noi-noi-bai`
4. `/taxi-duong-dai` → `/tuyen-lien-tinh`
5. `/dang-ky-doi-tac` → `/lien-he`
- `remotePatterns` hiện chỉ có `images.unsplash.com` → phải thêm host backend (F11).

### BookingForm (`components/booking/BookingForm.tsx`, 830 dòng)
- Props: `initialOrigin, initialDestination, initialRouteSlug, title, compact, variant`.
- **Không có ô `note`** (F2) · phone regex cũ **cho phép `01x`** (F4) · `datetime-local` không kèm offset (F4) · **không submit network, không navigate** sang `/dat-xe/thanh-cong` (gap lớn — trang tồn tại nhưng không ai link tới).
- `calculatePriceEstimate`/`findMatchingRoute` là hàm private **bên trong component** → thay bằng API (F2/F5).
- Success panel hiển thị hotline; trang `/dat-xe/thanh-cong` đọc query string + có dữ liệu mẫu `HP886699` (F6).

### Test hiện có (`tests/`, Vitest — 4 file import `src/`)
`pricing.test.ts` (9 tuyến + 7 banner), `routes-metadata.test.ts`, `seo.test.ts` (slugify/formatVND/noindex thanh-cong), `schema.test.ts` → port sang contract tests (F1).

### Ảnh `public/` (flat)
`BacGiang/BacNinh/HaiPhong/HaLong/HaNoi/MongCai/NoiBai` (jpg+webp), `banner.png/webp`, `banner2.avif/webp`, `photo01–04.avif`, `letan`, `tongdai`.
**THIẾU**: `/images/og-xe-ghep-lien-tinh.webp`, `/images/logo-xe-ghep-lien-tinh.png`, `favicon.ico` (đều được khai báo trong layout/seo/schema) → T083 phải tạo.

### Hardcode "150.000đ/150k" — 8 vị trí (F14 → T073)
`BookingForm.tsx:123,698` · `tuyen-lien-tinh/[slug]/page.tsx:221` · `HeroSection.tsx:104` · `gioi-thieu/page.tsx:216` · `data/routes.ts:64` · `data/company-info.ts:124` · `data/articles.ts:69,78,79` · `lib/schema.ts:78`.

### Chính sách (F8)
`chinh-sach/*` = **JSX hardcode**; `dam-bao` map `SIX_COMMITMENTS`, `thanh-toan` map `PAYMENT_METHODS`, `bao-mat` thuần JSX → chuyển sang `pages.content` (seed từ JSX), phần map vẫn render từ settings.

### Lỗi nội dung cần sửa khi parity (F13)
- `IntroTeaser`: nhãn "Móng Cái ⇄ Hạ Long ⇄ Hải Phòng ⇄ Hà Nội" link sai tuyến; nhãn "Hà Nội ⇄ Bắc Ninh ⇄ Bắc Giang" link `ha-long-bac-ninh-bac-giang`.

## D. Điểm kỹ thuật đã chốt trong plan.md

- **AD-6 (proxy production)**: `/api/v1/webhooks/*` route → **frontend** (vì dùng `next/cache`), còn lại `/api/v1/*` → backend. Dev tách port 3000/3001 nên tự nhiên không conflict.
- **AD-8**: outbox = bảng payload (jobs) + worker in-process — không引入 Redis (đơn giản, dev 1 instance); Phase 2 nếu scale → queue thật.
- **AD-9**: rate limit in-memory — chấp nhận được single instance; ghi nhận nếu multi-instance → Redis (deviation phải hỏi người dùng).
- **lookupToken không lưu DB** — tính lại bằng HMAC mỗi lần xác thực (đơn giản, không rò rỉ token trong DB).
- **media**: `staticURL: '/media'` để thoát `Disallow: /api/`.

## E. [CẦN CHỐT] D1–D12 — người dùng chọn GIỮ MẶC ĐỊNH (2026-10-09)

D1 km cả quãng · D2 hủy trước 30p · D3 không cọc · D4 ghép2 = ×2 · D5 ≥3 → bao xe 4/5 chỗ · D6 lễ/tết chỉ hiển thị · D7 giảm 10% chỉ hiển thị · D8 không geocoding (quote_required) · D9 Telegram + email · D10 `/admin` cùng domain · D11 appendBrand mặc định bật · D12 nhắc <30 ngày.

## F. Deviations / mở rộng so với spec (cập nhật khi implement)

1. **PIVOT 2026-10-10 (user xác nhận)**: không build `frontend/` — site public TestSEO dùng sẵn; backend giữ nguyên hợp đồng `/api/v1`. Mọi task frontend trong tasks.md đã strike-through CANCELLED.
2. **Operator payload v3**: where date dùng snake_case (`less_than`, `greater_than`…) — camelCase (`lessThan`) bị `validateQueryPaths` reject 400 (gây fail `anonymizePii` đầu tiên).
3. **Route file exports**: Next.js 15 chỉ cho export route handler + config (`dynamic`, …) — helper/const dùng chung phải chuyển sang file `serialize.ts` sibling (đã làm cho `pages/[slug]` và `articles`).
4. **`REVALIDATE_URL` env mới** (ngoài `.env.example` gốc): backend cần biết URL site public để gọi webhook (spec giả định frontend cùng repo — nay tách riêng). Fallback `FRONTEND_URL`.
5. **Backend không có script `lint` riêng** — `next build` đóng vai trò lint + type-check; ghi nhận trong README.
6. **Seed orchestrator** (`seed.ts`) spawn process từng script (thay vì import in-process) vì các seed cũ là standalone script có `process.exit` — giữ nguyên, idempotent.
7. **Media docs cũ (seed trước khi có imageSizes)** không có `sizes.card/hero/og` — frontends phải fallback `url` gốc; seed lại `seed:media` sẽ update alt nhưng không regenerate sizes (cần upload lại nếu muốn đủ sizes).

## G. Trạng thái cuối (2026-10-10)

- **Backend hoàn tất scope pivot**: 10 collections + 2 globals, 15 endpoint `/api/v1`, `/admin` branding + noindex, media `/media` + sharp sizes, 10 script seed, anonymize PII, revalidate client + hooks 8 nguồn.
- **Tests**: 22 files / 332 tests xanh · typecheck xanh · `next build` xanh (21 routes).
- **DB (Docker)**: đã seed — 9 routes, 16 media, 9 pages, 2 articles, 12 airport, 4 distance, 5 redirects, 2 globals, admin+editor+dispatcher.
- **Chờ**: site TestSEO nối `/api/v1` + dựng webhook receiver theo spec §5.5 (dùng `REVALIDATE_SECRET`); object storage cho media khi deploy production (spec §6.3 — hiện lưu local `backend/media/`).

## H. Quyết định loại bỏ nghiệp vụ Driver (Feature 003 — 2026-10-12)

- **Trạng thái assigned**: Loại bỏ hoàn toàn khỏi luồng đơn đặt xe. Luồng mới: `pending` -> `confirmed` -> `in_progress` -> `completed` (hủy `cancelled` từ các trạng thái chưa kết thúc).
- **Collection Drivers**: Xóa bỏ hoàn toàn khỏi Backend Payload CMS (`payload.config.ts`, `collections/Drivers/`, trường `driver` trong `Bookings`).
- **Lý do hủy đơn**: Bỏ `no_driver` ("Không có tài xế") khỏi danh sách lý do hủy (chỉ giữ `customer_cancel`, `unreachable`, `other`).
- **Giao diện Admin**: Gỡ bỏ menu "Tài xế" (`/drivers`), module `features/drivers`, modal gán tài xế `DriverAssignModal`, khối tài xế trong `BookingDetailModal`. Đổi hành động tiếp theo của `confirmed` thành chuyển thẳng sang `in_progress`.

## I. Cấu hình gửi Thông báo Tự Động (Feature 004 — 2026-10-12)

- **Quyết định lưu trữ**: Tạo Payload Global `notification_settings` (`NotificationSettings.ts`).
- **Phân quyền truy cập**: `read: isAdmin`, `update: isAdmin` để bảo mật Telegram Bot Token và Email Webhook URL. Tuyệt đối không cho phép truy cập công khai.
- **Kênh thông báo**:
  1. Telegram Bot: Bot Token, Chat ID, Bật/Tắt gửi Telegram.
  2. Email Fallback: Webhook URL, Email người nhận, Bật/Tắt kênh email fallback khi Telegram lỗi 3 lần.
- **Dự phòng biến môi trường**: Worker và API test ưu tiên lấy cấu hình lưu trong database global; nếu để trống hoặc chưa cấu hình sẽ fallback về `process.env.TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `NOTIFY_EMAIL_WEBHOOK`, `NOTIFY_EMAIL_TO` để tránh gián đoạn dịch vụ.
- **Gửi thử nghiệm**: Cung cấp API `POST /api/v1/notify/test` và các nút "Gửi thử nghiệm Telegram", "Gửi thử nghiệm Email" trên giao diện Admin CMS (Tab Cấu hình Thông báo) với phản hồi kết quả trực quan ngay lập tức.

