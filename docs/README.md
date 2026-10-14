# CMS — Headless CMS + Booking + SEO (xegheplientinh.vn)

> **PIVOT 2026-10-10**: site public **TestSEO** đã dựng sẵn ngoài repo
> (`C:\Users\LongVi\OneDrive\Desktop\TestSEO`) và tự nối `/api/v1` — nên
> `frontend/` **không còn** trong phạm vi. Admin dùng `/admin` của Payload
> (cùng backend, port 3001). Webhook revalidate sẽ do site TestSEO dựng
> (`/api/v1/webhooks/revalidate`) — backend gửi tới `REVALIDATE_URL`.

| App | Thư mục | Port | Mô tả |
|---|---|---|---|
| Backend | `backend/` | 3001 | Payload CMS 3 (Next.js monolith) — quản lý nội dung, booking, SEO, webhook revalidate |
| Admin CMS | `admin/` | 5173 | Single Page Application (React 19 + Vite + Tailwind) quản trị 11 phân hệ chuyên sâu |
| ~~Frontend~~ | ~~`frontend/`~~ | ~~3000~~ | **CANCELLED** — thay bằng site TestSEO ngoài repo |

Database: **PostgreSQL** chạy trực tiếp trên máy (local service / port 5432).

## Yêu cầu môi trường

- Node.js v20+ (khuyến nghị v24)
- npm 10+
- PostgreSQL cài trên máy (port 5432, database `cms`, user `cms` hoặc `postgres`)

## Cách chạy

### 1. Khởi động database (PostgreSQL trên máy)

Đảm bảo dịch vụ PostgreSQL đang chạy trên máy (port 5432):
- Service Windows: `postgresql-x64-18` (tự khởi động cùng Windows hoặc bật qua `services.msc`)
- Hoặc khởi động thủ công:
  ```powershell
  & "F:\PostgreSQL\bin\pg_ctl.exe" -D "F:\PostgreSQL\data" start
  ```
- Kết nối mặc định trong `backend/.env`:
  ```env
  DATABASE_URI=postgresql://cms:cms_dev_password@localhost:5432/cms
  ```

### 2. Backend (port 3001)

```powershell
cd backend
npm install
npm run dev
```

### 3. Admin CMS Frontend (port 5173)

```powershell
cd admin
npm install
npm run dev
```

> **Khởi động song song**: Mở 2 cửa sổ terminal riêng biệt để chạy đồng thời:
> - **Terminal 1 (Backend)**: `cd backend; npm run dev` (Máy chủ API tại `http://localhost:4001`)
> - **Terminal 2 (Admin CMS)**: `cd admin; npm run dev` (Giao diện Quản trị tại `http://localhost:5173`)

### 4. Frontend Công khai (Public Site) — ĐÃ HỦY (pivot 2026-10-10)

Không còn `frontend/` trong repo. Site public là project TestSEO ngoài repo,
tự gọi `/api/v1/*` của backend (xem `docs/website/CMS_BACKEND_SEO_SPECIFICATION_v1.1.md`).
Webhook revalidate phía public site cần endpoint
`POST /api/v1/webhooks/revalidate` (spec §5.5) — backend gọi tới `REVALIDATE_URL`.

### 4. Seed dữ liệu

```powershell
cd backend
npm run seed
```

### 5. Test

```powershell
cd backend
npm test
```

Lệnh hữu ích khác: `npm run typecheck`, `npm run build`, `npm run test:watch`.
Backend không có script `lint` riêng — Next.js build đã chạy lint + type check.

### 6. Seed chi tiết (idempotent)

```powershell
npm run seed            # tổng: admin → routes(media) → pages → articles → airport → distance → redirects → company → pricing → users
npm run seed:airport    # 12 quận sân bay Nội Bài
npm run seed:distance   # 4 dải km
npm run seed:redirects  # 5 redirect source=seed (từ next.config.ts cũ)
npm run seed:company    # global company_settings
npm run seed:pricing    # global pricing_settings (priceValidUntil bắt buộc)
npm run seed:users      # editor + dispatcher test
```

## Biến môi trường (env)

Sao chép `.env.example` thành `.env` trong từng app (đã có sẵn `.env` local cho dev):

**`backend/.env`**

| Biến | Giá trị mẫu | Mô tả |
|---|---|---|
| `DATABASE_URI` | `postgresql://cms:cms_dev_password@localhost:5432/cms` | Chuỗi kết nối Postgres |
| `PAYLOAD_SECRET` | `change-me-32chars-minimum` | Secret của Payload (tối thiểu 32 ký tự) |
| `PAYLOAD_PUBLIC_SERVER_URL` | `http://localhost:3001` | URL backend |
| `FRONTEND_URL` | `http://localhost:3000` | URL frontend (CORS / link tuyệt đối) |
| `REVALIDATE_SECRET` | `change-me-revalidate` | Secret webhook revalidate ISR |
| `LOOKUP_SECRET` | `change-me-lookup` | Secret API lookup |
| `IP_SALT` | `change-me-ip-salt` | Salt băm IP (rate-limit/fingerprint) |
| `TELEGRAM_BOT_TOKEN` | *(trống)* | Token Telegram bot (notify) |
| `TELEGRAM_CHAT_ID` | *(trống)* | Chat ID Telegram |
| `NOTIFY_FALLBACK_EMAIL` | `ops@example.com` | Email dự phòng khi notify lỗi |
| `CMS_URL` | `http://localhost:3001` | URL self |
| `REVALIDATE_URL` | `http://localhost:3000` | URL site public để gọi webhook revalidate (fallback: `FRONTEND_URL`) |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | `admin@example.com` / … | Tài khoản admin seed |
| `SEED_EDITOR_*` / `SEED_DISPATCHER_*` | `editor@example.com` / … | Tài khoản roles seed |
| `ANONYMIZE_MONTHS` | `24` | Ngưỡng ẩn danh PII (tháng) |

**`frontend/.env`**

| Biến | Giá trị mẫu | Mô tả |
|---|---|---|
| `CMS_URL` | `http://localhost:3001` | URL backend CMS |
| `REVALIDATE_SECRET` | `change-me-revalidate` | Secret gọi webhook revalidate |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | URL site public |

`.env` đã được đưa vào `.gitignore` — không commit lên git.

## Cấu trúc thư mục

```
cms/
├── docker-compose.yml          # PostgreSQL 16 (service db, volume pgdata)
├── README.md
├── admin/                      # React 19 + Vite Admin CMS @ port 5173
│   ├── README.md               # Hướng dẫn chi tiết phân hệ Admin CMS
│   ├── package.json
│   ├── vite.config.ts
│   ├── src/                    # 11 phân hệ quản trị, components, context, routes
│   └── tests/                  # Vitest suite toàn diện
├── backend/                    # Payload CMS 3 @ port 3001
│   ├── next.config.ts
│   ├── payload.config.ts
│   ├── src/
│   │   ├── app/                # Admin panel + API routes /api/v1/**
│   │   ├── collections/        # 10 collections
│   │   ├── globals/            # 2 globals
│   │   ├── lib/                # pricing, booking, notify, api, seo, revalidate
│   │   └── seed/               # npm run seed (+ seed:* riêng lẻ)
│   ├── media/                  # upload media (gitignore, giữ .gitkeep)
│   ├── tests/                  # vitest
│   └── .env.example
├── TestSEO/                    # KHÔNG còn trong cms/ — site public ngoài repo
└── .specify/                   # Spec docs (spec-kit)
```

## Tài liệu spec

- Spec: [.specify/specs/001-headless-cms-booking-seo/spec.md](.specify/specs/001-headless-cms-booking-seo/spec.md)
- Plan: [.specify/specs/001-headless-cms-booking-seo/plan.md](.specify/specs/001-headless-cms-booking-seo/plan.md)
- Data model: [.specify/specs/001-headless-cms-booking-seo/data-model.md](.specify/specs/001-headless-cms-booking-seo/data-model.md)
- API contracts: [.specify/specs/001-headless-cms-booking-seo/contracts/api.md](.specify/specs/001-headless-cms-booking-seo/contracts/api.md)
- Tasks: [.specify/specs/001-headless-cms-booking-seo/tasks.md](.specify/specs/001-headless-cms-booking-seo/tasks.md)
- Constitution: [.specify/memory/constitution.md](.specify/memory/constitution.md)

## Ẩn danh dữ liệu cá nhân (FR-B08)

Đơn đặt xe cũ hơn **24 tháng** được ẩn danh PII theo chính sách bảo mật
(spec §2.3 — FR-B08): tên khách → `Khách hàng ****`, số điện thoại → mask
giữ 4 số cuối, email → redacted, chuỗi giống SĐT trong ghi chú → `***`.
`sourceIpHash` giữ nguyên (đã hash, không lưu IP thô). Script idempotent —
chạy lại không còn gì để sửa.

```bash
cd backend

# Xem trước: in số liệu, KHÔNG ghi database
npm run anonymize:pii -- --dry-run

# Chạy thật
npm run anonymize:pii

# Đổi ngưỡng (mặc định 24 tháng) — thêm vào backend/.env
ANONYMIZE_MONTHS=36
```
