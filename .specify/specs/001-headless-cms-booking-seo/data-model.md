# Data Model — 001-headless-cms-booking-seo

**Date**: 2026-10-09 | **Source of truth**: spec v1.1 §4 (chi tiết field), tài liệu này tập trung vào **triển khai** (bảng, index, access, hooks).

**Storage**: PostgreSQL 16 (`docker-compose.yml`) · Payload `@payloadcms/db-postgres` tự sinh bảng cho `array`/`group`/`relationship`.

## Tổng quan

10 collections + 2 globals (đúng spec §4):

| # | Collection | Bảng | Trạng thái | Hooks |
|---|---|---|---|---|
| 1 | `routes` | `routes` + `route_pricing_rows`, `route_faqs`, `route_slides`, arrays pickups/dropoffs/aliases | `draft/active/inactive` | slug redirect, priceFrom auto, revalidate |
| 2 | `articles` | `articles` | `draft/published/archived` | slug redirect, sanitize+TOC+publishedAt, revalidate |
| 3 | `pages` | `pages` | `draft/published` | chặn create/delete `kind=system`, slug redirect, revalidate |
| 4 | `bookings` | `bookings` + `booking_status_history`, `idempotency_keys` | 6 trạng thái (3.1) | bookingCode auto, state machine, outbox notify |
| 5 | `drivers` | `drivers` | `isActive` | không expose public |
| 6 | `media` | `media` | — | bắt buộc `alt`, Sharp resize card/hero/og |
| 7 | `redirects` | `redirects` | `isActive` | validate RD-1…RD-4 (loop/chain), revalidate |
| 8 | `airport_pricing` | `airport_pricing` | `isActive` | cảnh báo khứ hồi, revalidate |
| 9 | `distance_rates` | `distance_rates` | — | validate không chồng lấn/không hở, revalidate |
| 10 | `users` | `users` | roles: `admin/editor/dispatcher` | access theo vai trò |
| G1 | `company_settings` (global) | `company_settings` | — | revalidate → layout |
| G2 | `pricing_settings` (global) | `pricing_settings` | — | revalidate → pricing tag |

## Index (spec 6.4 — khai báo trong migration)

```
routes(slug) · routes(status, sort_order)
articles(slug) · articles(status, published_at DESC)
bookings(booking_code) · bookings(status, pickup_datetime) · bookings(customer_phone, created_at)
redirects(from_url)  UNIQUE
pages(slug) · pages(status)
idempotency_keys(key) UNIQUE · idempotency_keys(expires_at)
```

## Quy tắc triển khai quan trọng

### routes
- `tierShare1/tierShare2/tierCharter45/tierCharter7`: group `{min, max, from, negotiable}` (number/bool, **nullable**).
- `priceFrom`: `readOnly: true`, hooks `beforeValidate` = `min` của các tier khác negotiable (FR-D04).
- Validate (FR-D05): `max ≥ min`, `min > 0`, có ít nhất `share1` hoặc `charter45`.
- `pricingDetails[].tierKey ∈ {share1, share2, charter45, charter7}` — **không có field giá**: giá sinh lúc read (`formatTier(route.tiers[key])`).
- `seo`: group dùng chung (xem `seoFieldGroup`, FR-C01) — áp dụng cho routes/articles/pages.
- `slug` unique; hook `afterChange` → `createRedirectOnSlugChange('tuyen-lien-tinh')` khi status active (FR-C09).

### articles
- `contentHtml` (RO, auto): sanitize allowlist `p h2 h3 h4 ul ol li strong em a img table thead tbody tr th td blockquote br`; link ngoài +`rel="noopener nofollow"`; `img` bắt buộc alt/width/height (FR-D02).
- `tableOfContents` (RO, auto): sinh từ `h2`, `{id, text}`, id duy nhất, **gắn id vào `contentHtml`**.
- `publishedAt`: tự set lần đầu `status=published` (admin sửa được).
- Hooks: `createRedirectOnSlugChange('tin-tuc')`, revalidate tag `articles,sitemap`.

### pages
- Seed sẵn 9 slug: 6 `kind=system` (`home`, `gioi-thieu`, `lien-he`, `tuyen-lien-tinh`, `tin-tuc`, `dat-xe`) + 3 `kind=content` (`chinh-sach/bao-mat`, `chinh-sach/dam-bao`, `chinh-sach/thanh-toan`).
- Access: cấm `create`/`delete` doc có `kind=system` (FR-C08); slug chứa `/` → API nhận `chinh-sach--bao-mat` hoặc `?path=`.

### bookings (bảo mật nhất)
- `bookingCode`: unique, RO, auto `XG-{YYMMDD}-{6 chars}` bảng `23456789ABCDEFGHJKMNPQRSTUVWXYZ`, CSPRNG, retry ≤5 (FR-A10).
- `lookupToken`: **không lưu** — tính lại qua HMAC khi trả `POST /bookings` (chỉ 1 lần).
- Access: `create` **chỉ qua API public** (không qua admin UI); `read`: `dispatcher` toàn trường, `editor` **bị mask `customerPhone`** (FR-B07); `admin` toàn quyền.
- Hooks: `beforeValidate` → normalize phone + validate (PICKUP_TIME_TOO_SOON, passenger, guihang…), gọi pricing engine snapshot giá; `afterCreate` → đẩy outbox (FR-B04).
- `status` transitions validate bằng `stateMachine.ts` (FR-B01/B02) → sai trả 409.
- `statusHistory[]` array (from,to,by,at,note) tự ghi (FR-B03).
- `sourceIpHash` = `sha256(ip + IP_SALT)` — không lưu IP thô (§2.3).
- Tác vụ dọn dẹp: cron/script ẩn danh PII sau 24 tháng (FR-B08) — `npm run anonymize:pii` (Phase 1: script thủ công, ghi trong findings).

### redirects
- `fromUrl` unique, chuẩn hóa (RD-1: lowercase, leading `/`, bỏ `/` cuối, bỏ query).
- Validate RD-3: đi theo `toUrl` tối đa 5 bước, gặp lại `fromUrl` → reject; `statusCode ∈ {301,302,307,308,410}`; `410` không có `toUrl`.
- Seed 5 bản ghi `source='seed'` (RD-6).

### airport_pricing / distance_rates
- 12 record quận × 3 direction group × 3 cột xe (int VND); warning khi `roundTrip > to+from` (không chặn).
- `distance_rates`: validate dải không chồng lấn, không hở (sort theo `minKm`); seed 4 dải (0–30/31–100/101–200/201+).

### users / roles (FR-D11)
| Vai trò | Quyền |
|---|---|
| `admin` | Toàn quyền mọi collection + globals |
| `editor` | CRUD routes/articles/pages/media (không thấy `customerPhone`, không đụng bookings) |
| `dispatcher` | CRUD bookings/drivers, đọc toàn trường bookings |

### Globals
- `company_settings`: field 4.2.10; derived (`hotlineHref/zaloHref/smsHref/domainName`) **tính lúc read** (FR-D10); `testimonials` lọc `isVisible` khi xuất API.
- `pricing_settings`: field 4.2.11 + validate `priceValidUntil` bắt buộc; cảnh báo < 30 ngày hiển thị dashboard (FR-C07/SC-006).

## Mối quan hệ (ERD rút gọn)

```
routes 1─n route_pricing_rows / route_faqs / route_slides
routes 1─n bookings (nullable) · drivers 1─n bookings (nullable)
articles n─1 routes (relatedRoute) · articles n─1 media (featuredImage)
routes n─1 media (thumbnail) · route_slides n─1 media · pages n─1 media (ogImage)
bookings 1─n booking_status_history
```
