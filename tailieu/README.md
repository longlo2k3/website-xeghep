# CMS ΓÇö Headless CMS + Booking + SEO (xegheplientinh.vn)

> **PIVOT 2026-10-10**: site public **TestSEO** ─æ├ú dß╗▒ng sß║╡n ngo├ái repo
> (`C:\Users\LongVi\OneDrive\Desktop\TestSEO`) v├á tß╗▒ nß╗æi `/api/v1` ΓÇö n├¬n
> `frontend/` **kh├┤ng c├▓n** trong phß║ím vi. Admin d├╣ng `/admin` cß╗ºa Payload
> (c├╣ng backend, port 3001). Webhook revalidate sß║╜ do site TestSEO dß╗▒ng
> (`/api/v1/webhooks/revalidate`) ΓÇö backend gß╗¡i tß╗¢i `REVALIDATE_URL`.

| App | Th╞░ mß╗Ñc | Port | M├┤ tß║ú |
|---|---|---|---|
| Backend | `backend/` | 3001 | Payload CMS 3 (Next.js monolith) ΓÇö quß║ún l├╜ nß╗Öi dung, booking, SEO, webhook revalidate |
| Admin CMS | `admin/` | 5173 | Single Page Application (React 19 + Vite + Tailwind) quß║ún trß╗ï 11 ph├ón hß╗ç chuy├¬n s├óu |
| ~~Frontend~~ | ~~`frontend/`~~ | ~~3000~~ | **CANCELLED** ΓÇö thay bß║▒ng site TestSEO ngo├ái repo |

Database: **PostgreSQL** chß║íy trß╗▒c tiß║┐p tr├¬n m├íy (local service / port 5432).

## Y├¬u cß║ºu m├┤i tr╞░ß╗¥ng

- Node.js v20+ (khuyß║┐n nghß╗ï v24)
- npm 10+
- PostgreSQL c├ái tr├¬n m├íy (port 5432, database `cms`, user `cms` hoß║╖c `postgres`)

## C├ích chß║íy

### 1. Khß╗ƒi ─æß╗Öng database (PostgreSQL tr├¬n m├íy)

─Éß║úm bß║úo dß╗ïch vß╗Ñ PostgreSQL ─æang chß║íy tr├¬n m├íy (port 5432):
- Service Windows: `postgresql-x64-18` (tß╗▒ khß╗ƒi ─æß╗Öng c├╣ng Windows hoß║╖c bß║¡t qua `services.msc`)
- Hoß║╖c khß╗ƒi ─æß╗Öng thß╗º c├┤ng:
  ```powershell
  & "F:\PostgreSQL\bin\pg_ctl.exe" -D "F:\PostgreSQL\data" start
  ```
- Kß║┐t nß╗æi mß║╖c ─æß╗ïnh trong `backend/.env`:
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

> **Khß╗ƒi ─æß╗Öng song song**: Mß╗ƒ 2 cß╗¡a sß╗ò terminal ri├¬ng biß╗çt ─æß╗â chß║íy ─æß╗ông thß╗¥i:
> - **Terminal 1 (Backend)**: `cd backend; npm run dev` (M├íy chß╗º API tß║íi `http://localhost:4001`)
> - **Terminal 2 (Admin CMS)**: `cd admin; npm run dev` (Giao diß╗çn Quß║ún trß╗ï tß║íi `http://localhost:5173`)

### 4. Frontend C├┤ng khai (Public Site) ΓÇö ─É├â Hß╗ªY (pivot 2026-10-10)

Kh├┤ng c├▓n `frontend/` trong repo. Site public l├á project TestSEO ngo├ái repo,
tß╗▒ gß╗ìi `/api/v1/*` cß╗ºa backend (xem `docs/website/CMS_BACKEND_SEO_SPECIFICATION_v1.1.md`).
Webhook revalidate ph├¡a public site cß║ºn endpoint
`POST /api/v1/webhooks/revalidate` (spec ┬º5.5) ΓÇö backend gß╗ìi tß╗¢i `REVALIDATE_URL`.

### 4. Seed dß╗» liß╗çu

```powershell
cd backend
npm run seed
```

### 5. Test

```powershell
cd backend
npm test
```

Lß╗çnh hß╗»u ├¡ch kh├íc: `npm run typecheck`, `npm run build`, `npm run test:watch`.
Backend kh├┤ng c├│ script `lint` ri├¬ng ΓÇö Next.js build ─æ├ú chß║íy lint + type check.

### 6. Seed chi tiß║┐t (idempotent)

```powershell
npm run seed            # tß╗òng: admin ΓåÆ routes(media) ΓåÆ pages ΓåÆ articles ΓåÆ airport ΓåÆ distance ΓåÆ redirects ΓåÆ company ΓåÆ pricing ΓåÆ users
npm run seed:airport    # 12 quß║¡n s├ón bay Nß╗Öi B├ái
npm run seed:distance   # 4 dß║úi km
npm run seed:redirects  # 5 redirect source=seed (tß╗½ next.config.ts c┼⌐)
npm run seed:company    # global company_settings
npm run seed:pricing    # global pricing_settings (priceValidUntil bß║»t buß╗Öc)
npm run seed:users      # editor + dispatcher test
```

## Biß║┐n m├┤i tr╞░ß╗¥ng (env)

Sao ch├⌐p `.env.example` th├ánh `.env` trong tß╗½ng app (─æ├ú c├│ sß║╡n `.env` local cho dev):

**`backend/.env`**

| Biß║┐n | Gi├í trß╗ï mß║½u | M├┤ tß║ú |
|---|---|---|
| `DATABASE_URI` | `postgresql://cms:cms_dev_password@localhost:5432/cms` | Chuß╗ùi kß║┐t nß╗æi Postgres |
| `PAYLOAD_SECRET` | `change-me-32chars-minimum` | Secret cß╗ºa Payload (tß╗æi thiß╗âu 32 k├╜ tß╗▒) |
| `PAYLOAD_PUBLIC_SERVER_URL` | `http://localhost:4001` | URL backend |
| `FRONTEND_URL` | `http://localhost:3000` | URL frontend (CORS / link tuyß╗çt ─æß╗æi) |
| `REVALIDATE_SECRET` | `change-me-revalidate` | Secret webhook revalidate ISR |
| `LOOKUP_SECRET` | `change-me-lookup` | Secret API lookup |
| `IP_SALT` | `change-me-ip-salt` | Salt b─âm IP (rate-limit/fingerprint) |
| `TELEGRAM_BOT_TOKEN` | *(trß╗æng)* | Token Telegram bot (notify) |
| `TELEGRAM_CHAT_ID` | *(trß╗æng)* | Chat ID Telegram |
| `NOTIFY_FALLBACK_EMAIL` | `ops@example.com` | Email dß╗▒ ph├▓ng khi notify lß╗ùi |
| `CMS_URL` | `http://localhost:4001` | URL self |
| `REVALIDATE_URL` | `http://localhost:3000` | URL site public ─æß╗â gß╗ìi webhook revalidate (fallback: `FRONTEND_URL`) |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | `admin@example.com` / ΓÇª | T├ái khoß║ún admin seed |
| `SEED_EDITOR_*` / `SEED_DISPATCHER_*` | `editor@example.com` / ΓÇª | T├ái khoß║ún roles seed |
| `ANONYMIZE_MONTHS` | `24` | Ng╞░ß╗íng ß║⌐n danh PII (th├íng) |

**`frontend/.env`**

| Biß║┐n | Gi├í trß╗ï mß║½u | M├┤ tß║ú |
|---|---|---|
| `CMS_URL` | `http://localhost:4001` | URL backend CMS |
| `REVALIDATE_SECRET` | `change-me-revalidate` | Secret gß╗ìi webhook revalidate |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | URL site public |

`.env` ─æ├ú ─æ╞░ß╗úc ─æ╞░a v├áo `.gitignore` ΓÇö kh├┤ng commit l├¬n git.

## Cß║Ñu tr├║c th╞░ mß╗Ñc

```
cms/
Γö£ΓöÇΓöÇ docker-compose.yml          # PostgreSQL 16 (service db, volume pgdata)
Γö£ΓöÇΓöÇ README.md
Γö£ΓöÇΓöÇ admin/                      # React 19 + Vite Admin CMS @ port 5173
Γöé   Γö£ΓöÇΓöÇ README.md               # H╞░ß╗¢ng dß║½n chi tiß║┐t ph├ón hß╗ç Admin CMS
Γöé   Γö£ΓöÇΓöÇ package.json
Γöé   Γö£ΓöÇΓöÇ vite.config.ts
Γöé   Γö£ΓöÇΓöÇ src/                    # 11 ph├ón hß╗ç quß║ún trß╗ï, components, context, routes
Γöé   ΓööΓöÇΓöÇ tests/                  # Vitest suite to├án diß╗çn
Γö£ΓöÇΓöÇ backend/                    # Payload CMS 3 @ port 3001
Γöé   Γö£ΓöÇΓöÇ next.config.ts
Γöé   Γö£ΓöÇΓöÇ payload.config.ts
Γöé   Γö£ΓöÇΓöÇ src/
Γöé   Γöé   Γö£ΓöÇΓöÇ app/                # Admin panel + API routes /api/v1/**
Γöé   Γöé   Γö£ΓöÇΓöÇ collections/        # 10 collections
Γöé   Γöé   Γö£ΓöÇΓöÇ globals/            # 2 globals
Γöé   Γöé   Γö£ΓöÇΓöÇ lib/                # pricing, booking, notify, api, seo, revalidate
Γöé   Γöé   ΓööΓöÇΓöÇ seed/               # npm run seed (+ seed:* ri├¬ng lß║╗)
Γöé   Γö£ΓöÇΓöÇ media/                  # upload media (gitignore, giß╗» .gitkeep)
Γöé   Γö£ΓöÇΓöÇ tests/                  # vitest
Γöé   ΓööΓöÇΓöÇ .env.example
Γö£ΓöÇΓöÇ TestSEO/                    # KH├öNG c├▓n trong cms/ ΓÇö site public ngo├ái repo
ΓööΓöÇΓöÇ .specify/                   # Spec docs (spec-kit)
```

## T├ái liß╗çu spec

- Spec: [.specify/specs/001-headless-cms-booking-seo/spec.md](.specify/specs/001-headless-cms-booking-seo/spec.md)
- Plan: [.specify/specs/001-headless-cms-booking-seo/plan.md](.specify/specs/001-headless-cms-booking-seo/plan.md)
- Data model: [.specify/specs/001-headless-cms-booking-seo/data-model.md](.specify/specs/001-headless-cms-booking-seo/data-model.md)
- API contracts: [.specify/specs/001-headless-cms-booking-seo/contracts/api.md](.specify/specs/001-headless-cms-booking-seo/contracts/api.md)
- Tasks: [.specify/specs/001-headless-cms-booking-seo/tasks.md](.specify/specs/001-headless-cms-booking-seo/tasks.md)
- Constitution: [.specify/memory/constitution.md](.specify/memory/constitution.md)

## ß║¿n danh dß╗» liß╗çu c├í nh├ón (FR-B08)

─É╞ín ─æß║╖t xe c┼⌐ h╞ín **24 th├íng** ─æ╞░ß╗úc ß║⌐n danh PII theo ch├¡nh s├ích bß║úo mß║¡t
(spec ┬º2.3 ΓÇö FR-B08): t├¬n kh├ích ΓåÆ `Kh├ích h├áng ****`, sß╗æ ─æiß╗çn thoß║íi ΓåÆ mask
giß╗» 4 sß╗æ cuß╗æi, email ΓåÆ redacted, chuß╗ùi giß╗æng S─ÉT trong ghi ch├║ ΓåÆ `***`.
`sourceIpHash` giß╗» nguy├¬n (─æ├ú hash, kh├┤ng l╞░u IP th├┤). Script idempotent ΓÇö
chß║íy lß║íi kh├┤ng c├▓n g├¼ ─æß╗â sß╗¡a.

```bash
cd backend

# Xem tr╞░ß╗¢c: in sß╗æ liß╗çu, KH├öNG ghi database
npm run anonymize:pii -- --dry-run

# Chß║íy thß║¡t
npm run anonymize:pii

# ─Éß╗òi ng╞░ß╗íng (mß║╖c ─æß╗ïnh 24 th├íng) ΓÇö th├¬m v├áo backend/.env
ANONYMIZE_MONTHS=36
```
