# Tasks: Headless CMS, Booking Engine & SEO Management Platform

**Input**: Design documents from `.specify/specs/001-headless-cms-booking-seo/` (spec.md, plan.md, data-model.md, contracts/api.md)

**Prerequisites**: plan.md ✅ · spec.md ✅ (G1) · data-model.md ✅ · contracts/api.md ✅

**Tests**: Bắt buộc (Constitution §2.4) — test viết **trước** implementation, phải fail trước khi implement.

**Organization**: Tasks grouped by user story (US1–US8 theo spec) để mỗi story kiểm thử độc lập.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: song song được (file khác, không phụ thuộc)
- **[Story]**: US1–US8
- Path convention: `backend/src/…`, `frontend/src/…` (repo root = `cms/`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Khởi tạo repo 2 ứng dụng + DB + env

- [x] T001 Tạo cấu trúc repo per plan.md: `backend/`, `frontend/`, `docker-compose.yml` (Postgres 16, port 5432, db `cms`), `.gitignore` root (node_modules, .next, media/, .env), `README.md` (cách chạy 2 app + seed)
- [x] T002 [P] Init `backend/package.json`: deps `payload@3 @payloadcms/next @payloadcms/db-postgres next@15 react@19 sanitize-html sharp zod`; scripts `dev` (port 3001), `build`, `test` (vitest), `seed`, `lint`, `typecheck`; `tsconfig.json` strict
- [x] ~~T003~~ CANCELLED (pivot 2026-10-10 — frontend/TestSEO ngoài repo) [P] Init `frontend/package.json` từ TestSEO (next@15 react@19 tailwind@3.4 lucide-react vitest), scripts dev port 3000; copy `tailwind.config.ts`, `postcss.config.mjs`, `design-system/MASTER.md` từ `TestSEO/`
- [x] T004 [P] `backend/.env.example` + `frontend/.env.example`: `DATABASE_URI`, `PAYLOAD_SECRET`, `PAYLOAD_PUBLIC_SERVER_URL`, `FRONTEND_URL`, `REVALIDATE_SECRET`, `LOOKUP_SECRET`, `IP_SALT`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `NOTIFY_FALLBACK_EMAIL`, `CMS_URL`
- [x] T005 [P] `backend/tests/setup.ts` + vitest config ở cả 2 app (`npm test` chạy được ngay, chưa có test → pass trivial)

**Checkpoint**: Repo scaffold xong, `docker compose up -d` chạy Postgres, `npm install` 2 app thành công.

---

## Phase 2: Foundational (Blocking)

**Purpose**: DB schema + hợp đồng API + SEO group — mọi story phụ thuộc

- [x] T006 `backend/payload.config.ts` + `backend/src/collections/*`: khai báo đủ 10 collections + 2 globals theo data-model.md (fields đầy đủ, access roles admin/editor/dispatcher, indexes theo mục 6.4)
- [x] T007 [P] `backend/src/lib/api/envelope.ts` + `errors.ts`: helper `ok(res,data,meta?)`, `fail(res,code,http,fields?)` đúng contract §0 contracts/api.md
- [x] T008 [P] `backend/src/lib/api/rateLimit.ts`: token-bucket in-memory theo rule (5/30/10/120 per phút) + `Retry-After` header; `backend/src/lib/api/idempotency.ts` (bảng `idempotency_keys`, TTL 10 phút)
- [x] T009 `backend/src/collections/shared/seoFieldGroup.ts`: tái tạo group field spec §2.2 (metaTitle validate ≤70 gồm hậu tố, appendBrand default true, metaDescription ≤160, ogImage→media, noindex) — áp routes/articles/pages
- [x] T010 [P] `backend/src/lib/seo/slugify.ts`: bỏ dấu, `đ→d`, lowercase, `-`; unit tests `backend/tests/slugify.test.ts`
- [x] T011 Chạy migration đầu tiên + `backend/src/seed/seedAdmin.ts` (tạo user `admin` từ env) → `/admin` boot được, đăng nhập được
- [x] T012 [P] Test contract nền: `backend/tests/api.contract.test.ts` — assert envelope thành công/lỗi cho 1 endpoint mẫu (fail → chờ endpoint)

**Checkpoint**: Foundation ready — user story bắt đầu được.

---

## Phase 3: User Story 1 — Báo giá realtime & Đặt xe (P1) 🎯 MVP

**Goal**: Khách xem giá ngay, đặt xe, nhận mã vé, tra lại ở trang thành công.

**Independent Test**: `npm test` backend chạy golden cases A1–A20 + POST /bookings trả 201 hợp lệ; frontend đặt xe được end-to-end.

### Tests for US1 (viết TRƯỚC — phải FAIL)

- [x] T013 [P] [US1] `backend/tests/pricing.golden.test.ts`: 20 case A1–A20 theo Phụ lục A (input → priceType/estimatedMin/estimatedMax/displayPrice) — **FAIL**
- [x] T014 [P] [US1] `backend/tests/booking.validate.test.ts`: normalize phone (`+84…`, `0962.298.293`), regex `^(03|05|07|08|09)\d{8}$`, PICKUP_TIME_TOO_SOON (now+15p), passenger 1–3, guihang bỏ rideType, datetime không offset → UTC+7, honeypot, note strip HTML — **FAIL**
- [x] T015 [P] [US1] `backend/tests/booking.code.test.ts`: mã `XG-YYMMDD-` + 6 ký tự từ bảng `23456789ABCDEFGHJKMNPQRSTUVWXYZ`, không chứa 0/O/1/I/L, retry khi trùng, lookupToken = HMAC 16 ký tự, phoneLast4 match — **FAIL**

### Implementation for US1

- [x] T016 [US1] `backend/src/lib/pricing/formatTier.ts`: `vnd`, `shortK`, `formatTier(tier, style)` đúng spec §3.2.1 (negotiable → "Liên hệ thỏa thuận", from → "từ …", range → "a – b")
- [x] T017 [US1] `backend/src/lib/pricing/matchRoute.ts`: `norm()` (bỏ dấu, bỏ ngoặc, lower) + scoring alias 2 chiều, chọn alias dài nhất, hòa theo sortOrder (PR-2)
- [x] T018 [US1] `backend/src/lib/pricing/estimate.ts`: đầy đủ nhánh parcel → route → airport → distance → quote_required (PR-1…PR-10, flowchart §3.2.2); helpers `fromTier/scale/quote` → **T013 xanh**
- [x] T019 [US1] `backend/src/lib/booking/validate.ts` + `bookingCode.ts` + `lookupToken.ts` → **T014, T015 xanh**
- [x] T020 [US1] `backend/src/collections/Routes/index.ts`: đủ field §4.2.1 — tier groups, `priceFrom` auto (beforeValidate = min tier không negotiable), `pricingDetails[]` đọc giá từ tier lúc serialize (FR-D04), validate FR-D05 (max≥min, min>0, có share1 hoặc charter45)
- [x] T021 [US1] `backend/src/app/api/v1/pricing/estimate/route.ts` POST: validate body (zod) → load ctx (routes/airport/rates/settings, cache in-memory 60s) → `estimate()` → envelope `Tính giá cước thành công`; rate limit 30/phút
- [x] T022 [US1] `backend/src/app/api/v1/bookings/route.ts` POST: honeypot → 201 giả; idempotency; rate limit 5/phút + 20/ngày/SĐT; validate → server tự tính giá (không tin client) → sinh bookingCode → lưu `status=pending` + statusHistory + sourceIpHash → trả `lookupToken` 1 lần → đẩy outbox (T044) → 201
- [x] T023 [US1] `backend/src/app/api/v1/bookings/[code]/route.ts` GET: auth token/phoneLast4 → 404 trùng nhất, `no-store`, rate limit 10/phút, mask SĐT, `statusLabel/paymentMethodLabel`
- [x] T024 [US1] `backend/src/app/api/v1/routes/route.ts` + `routes/[slug]/route.ts` GET: query `status,isBannerTop,region,fields(card|slug|full)`, card payload đúng 5.2①, detail 5.2② (404 khi inactive), cache headers + tags
- [x] T025 [US1] Seed tuyến: `backend/src/seed/data/routes.ts` (copy từ `TestSEO/src/data/routes.ts` + slides từ `RouteImageSlideshow.tsx` + thumbnails từ `RoutePricingGrid.tsx`), `backend/src/seed/parseVndText.ts` + `assertPriceFrom.ts` (Phụ lục B), script `backend/src/seed/seedRoutes.ts` (idempotent) → `priceFrom == tierShare1.min` ở cả 9 tuyến (SC-011)
- [x] ~~T026~~ CANCELLED (pivot 2026-10-10 — frontend/TestSEO ngoài repo) [US1] Frontend API client `frontend/src/lib/api.ts`: `getRoutes/getRoute/getSettings...` với `next: {tags, revalidate}`, `postEstimate`, `postBooking`, `lookupBooking` (no-store)
- [x] ~~T027~~ CANCELLED (pivot 2026-10-10 — frontend/TestSEO ngoài repo) [US1] `frontend/src/components/booking/BookingForm.tsx`: bỏ `calculatePriceEstimate/findMatchingRoute` + regex cũ; gọi `postEstimate` **debounce 300ms**; thêm ô `note`; honeypot `website`; phone normalize cùng backend; `datetime-local` gửi `+07:00`; `guihang` không gửi rideType/passengerCount; hiện quận + chiều khi có "Nội Bài"; hiện `rateHint` + "tổng đài báo giá" khi quote_required; hiển thị `displayPrice` (xử lý negotiable/quote_required, không in null); submit → `router.push('/dat-xe/thanh-cong?code=…&t=…')`; xử lý 422/429 có thông báo rõ
- [x] ~~T028~~ CANCELLED (pivot 2026-10-10 — frontend/TestSEO ngoài repo) [US1] `frontend/src/app/dat-xe/thanh-cong/page.tsx`: fetch `GET /bookings/:code` server-side `cache:'no-store'`; thiếu/sai code → trang thông báo chung; hiển thị `statusLabel`, `paymentMethodLabel`, masked phone; luôn `noindex`
- [x] T029 [US1] Contract test `backend/tests/api.contract.test.ts` bổ sung: POST bookings/estimate envelope + error codes (xanh với handler test qua inject hoặc integration script)

**Checkpoint**: US1 hoạt động độc lập — đặt xe end-to-end, golden cases xanh.

---

## Phase 4: User Story 2 — SEO Marketer (P1)

**Goal**: Marketer sửa metadata/noindex mọi trang; canonical/schema/sitemap/robots tự sinh.

**Independent Test**: bật noindex tuyến → meta robots + biến mất khỏi sitemap; title tổng ≤70.

### Tests for US2 (TRƯỚC)

- [x] ~~T030~~ CANCELLED (pivot 2026-10-10 — frontend/TestSEO ngoài repo) [P] [US2] `frontend/tests/seo.test.ts`: SEO-1 (appendBrand on/off, fallback title), SEO-2 (description cắt ≤155 không giữa từ), SEO-3 canonical tuyệt đối, SEO-4 og fallback company default, SEO-5 noindex → robots noindex + loại sitemap, SEO-6 không canonical ở root layout — **FAIL**
- [x] T031 [P] [US2] `backend/tests/sitemap.test.ts`: 6 trang hệ thống + 3 chính sách + routes active + articles published; loại noindex/chưa publish/redirect URL/thanh-cong; lastmod = updatedAt — **FAIL**
- [x] ~~T032~~ CANCELLED (pivot 2026-10-10 — frontend/TestSEO ngoài repo) [P] [US2] `frontend/tests/schema.test.ts`: Organization/TaxiService/WebSite graph từ company_settings; Service+Offer priceValidUntil từ API (không hardcode 2026-12-31); hotline → `+84962298293` (SCH-4); Article schema; Breadcrumb — **FAIL**

### Implementation for US2

- [x] ~~T033~~ CANCELLED (pivot 2026-10-10 — frontend/TestSEO ngoài repo) [US2] `frontend/src/lib/seo.ts` rewrite: `constructMetadata({seo, name, path, ...})` áp SEO-1…SEO-6, `title.absolute` khi appendBrand=false, bỏ `DEFAULT_OG_IMAGE` cứng (lấy từ `company_settings.defaultOgImage`) → **T030 xanh**
- [x] T034 [US2] `backend/src/app/api/v1/seo/sitemap/route.ts` + `backend/src/lib/seo/sitemap.ts` (lọc noindex/redirect/cấm) → **T031 xanh**
- [x] ~~T035~~ CANCELLED (pivot 2026-10-10 — frontend/TestSEO ngoài repo) [US2] `frontend/src/lib/schema.ts` rewrite: builders từ dữ liệu API (`priceValidUntil` route→pricing_settings, `priceRange` auto tính nếu trống, logo/areaServed/telephone company) → **T032 xanh**
- [x] ~~T036~~ CANCELLED (pivot 2026-10-10 — frontend/TestSEO ngoài repo) [US2] `frontend/src/app/sitemap.ts` (gọi `/api/v1/seo/sitemap`, tag sitemap) + `frontend/src/app/robots.ts` (Disallow `/dat-xe/thanh-cong`, `/admin`, `/api/` + dòng Sitemap)
- [x] T037 [US2] `backend/src/collections/Pages/index.ts`: 9 slug seed (6 system + 3 content), access cấm create/delete `kind=system`, seo group; endpoint `backend/src/app/api/v1/pages/[slug]/route.ts` (nhận `chinh-sach--bao-mat` hoặc `?path=`)
- [x] ~~T038~~ CANCELLED (pivot 2026-10-10 — frontend/TestSEO ngoài repo) [US2] Trang tĩnh frontend lấy SEO từ `/pages/:slug`: `/`, `/gioi-thieu`, `/lien-he`, `/tuyen-lien-tinh`, `/tin-tuc`, `/dat-xe` (helper `frontend/src/lib/pageSeo.ts` — tag `pages`); seed metadata 9 trang từ `TestSEO` (Phụ lục B: metadata → pages.seo)
- [x] ~~T039~~ CANCELLED (pivot 2026-10-10 — frontend/TestSEO ngoài repo) [US2] Trang chính sách `/chinh-sach/*`: render `contentHtml` từ CMS + `commitments`/`paymentMethods` từ company_settings (dam-bao/thanh-toan)
- [x] T040 [US2] Cảnh báo `priceValidUntil`: field admin + list view đỏ khi < 30 ngày hoặc quá hạn (SCH-1); description hướng dẫn Marketer
- [x] T041 [US2] Seed `pages` (9 record) — `backend/src/seed/seedPages.ts`

**Checkpoint**: US2 độc lập — SEO đầy đủ cho mọi loại trang.

---

## Phase 5: User Story 3 — Quản lý tuyến & bảng giá dạng số (P1)

**Goal**: Marketer CRUD tuyến với PriceTier số, text giá tự sinh, redirect khi đổi slug (partial → US6), slides/FAQ/alias.

**Independent Test**: sửa giá tuyến → card/detail đổi text hiển thị; validate tier sai bị chặn.

### Tests for US3 (TRƯỚC)

- [x] T042 [P] [US3] `backend/tests/routes.validate.test.ts`: max<min reject, min≤0 reject, thiếu cả share1+charter45 reject, pricingDetails tierKey không tồn tại reject, priceFrom = min tier hợp lệ — **FAIL**

### Implementation for US3

- [x] T043 [US3] Hoàn thiện `routes` arrays/details: `pricingDetails[]` (giá đọc từ tier lúc serialize), `pickups/dropoffs/originAliases/destinationAliases`, `regions` (5 giá trị cố định, gạch `Bắc Ninh – Bắc Giang` đồng nhất), `slides[]` (alt fallback media.alt), `faqs[]`, `relatedRoutes` (max 3), `isBannerTop/bannerLabel/sortOrder/status` → **T042 xanh**
- [x] T044 [US3] API list routes: `meta.regions` + sort `sortOrder`; `fields=slug` cho generateStaticParams
- [x] ~~T045~~ CANCELLED (pivot 2026-10-10 — frontend/TestSEO ngoài repo) [US3] Frontend trang chi tiết `frontend/src/app/tuyen-lien-tinh/[slug]/page.tsx`: fetch detail (`fields=full` khi cần), generateMetadata qua seo group, SSG `generateStaticParams` từ `fields=slug`, slides (ảnh đầu `priority` LCP), bảng giá từ `pricingDetails`, FAQ, relatedRoutes, Service/Offer schema → 404 khi inactive
- [x] ~~T046~~ CANCELLED (pivot 2026-10-10 — frontend/TestSEO ngoài repo) [US3] Frontend listing `frontend/src/app/tuyen-lien-tinh/page.tsx`: grid + tab lọc region từ API (bỏ import `POPULAR_ROUTES`)
- [x] T047 [US3] Seed media: copy ảnh `TestSEO/public/*` (HaiPhong, NoiBai, HaLong, HaNoi, MongCai, BacNinh, BacGiang, photo01–04…) vào `backend/media/`, upload seed với `alt` bắt buộc (Phụ lục B.3.5); map thumbnail + slides cho 9 tuyến
- [x] T048 [US3] Seed scripts còn lại: `seedAirport.ts` (12 quận), `seedDistance.ts` (4 dải), `seedRedirects.ts` (5 redirect `source='seed'`), `seedCompany.ts`, `seedPricingSettings.ts`, `seedArticles.ts` (2 bài), `seedUsers.ts` (editor/dispatcher test) + `seed.ts` tổng (idempotent, chạy `assertPriceFrom`)

**Checkpoint**: US3 độc lập — 9 tuyến hiển thị/được API đúng với giá dạng số.

---

## Phase 6: User Story 4 — Vòng đời đơn & Thông báo (P2)

**Goal**: Dispatcher quản lý đơn + Telegram thông báo ≤5s, retry + email dự phòng.

**Independent Test**: tạo đơn có outbox; chuyển sai 409; assigned thiếu tài xế reject.

### Tests for US4 (TRƯỚC)

- [x] T049 [P] [US4] `backend/tests/booking.stateMachine.test.ts`: mọi chuyển hợp lệ/bất hợp lệ (bảng §3.1), assigned thiếu driver reject, completed thiếu finalPrice/paymentMethod reject, cancelled thiếu reason reject, mọi chuyển ghi history — **FAIL**
- [x] T050 [P] [US4] `backend/tests/notify.test.ts`: escape `& < >` của dữ liệu khách, mẫu đúng format (mã/tuyến/giá), `negotiable|quote_required` → "CẦN BÁO GIÁ", retry schedule 5s/30s/2p đúng 3 lần rồi fallback email — **FAIL**

### Implementation for US4

- [x] T051 [US4] `backend/src/lib/booking/stateMachine.ts` + hook validate trong `bookings` collection (409 INVALID_TRANSITION, history ghi `from/to/by/at/note`) → **T049 xanh**
- [x] T052 [US4] `backend/src/collections/Drivers/index.ts` (không public API) + validate `confirmed→assigned` cần driver `isActive`
- [x] T053 [US4] `backend/src/lib/notify/`: `escapeHtml.ts`, `message.ts` (mẫu HTML mục 3.3), `outbox.ts` (bảng jobs + trạng thái), `telegram.ts` (gửi `parse_mode=HTML`), `worker.ts` (in-process interval, retry backoff, email fallback `NOTIFY_FALLBACK_EMAIL`, set `notifiedAt/notifyAttempts/notifyError`) → **T050 xanh**
- [x] T054 [US4] Gắn afterCreate → outbox; admin list hiển thị cờ "chưa thông báo" (notifyAttempts=3 && !notifiedAt)
- [x] T055 [US4] Access roles bookings: `editor` masked `customerPhone`, `dispatcher` toàn trường, create chỉ qua API (không qua admin UI)

**Checkpoint**: US4 độc lập — thông báo + máy trạng thái chạy.

---

## Phase 7: User Story 5 — Tin tức & trang chính sách (P2)

**Goal**: Bài viết sanitize + TOC + publishedAt; nội dung chính sách từ CMS.

**Independent Test**: tạo bài 2 h2 → TOC 2 mục khớp id; thẻ cấm bị loại.

### Tests for US5 (TRƯỚC)

- [x] T056 [P] [US5] `backend/tests/articles.sanitize.test.ts`: allowlist đúng, link ngoài +`rel="noopener nofollow"`, img thiếu alt reject, TOC sinh id duy nhất + gắn id vào h2, publishedAt auto lần đầu publish — **FAIL**

### Implementation for US5

- [x] T057 [US5] `backend/src/lib/seo/sanitize.ts` + `toc.ts` + hooks `articles` (beforeChange sinh contentHtml/tableOfContents) → **T056 xanh**
- [x] T058 [US5] `backend/src/collections/Articles/index.ts` đầy đủ §4.2.2 (category select 3值, categoryName derived, featuredImage bắt buộc alt, relatedRoute, status, seo group) + hooks slug redirect/revalidate
- [x] T059 [US5] `backend/src/app/api/v1/articles/route.ts` + `articles/[slug]/route.ts` (pagination meta, chỉ published, 404 khi draft)
- [x] ~~T060~~ CANCELLED (pivot 2026-10-10 — frontend/TestSEO ngoài repo) [US5] Frontend `frontend/src/app/tin-tuc/page.tsx` (list + category filter + pagination) + `tin-tuc/[slug]/page.tsx` (contentHtml, TOC component, Article schema, generateMetadata, relatedRoute card, excludeSlug sidebar)
- [x] T061 [US5] Seed 2 bài từ `TestSEO/src/data/articles.ts` (content HTML → sanitize → contentHtml; image photo01/02 → media với alt)

**Checkpoint**: US5 độc lập — đăng bài + xem bài chạy.

---

## Phase 8: User Story 6 — Redirect 301 & bảo toàn ranking (P2)

**Goal**: Đổi slug tự 301, seed 5 redirect cũ, chống loop/chain, middleware 60s.

**Independent Test**: đổi slug tuyến → URL cũ 301 ≤60s; redirect vòng bị reject.

### Tests for US6 (TRƯỚC)

- [x] T062 [P] [US6] `backend/tests/redirect.rules.test.ts`: chuẩn hóa fromUrl (RD-1), toUrl≠fromUrl (RD-2), loop/chain 5 bước reject (RD-3), statusCode enum + 410 không toUrl (RD-4), gộp chuỗi khi đổi slug + xóa redirect tạo loop (logic hook) — **FAIL**

### Implementation for US6

- [x] T063 [US6] `backend/src/collections/Redirects/index.ts` + `backend/src/lib/seo/redirectRules.ts` (validate RD-1…RD-4) → **T062 xanh**
- [x] T064 [US6] `backend/src/collections/hooks/createRedirectOnSlugChange.ts` (spec §2.5: gộp chuỗi, xóa loop, tạo mới, chỉ khi active/published) — áp dụng routes/articles/pages
- [x] T065 [US6] `backend/src/app/api/v1/redirects/route.ts` GET (isActive, max 2000, `max-age=30`)
- [x] ~~T066~~ CANCELLED (pivot 2026-10-10 — frontend/TestSEO ngoài repo) [US6] `frontend/middleware.ts`: matcher loại `_next/api/admin/media/favicon/robots/sitemap`, fetch redirects cache 60s, fail-open, 410 → Gone, giữ query string (spec §2.5 code mẫu)
- [x] ~~T067~~ CANCELLED (pivot 2026-10-10 — frontend/TestSEO ngoài repo) [US6] Verify `frontend/next.config.ts` **không** còn 5 redirect cũ (chỉ seed trong DB) + test curl 5 URL cũ trả 301 (SC-007)

**Checkpoint**: US6 độc lập — redirect engine chạy.

---

## Phase 9: User Story 7 — Cấu hình công ty & bảng giá phụ (P3)

**Goal**: Globals company/pricing + airport 12 quận + distance 4 dải + layout dùng API.

**Independent Test**: sửa hotline → API trả href derived; distance dải chồng lấn reject.

### Tests for US7 (TRƯỚC)

- [x] T068 [P] [US7] `backend/tests/settings.test.ts`: derived hotlineHref/zaloHref/smsHref/domainName không lưu DB, testimonials lọc isVisible, distance overlap/gap reject, airport roundTrip warning (không chặn) — **FAIL**

### Implementation for US7

- [x] T069 [US7] `backend/src/globals/CompanySettings.ts` (§4.2.10 đầy đủ) + `PricingSettings.ts` (§4.2.11, `priceValidUntil` bắt buộc) với access admin/editor theo nhóm
- [x] T070 [US7] `backend/src/collections/AirportPricing.ts` (validate warning) + `DistanceRates.ts` (validate không chồng lấn/không hở) → **T068 xanh**
- [x] T071 [US7] Endpoints `settings/company`, `settings/pricing`, `pricing/airport`, `pricing/distance` (đúng payload 5.4, tags)
- [x] ~~T072~~ CANCELLED (pivot 2026-10-10 — frontend/TestSEO ngoài repo) [US7] Frontend layout dùng API: `frontend/src/components/layout/Header/Footer/TopBanner/FloatingContact` lấy company_settings (hotline, banner lines, zalo); Footer 3–4 tuyến theo `isBannerTop/sortOrder` (bỏ slug cứng)
- [x] ~~T073~~ CANCELLED (pivot 2026-10-10 — frontend/TestSEO ngoài repo) [US7] Thay **mọi** chỗ hardcode "150.000đ/150k" bằng `pricing_settings.parcelFromPrice` (8 vị trí theo khảo sát: BookingForm, HeroSection, gioi-thieu, route page, FAQ, schema priceRange, articles seed, testimonial)
- [x] ~~T074~~ CANCELLED (pivot 2026-10-10 — frontend/TestSEO ngoài repo) [US7] Frontend hiển thị chính sách phụ: components dùng `pricing_settings` (tollsNote, waiting, overnight, holidayNote, returningCustomerDiscountPercent) ở bảng giá/hero/banner

**Checkpoint**: US7 độc lập — cấu hình tập trung, không còn hardcode.

---

## Phase 10: User Story 8 — Revalidation & hiệu năng (P3)

**Goal**: Sửa CMS → trang cập nhật ≤5s; webhook secret an toàn; cache đúng.

**Independent Test**: sửa giá tuyến → trang tuyến + home + listing + header cập nhật ≤5s; sai secret → 401.

### Tests for US8 (TRƯỚC)

- [x] ~~T075~~ CANCELLED (pivot 2026-10-10 — frontend/TestSEO ngoài repo) [P] [US8] `frontend/tests/revalidate.test.ts`: sai secret 401 (timingSafeEqual), collection không hợp lệ 422, mapping tags đúng bảng 6.2 (routes → routes+sitemap+listing+layout) — **FAIL**

### Implementation for US8

- [x] ~~T076~~ CANCELLED (pivot 2026-10-10 — frontend/TestSEO ngoài repo) [US8] `frontend/src/app/api/v1/webhooks/revalidate/route.ts` (code mẫu spec §5.5) → **T075 xanh**
- [x] T077 [US8] `backend/src/lib/revalidate/webhookClient.ts` + hooks `afterChange/afterDelete` của 8 collection/global (gửi `collection,slug,previousSlug,action`, fire-and-forget, lỗi không chặn admin)
- [x] ~~T078~~ CANCELLED (pivot 2026-10-10 — frontend/TestSEO ngoài repo) [US8] Cache tags nhất quán trong `frontend/src/lib/api.ts` (mọi fetch có `tags` + `revalidate:60`); estimate cache ctx 60s bên backend; lookup `no-store`
- [x] ~~T079~~ CANCELLED (pivot 2026-10-10 — frontend/TestSEO ngoài repo) [US8] Tích hợp kiểm chứng SC-008/009/010 (script test: đổi giá → curl trang ≤5s; đổi hotline → mọi trang; sai secret → 401)

**Checkpoint**: US8 độc lập — revalidation end-to-end.

---

## Phase 11: Polish & Cross-Cutting

**Purpose**: Media pipeline, parity với TestSEO, nghiệm thu

- [x] T080 [P] Media: Payload uploads `staticURL:'/media'` + Sharp sizes (card 640w/hero 1600w/og 1200×630 crop, bản gốc ≤2400px); test `GET /media/*` không nằm dưới `/api/`; `frontend/next.config.ts` thêm `images.remotePatterns` host backend
- [x] T081 [P] Admin `X-Robots-Tag: noindex, nofollow` header + bắt buộc đăng nhập `/admin`
- [x] ~~T082~~ CANCELLED (pivot 2026-10-10 — frontend/TestSEO ngoài repo) Parity frontend còn lại: home page sections (Hero, RoutePricingGrid, IntroTeaser **sửa nhãn/link lỗi F13**, commitments, testimonials), `/gioi-thieu`, `/lien-he` — dữ liệu từ API + `frontend/src/data/*` chỉ còn nội dung trang tĩnh Phase 1
- [x] T083 Test ảnh: mọi ảnh có width/height (CLS=0), slide đầu `priority`, alt bắt buộc; tạo `public/images/og-…webp` + `logo-…png` + `favicon.ico` (F13 — hiện **thiếu** trong TestSEO)
- [x] ~~T084~~ CANCELLED (pivot 2026-10-10 — frontend/TestSEO ngoài repo) [P] Port tests TestSEO còn hợp lý sang `frontend/tests/`: `pricing` (đổi sang gọi contract/API mock), `routes-metadata`, `seo`, `schema`
- [x] T085 Chạy full verification: 2 app `npm run lint` + `npm run typecheck` + `npm test` xanh; `npm run build` cả 2 app thành công
- [x] T086 Script PII: `backend/src/seed/anonymizePii.ts` (ẩn danh >24 tháng) + doc trong README (FR-B08)
- [x] T087 Nghiệm thu đối chiếu Checklist mục 9 spec v1.1 → ghi evidence vào `progress.md` (mọi dòng [x] kèm command/kết quả)
- [x] T088 Cập nhật `task_plan.md` (tick toàn bộ), `findings.md` (quyết định cuối + deviation), `progress.md` (entry cuối) → Gate G4

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (P1)** → không phụ thuộc → **Foundational (P2) BLOCKS mọi story**
- **US1 (P3)**: cần P2 → MVP đầu tiên, ưu tiên cao nhất
- **US2 (P4)**: cần P2; seed pages độc lập US1 → chạy song song US1 sau P2
- **US3 (P5)**: cần US1 phần routes collection (T020) → sau P3 một phần
- **US4 (P6)**: cần US1 (bookings collection + T022) → sau P3
- **US5 (P7)**: cần P2 → song song được với US1/US4
- **US6 (P8)**: cần routes/articles/pages có slug → sau US3/US5 (hooks)
- **US7 (P9)**: cần P2 → song song; T072–T074 cần frontend layout (T082 nên kéo sớm phần layout)
- **US8 (P10)**: cần hooks đã có ở US3/US5/US6/US7 → gần cuối
- **Polish (P11)**: sau mọi story muốn nghiệm thu

### Parallel Opportunities (đánh dấu [P])
- T002–T005 (setup), T007–T010 (foundation libs), T013–T015 (US1 tests), T030–T032 (US2 tests), T049–T050, T056, T062, T068, T075
- TDD: mọi "Tests for …" chạy song song trước implementation tương ứng

### Execution Strategy (đề xuất — user chọn ở G2)
- **Subagent-Driven**: 1 subagent/task + 2-stage review (spec conformance → code quality), phù hợp Thorough
- **Executing-Plans**: chạy batch theo phase + checkpoint review sau mỗi phase

## Notes
- Mọi task ghi file path cụ thể; không task mơ hồ.
- Commit sau mỗi task/nhóm logic; test fail → implement → xanh.
- Sai 3 lần liên tiếp → escalation `systematic-debugging` (workflow).
- Deviations so với spec phải ghi `findings.md` + hỏi người dùng nếu ảnh hưởng contract.
