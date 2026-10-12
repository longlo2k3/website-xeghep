# Implementation Plan: Headless CMS, Booking Engine & SEO Management Platform

**Branch**: `001-headless-cms-booking-seo` | **Date**: 2026-10-09 | **Spec**: [.specify/specs/001-headless-cms-booking-seo/spec.md](./spec.md)

**Input**: Feature specification from `.specify/specs/001-headless-cms-booking-seo/spec.md` + nguồn yêu cầu `CMS_BACKEND_SEO_SPECIFICATION_v1.1.md` (bản 1.1.0) + khảo sát `TestSEO/` (2026-10-09).

## Summary

Xây dựng hai ứng dụng trong repo `cms/`:

1. **`cms/backend` — Nền tảng quản trị + API công khai**: Payload CMS 3.x (chạy trên Next.js App Router) làm việc tại `/admin`, phục vụ REST API công khai tại `/api/v1/*` theo đúng hợp đồng mục 5 của spec v1.1. Chứa 10 collections + 2 globals, Pricing Engine thuần (A1–A20), Booking API + máy trạng thái, thông báo Telegram (outbox + retry + email dự phòng), redirect hooks, sitemap/robots feed, seed toàn bộ từ dữ liệu `TestSEO/src/data`.
2. **`cms/frontend` — Website công khai**: Next.js 15 App Router + Tailwind, **tái hiện design hiện có của `TestSEO/`**, thay mọi import dữ liệu cứng bằng client gọi `/api/v1` (F1–F14), thêm middleware redirect, sitemap/robots động, webhook revalidate, form đặt xe thật (estimate debounce 300ms + submit + trang thành công tra API).

Database: PostgreSQL (Docker khi dev). Mọi quyết định kỹ thuật bên dưới tham chiếu checkpoint của `constitution.md`.

## Technical Context

**Language/Version**: TypeScript 5.7+, Node.js 24 (runtime đã có trên máy).

**Primary Dependencies**:
- Backend: `payload@3`, `next@15`, `react@19`, `@payloadcms/db-postgres`, `sanitize-html`, `sharp` (resize media), `zod` (validation contract), `vitest@3`.
- Frontend: `next@15`, `react@19`, `tailwindcss@3.4`, `lucide-react`, `vitest@3` (giữ nguyên stack TestSEO để design/tests tương thích).
- DevOps: `docker` (PostgreSQL 16), npm workspaces không cần — 2 package độc lập.

**Storage**: PostgreSQL 16 (Docker, volume persist); media lưu local `backend/media/` với `staticURL: '/media'` (không nằm dưới `/api/` — tuân thủ robots, see Constitution §2.1).

**Testing**: Vitest ở cả 2 app. Backend: golden cases A1–A20 (Pricing Engine), contract/validation/state-machine/redirect unit tests (không cần DB) + integration tests sau DB (docker). Frontend: contract tests cho SEO metadata (SEO-1…SEO-6), schema builders, api client. CI-able: `npm test` phải xanh.

**Target Platform**: Web (Vercel/SSR + CDN Cloudflare cho frontend; Node server/VPS cho backend CMS).

**Project Type**: Web application (backend + frontend tách bạch, 2 package).

**Performance Goals**: LCP ≤ 2.5s · CLS ≤ 0.1 · INP ≤ 200ms; `POST /pricing/estimate` p95 ≤ 150ms; `POST /bookings` p95 ≤ 400ms (thông báo nền).

**Constraints**: Không làm mất URL/index hiện có (301 đủ mọi đổi slug); envelope + error code đúng hợp đồng; server tự tính giá; rate limit; không cache trang tra cứu vé.

**Scale/Scope**: 9 tuyến, 2 bài viết, 9 trang, 12 quận sân bay, 4 dải km, ~50 màn hình/endpoint; 10 collections + 2 globals; 47 FR / 16 SC.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Checkpoint | Trạng thái | Cách plan đáp ứng |
|---|---|---|
| §2.1 SEO Preservation | ✅ | Redirect engine hooks + middleware (RD-1…RD-6); metadata rules SEO-1…SEO-6 trong `frontend/src/lib/seo.ts`; sitemap/robots động từ API; schema sinh từ dữ liệu; `priceValidUntil` từ CMS; test `noindex` → ra sitemap. |
| §2.2 Server Authority & Contract | ✅ | `backend/src/lib/pricing/estimate.ts` thuần, server tự tính giá tại `POST /bookings`; envelope/error code集中在 `backend/src/lib/api/*`; máy trạng thái `backend/src/lib/booking/stateMachine.ts` trả 409. |
| §2.3 Security & Privacy | ✅ | Normalize phone + regex mới; HMAC lookupToken; rate limiter (IP + SĐT); honeypot; `timingSafeEqual` webhook; sanitize-html allowlist; `sourceIpHash` (không IP thô); không commit `.env`. |
| §2.4 Testing TDD | ✅ | Golden cases A1–A20 viết **trước** implementation (`backend/tests/pricing.golden.test.ts`); contract tests; coverage ≥ 90% module pricing/validation/state. |
| §2.5 Performance | ✅ | Tag-based cache + revalidate ≤ 5s; estimate dùng in-memory cache bảng tuyến 60s; p95 mục tiêu ghi vào acceptance; chỉ định `priority` ảnh LCP. |
| §2.6 UX | ✅ | Tái hiện design TestSEO (design tokens từ `TestSEO/tailwind.config.ts` + `design-system/MASTER.md`); responsive/mobile-first; Lucide icons; trạng thái lỗi rõ ràng, không in "null". |
| §3 Architecture Governance | ✅ | Đã chốt 2026-10-09: Payload CMS 3 monolith tại `backend/`, Next.js 15 tại `frontend/`, PostgreSQL Docker. LTS, giấy phép MIT, OWASP. |
| §4 Document Separation | ✅ | `spec.md` thuần product (đã gỡ tên stack); plan này giữ chi tiết kỹ thuật. |
| §5 Quality Assurance | ✅ | Inline spec review đã pass (G1); inline plan review chạy trước G2; file structure mapping ở mục Project Structure. |

**Violations**: không có → không cần Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
.specify/
├── memory/constitution.md
└── specs/001-headless-cms-booking-seo/
    ├── plan.md              # file này
    ├── spec.md              # đã chốt (G1)
    ├── data-model.md        # ERD + field detail (Phase 1 design)
    ├── contracts/api.md     # hợp đồng REST /api/v1 (Phase 1 design)
    └── tasks.md             # phân rã task (G2)
task_plan.md / findings.md / progress.md   # tracking (Manus-style, ở root repo)
```

### Source Code (repository root: `C:\Users\LongVi\OneDrive\Desktop\cms`)

```text
cms/
├── .spec-mode                       # "spec-kit"
├── .specify/                        # Spec-Kit artifacts
├── task_plan.md  findings.md  progress.md
├── docker-compose.yml               # PostgreSQL 16 (dev)
├── backend/                         # Payload CMS 3 monolith
│   ├── package.json  tsconfig.json  next.config.ts
│   ├── payload.config.ts            # 10 collections + 2 globals + hooks
│   ├── media/                       # uploads (staticURL: /media)
│   ├── src/
│   │   ├── app/                     # Next App Router + (payload) admin
│   │   │   └── (payload)/admin/…    # admin panel
│   │   ├── app/api/v1/
│   │   │   ├── bookings/route.ts              # POST (5.1①)
│   │   │   ├── bookings/[code]/route.ts       # GET  (5.1③)
│   │   │   ├── pricing/estimate/route.ts      # POST (5.1②)
│   │   │   ├── pricing/airport/route.ts       # GET  (5.4③)
│   │   │   ├── pricing/distance/route.ts      # GET  (5.4④)
│   │   │   ├── routes/route.ts                # GET  (5.2①)
│   │   │   ├── routes/[slug]/route.ts         # GET  (5.2②)
│   │   │   ├── redirects/route.ts             # GET  (5.2③)
│   │   │   ├── articles/route.ts  articles/[slug]/route.ts   # (5.3)
│   │   │   ├── settings/company/route.ts  settings/pricing/route.ts
│   │   │   ├── pages/[slug]/route.ts          # (5.4⑤)
│   │   │   └── seo/sitemap/route.ts           # (5.4⑥)
│   │   ├── collections/            # routes, articles, pages, bookings, drivers,
│   │   │   │                       # media, redirects, airport_pricing, distance_rates, users
│   │   │   └── hooks/createRedirectOnSlugChange.ts  + revalidate webhook caller
│   │   ├── globals/                # company_settings, pricing_settings
│   │   ├── lib/
│   │   │   ├── pricing/            # estimate.ts, formatTier.ts, matchRoute.ts  (PR-1…PR-10)
│   │   │   ├── booking/            # validate.ts, bookingCode.ts, stateMachine.ts, lookupToken.ts
│   │   │   ├── notify/             # outbox.ts, telegram.ts, retry.ts, escapeHtml.ts
│   │   │   ├── api/                # envelope.ts, errors.ts, rateLimit.ts, idempotency.ts
│   │   │   ├── seo/                # seoGroup.ts, slugify.ts, sitemap.ts, sanitize.ts, toc.ts
│   │   │   └── revalidate/         # webhookClient.ts (gửi sang frontend)
│   │   └── seed/                   # seed.ts + data/ (bản sao đã làm sạch từ TestSEO/src/data)
│   └── tests/
│       ├── pricing.golden.test.ts  # A1–A20 (TDD, viết trước)
│       ├── booking.validate.test.ts  booking.stateMachine.test.ts
│       ├── redirect.rules.test.ts   seo.sitemap.test.ts  seo.sanitize.test.ts
│       └── api.contract.test.ts     # envelope + error codes
├── frontend/                        # Next.js 15 website công khai
│   ├── package.json  next.config.ts  tailwind.config.ts
│   ├── design-system/               # MASTER.md (bản sao từ TestSEO)
│   ├── middleware.ts                # redirect engine (TTL 60s, 2.5)
│   ├── src/
│   │   ├── app/                     # / ,gioi-thieu,lien-he,tuyen-lien-tinh[/slug],
│   │   │                            # tin-tuc[/slug],dat-xe,dat-xe/thanh-cong,chinh-sach/*
│   │   │   ├── sitemap.ts  robots.ts
│   │   │   └── api/v1/webhooks/revalidate/route.ts   # (5.5)
│   │   ├── components/              # tái sử dụng cấu trúc TestSEO (home/booking/routes/layout/seo)
│   │   ├── data/                    # CHỈ dữ liệu nội dung trang home/giới thiệu (Phase 1)
│   │   └── lib/
│   │       ├── api.ts               # fetch helpers + cache tags
│   │       ├── seo.ts               # constructMetadata (SEO-1…SEO-6)
│   │       ├── schema.ts            # JSON-LD builders
│   │       └── format.ts            # formatTier client-side (hiển thị)
│   └── tests/                       # seo.test.ts, schema.test.ts, api.contract.test.ts
└── TestSEO/                         # NGOÀI PHẠM VI — nguồn seed + chuẩn design (không sửa)
```

**Structure Decision**: Option 2 (Web application: `backend/` + `frontend/`) — khớp quyết định người dùng 2026-10-09. Artifact spec nằm dưới `.specify/specs/001-headless-cms-booking-seo/`; tracking ở root.

## Architecture Decisions

| ID | Quyết định | Lý do | Constitution |
|---|---|---|---|
| AD-1 | **Payload CMS 3 monolith** tại `backend/` (port 3001), admin `/admin`, API `/api/v1` | Payload tự sinh CRUD + access control + hooks; trùng khuyến nghị spec 1.1 §1.1 | §3 |
| AD-2 | **PostgreSQL 16 qua Docker Compose** (`docker-compose.yml`, db `cms`, user/pass dev-only) | Spec 6.4 yêu cầu Postgres; `@payloadcms/db-postgres` chính thức | §3 |
| AD-3 | **Hợp đồng API** tập trung `backend/src/lib/api/envelope.ts` — mọi endpoint (kể cả lỗi) đi qua 1 helper; lỗi dùng bảng code mục 5.0 | Một nguồn sự thật cho contract; test contract 1 lần, dùng mọi nơi | §2.2 |
| AD-4 | **Pricing Engine là module thuần** (`lib/pricing/*`): không phụ thuộc Payload/DB, input = DTO, ctx = data đã nạp. Frontend **không** tự tính giá — chỉ hiển thị `displayPrice` | TDD golden cases dễ dàng; server tính lại mọi giá (không tin client) | §2.2, §2.4 |
| AD-5 | **Media pipeline**: Payload uploads `staticURL: '/media'`, resize sẵn `card 640w / hero 1600w / og 1200×630` bằng Sharp, serve tại `/media/*` (KHÔNG dưới `/api/`); frontend thêm host backend vào `images.remotePatterns` | Robots `Disallow: /api/` không chặn Google Images; tránh trùng xử lý với next/image (spec 6.3) | §2.1 |
| AD-6 | **Revalidation**: hook Payload `afterChange` (8 collection/global) → `POST {FRONTEND_URL}/api/v1/webhooks/revalidate` với secret `timingSafeEqual`; frontend route dùng `revalidateTag`/`revalidatePath` theo bảng 6.2. Proxy production: `/api/v1/webhooks/*` → frontend, còn lại `/api/v1/*` → backend | Revalidate theo tag là cơ chế chính; layout/header/footer được làm mới (spec 6.2) | §2.5 |
| AD-7 | **Redirects**: (a) hook `afterChange` tự tạo 301 khi đổi slug (gộp chuỗi, chống loop — RD-1…RD-4); (b) seed 5 redirect cũ `source='seed'`, **xóa khỏi next.config**; (c) `frontend/middleware.ts` đọc `GET /api/v1/redirects` cache 60s, fail-open khi CMS lỗi | `next.config` chỉ chạy lúc build → không đọc DB được (spec 2.5) | §2.1 |
| AD-8 | **Thông báo**: lưu đơn trước → đẩy outbox (DB table qua Payload collection internal) → worker in-process gửi Telegram HTML-escape, retry 5s/30s/2p (3 lần) → email dự phòng + cờ `notifyAttempts/notifyError`. Telegram lỗi **không bao giờ** làm hỏng đơn | Spec 3.3; FR-B04 | §2.2 |
| AD-9 | **Bảo mật**: rate limiter in-memory token-bucket theo rule mục 5.0; idempotency qua bảng `idempotency_keys` (key → bookingId, TTL 10 phút); `lookupToken = HMAC-SHA256(code, SECRET).slice(0,16)`; honeypot; `sourceIpHash = sha256(ip+salt)` | Constitution §2.3 | §2.3 |
| AD-10 | **Seed**: copy `TestSEO/src/data/*` + slides/thumbnails + metadata 9 trang vào `backend/src/seed/data/`, chuyển text giá → `PriceTier` bằng `parseVndText` + `assertPriceFrom` (Phụ lục B); scripts `npm run seed` idempotent | FR-D12, SC-011 | §2.2 |
| AD-11 | **Testing**: backend `tests/` unit thuần (golden A1–A20, validation, state machine, redirect rules, sitemap, sanitize/TOC, envelope) chạy không cần DB; integration (docker) + frontend `tests/` (SEO rules, schema, api client) chạy sau. TDD: test fail → implement | Constitution §2.4 | §2.4 |
| AD-12 | **Design**: `frontend/` tái sử dụng design tokens/components của `TestSEO/` (tailwind.config + design-system/MASTER.md + cấu trúc components); Phase 3 ghi nhận bằng checklist, không generate design mới | Spec yêu cầu không đổi giao diện; tránh regression thị giác | §2.6 |
| AD-13 | **Port & env**: backend `:3001`, frontend `:3000`; `.env.example` ở cả 2 app; secret: `DATABASE_URI`, `PAYLOAD_SECRET`, `TELEGRAM_BOT_TOKEN/CHAT_ID`, `REVALIDATE_SECRET`, `LOOKUP_SECRET`, `IP_SALT`, `SMS_GATEWAY?` | Dev an toàn, deploy đổi biến | §2.3 |

## Data Flow (rút gọn)

```
[Admin /admin] ── Payload CRUD ──> PostgreSQL <── POST /api/v1/bookings ── [BookingForm]
                                     │  │                                    │
                       afterChange ─┘  └── outbox → Telegram/email           │ estimate (debounce 300ms)
                                     │                                        │ GET /bookings/:code (no-store)
                       webhook → frontend /api/v1/webhooks/revalidate ──> revalidateTag(...)
                                     │
[Visitor] ── middleware (redirects, TTL 60s) ──> SSR/SSG pages ── fetch tags ──> GET /api/v1/*
```

## Risks & Mitigation

| Risk | Impact | Mitigation |
|---|---|---|
| Payload 3 custom endpoint trùng đường dẫn admin | Blocker | Payload trả `pages: false`/tách route group `(payload)`; `/api/v1/*` khai báo riêng trong `payload.config.ts#endpoints` hoặc App Router routes ngoài |
| Media mặc định rơi vào `/api/media` | Vi phạm robots | Cấu hình `staticURL: '/media'`; test GET `/media/*` trong acceptance |
| Rate limit in-memory mất khi restart/multi-instance | Chấp nhận được (dev+single instance) | Ghi nhận trong findings; Phase 2 nếu scale → Redis |
| Seed lệch giá (parse text → tier) | Sai báo giá | `assertPriceFrom` chặn seed nếu `priceFrom ≠ tierShare1.min` (SC-011) |
| TestSEO design lệch khi tái hiện | Regression thị giác | So sánh HTML/preview từng trang mẫu (Phụ lục B.3.6); giữ nguyên component structure |
| Docker không sẵn khi test | Integration test fail | Unit tests không phụ thuộc DB luôn chạy được; integration tách script riêng |

## Complexity Tracking

Không có violation — bỏ qua mục này.
