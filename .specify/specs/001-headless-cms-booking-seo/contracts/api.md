# API Contracts — `/api/v1` — 001-headless-cms-booking-seo

**Date**: 2026-10-09 | **Source**: spec v1.1 §5 (JSON đầy đủ xem在那里). Tài liệu này là **checklist hợp đồng** cho test contract (`backend/tests/api.contract.test.ts`).

## 0. Quy ước chung

**Envelope thành công**
```json
{ "success": true, "statusCode": 200, "message": "…", "data": {}, "meta": {} }
```
**Envelope lỗi**
```json
{ "success": false, "statusCode": 422, "error": { "code": "VALIDATION_ERROR", "message": "…", "fields": [{ "field": "customerPhone", "message": "…" }] } }
```

| error.code | HTTP | Áp dụng |
|---|---|---|
| `VALIDATION_ERROR` | 422 | sai trường/ràng buộc |
| `PICKUP_TIME_TOO_SOON` | 422 | giờ đón < now + minLeadTimeMinutes |
| `ROUTE_NOT_FOUND` / `BOOKING_NOT_FOUND` | 404 | không tồn tại / không đủ quyền tra (thông báo **trùng**) |
| `RATE_LIMITED` | 429 | + header `Retry-After` |
| `INVALID_TRANSITION` | 409 | chuyển trạng thái sai (admin) |
| `INTERNAL_ERROR` | 500 | |

**Rate limit**: `POST /bookings` 5/phút/IP + 20/ngày/SĐT · `POST /pricing/estimate` 30/phút/IP · `GET /bookings/:code` 10/phút/IP · GET khác 120/phút/IP.
**Cache**: GET public → `Cache-Control: public, s-maxage=60, stale-while-revalidate=300` + Next tag; `GET /bookings/:code` → `private, no-store`.
**Tags**: routes→`routes,sitemap` · articles→`articles,sitemap` · pages→`pages,sitemap` · company→`company` · pricing→`pricing` · redirects→`redirects`.

## 1. Booking & Pricing

### POST `/api/v1/bookings` — 201
- Header tùy chọn `Idempotency-Key` (UUID, 10 phút → trả lại đơn cũ).
- Body (FR-A10…A13): `customerName*`, `customerPhone*` (normalize), `routeSlug?`, `pickupLocation*`, `dropoffLocation*`, `rideType?` (`ghep|bao`, bỏ qua khi `vehicleType=guihang`), `vehicleType*` (`4cho|5cho|7cho|16cho|guihang`), `passengerCount?` (1–3), `pickupDateTime*` (ISO có offset; không offset = Asia/Ho_Chi_Minh), `note?` (≤500, strip HTML), `airportDistrict?`, `airportDirection?`, `distanceKm?` (1–2000), `website` (honeypot — có giá trị → **201 giả, không lưu**), `captchaToken?`.
- Response data (bắt buộc có): `bookingCode` (`XG-YYMMDD-XXXXXX`), `lookupToken` (16 ký tự, **1 lần**), `route {slug,name}|null`, `priceType`, `estimatedPrice`, `estimatedPriceMax`, `estimatedPriceFormatted`, `unit`, `priceNote`, `paymentMethod: "cash"`, `status: "pending"`, `statusLabel: "Chờ xác nhận"`, `createdAt` ISO +07:00.
- Lỗi: 422 `VALIDATION_ERROR` (fields), 422 `PICKUP_TIME_TOO_SOON`, 429 `RATE_LIMITED`.
- **Không bao giờ** nhận giá từ client — server tự tính (FR-A10).

### POST `/api/v1/pricing/estimate` — 200
- Body: `pickup*`, `dropoff*`, `routeSlug?`, `rideType?`, `vehicleType*`, `passengerCount?`, `airportDistrict?`, `airportDirection?`, `distanceKm?`.
- Response data (FR-A01…A09): `pricingMode ∈ {route,airport,distance,parcel,quote_required}`, `priceType ∈ {fixed,range,from,negotiable,quote_required}`, `matchedRoute {slug,name}|null`, `estimatedMin`, `estimatedMax`, `estimatedPrice (=min)`, `displayPrice`, `unit`, `badge?`, `note`, `rateHint {minPerKm,maxPerKm}|null`.
- **Không lưu gì**. Test: golden cases A1–A20 (spec Phụ lục A).

### GET `/api/v1/bookings/:code` — 200
- Auth: `?t=<lookupToken>` **hoặc** `?phoneLast4=XXXX` → thiếu/sai = 404 `BOOKING_NOT_FOUND` (thông báo trùng).
- `Cache-Control: private, no-store`; rate limit 10/phút/IP.
- Data: `bookingCode`, `customerName`, `customerPhoneMasked` (`0962***293`), `route`, `pickupLocation`, `dropoffLocation`, `pickupDateTime`, `rideType`, `vehicleType`, `passengerCount`, `priceType`, `estimatedPrice`, `estimatedPriceFormatted`, `paymentMethod`, `paymentMethodLabel`, `status`, `statusLabel`.

## 2. Routes & Redirects

### GET `/api/v1/routes` — 200
- Query: `status` (mặc định `active`), `isBannerTop=true|false`, `region`, `fields ∈ {card, slug, full}` (`card` mặc định; `slug` cho `generateStaticParams`).
- Card fields: `id, slug, name, bannerLabel, origin, destination, distance, duration, priceFrom, priceShare1Text, priceShare2Text, priceCharter4to5Text, priceCharter7Text, tiers {share1,share2,charter45,charter7}, pricingDetails [{label,price,note?}], regions, isBannerTop, sortOrder, thumbnail {url,width,height,alt}`.
- `meta: { totalDocs, regions[] }`.

### GET `/api/v1/routes/:slug` — 200 | 404
- Chỉ `status=active`; 404 nếu không tồn tại/inactive (FR-C10).
- Thêm: `description, detailedContent, operatingHoursText, frequencyText, pickups, dropoffs, faqs, slides, relatedRoutes[card], priceValidUntil, updatedAt, seo {metaTitle, appendBrand, metaDescription, ogImage {url,width,height,alt}, noindex}`.
- `fields=full` thêm `originAliases, destinationAliases`.

### GET `/api/v1/redirects` — 200
- Chỉ `isActive=true`, tối đa 2000: `data: [{from, to, statusCode}]`. `Cache-Control: public, max-age=30`. Dùng bởi middleware.

## 3. Articles & Pages

### GET `/api/v1/articles` — 200
- Query: `page` (1), `limit` (12, max 50), `category ∈ {kinh-nghiem,tin-tuyen,khuyen-mai}`, `excludeSlug`. Chỉ `published`, sort `publishedAt DESC`.
- Item: `slug,title,category,categoryName,excerpt,author,featuredImage{url,width,height,alt},publishedAt,updatedAt`; `meta {page,limit,totalDocs,totalPages}`.

### GET `/api/v1/articles/:slug` — 200 | 404
- + `contentHtml` (sanitize, `h2` có `id`), `tableOfContents[]`, `authorType`, `relatedRoute {slug,name,priceShare1Text}|null`, `seo`.

### GET `/api/v1/pages/:slug` — 200 | 404
- Slug nhiều cấp nhận dạng `chinh-sach--bao-mat` hoặc `?path=chinh-sach/bao-mat`.
- Data: `title, kind, contentHtml? (kind=content), seo, updatedAt`. Tag `pages`.

## 4. Settings & Bảng giá phụ

| Endpoint | Nội dung | Tag |
|---|---|---|
| GET `/api/v1/settings/company` | toàn bộ company_settings + derived `hotlineHref, zaloHref, smsHref, domainName`; testimonials chỉ `isVisible` | `company` |
| GET `/api/v1/settings/pricing` | toàn bộ pricing_settings | `pricing` |
| GET `/api/v1/pricing/airport` | 12 quận `{slug,district,fromHanoiToAirport,fromAirportToHanoi,roundTrip}` (mỗi nhóm 3 cột xe) | `pricing` |
| GET `/api/v1/pricing/distance` | `{rates:[{label,minKm,maxKm,sedan5Seats,suv7Seats,van16Seats}], policies:{roundTripDiscountText,waitingTimeText,waitingFreeMinutes,waitingFeePerHour,waitingMaxHours,tollsNote,overnightNote,overnightPhone}}` | `pricing` |

### GET `/api/v1/seo/sitemap` — 200
- `data: [{path, lastmod, type ∈ {page,route,article}}]` — loại noindex, trang chưa publish, URL trong redirects, `/dat-xe/thanh-cong`, `/admin`, `/api`. Tag `sitemap`.

## 5. Webhook (frontend host)

### POST `/api/v1/webhooks/revalidate` *(triển khai ở **frontend**)*
- Header `x-revalidate-secret` → so `timingSafeEqual` (sai → 401, không log secret).
- Body: `{collection ∈ {routes,articles,pages,company_settings,pricing_settings,airport_pricing,distance_rates,redirects}, slug?, previousSlug?, action ∈ {create,update,delete,publish,unpublish}}`.
- Mapping tag/path theo bảng 6.2 (routes/articles/pages → detail + listing; company/pricing → `revalidatePath('/', 'layout')`).
- Backend gửi từ hook `afterChange`/`afterDelete` của 8 collection/global (kèm `previousSlug` khi đổi slug).

## 6. Admin (Payload native)

- `/admin` — bắt buộc đăng nhập; thêm header `X-Robots-Tag: noindex, nofollow` (FR-C06).
- CRUD collections/globals qua Payload API — **không** thuộc `/api/v1`.

## 7. Test contract requirements

- [ ] Mọi endpoint成功 trả đúng envelope + `statusCode` khớp HTTP.
- [ ] Mọi lỗi dùng đúng `error.code` bảng §0 (422/404/409/429/500).
- [ ] `POST /bookings`: honeypot → 201 giả không lưu; thiếu token tra → 404 trùng nhất; phone `+84…` normalize.
- [ ] `POST /pricing/estimate` khớp 20 golden cases.
- [ ] Rate limit: 6 request liên tiếp → 429 + `Retry-After`.
- [ ] Cache header đúng: public GET = `s-maxage`, lookup = `no-store`.
