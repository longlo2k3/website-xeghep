# Progress Log — Xe Ghép Lubi SEO Next.js Project

## Session Information
- **Session Start**: 2026-10-06T15:08:03+07:00
- **Mode**: Spec-Kit (`.spec-mode` = `spec-kit`)
- **Complexity**: Thorough (Multi-module Next.js App Router, complete SEO architecture per `AGENTS.md`)
- **Status**: Phase 1 (Specification) Completed. Gate G1 awaiting user confirmation.

---

## Activity Log

### [2026-10-06 15:10:00] Step 1 & Step 2 — Mode Selection & Complexity Triage
- Checked signals: Brand new project with 2 files (`Duan.md`, `AGENTS.md`).
- Selected mode: `spec-kit` (written to `.spec-mode`).
- Triaged complexity: **Thorough** (full production-ready Next.js site covering 11 routes, dynamic pages, structured data graph, rigorous SEO compliance, unit tests).

### [2026-10-06 15:11:00] Phase 1 — Specification & Constitution
- Created `.specify/memory/constitution.md` incorporating Spec-Kit principles and complete SEO rules from `AGENTS.md` v2.0.0.
- Created `.specify/specs/xe-ghep-hanoi-seo/spec.md` with comprehensive product user stories (US-01 through US-06) in Given-When-Then format, covering all 11 pages from `Duan.md`.
- Created `findings.md` documenting tech decisions and the SEO compliance matrix.
- Initialized `task_plan.md` mapping out all 5 phases and quality gates.

### [2026-10-06 15:12:30] Gate G1 — Inline Spec Review
- Verified all requirements have Given-When-Then testable acceptance criteria.
- Verified spec contains only What & Why (no implementation details leaked).
- Verified alignment with Constitution and AGENTS.md rules.
- Inline spec self-review checklist: **PASSED**.
- User confirmed: "oke" to proceed with plan & implementation.

### [2026-10-06 15:20:00] Phase 2 & Phase 3 — Architecture, Planning & Design System
- Generated `.specify/specs/xe-ghep-hanoi-seo/plan.md` (Engineering specs, SSR/SSG rendering mode, metadata API).
- Generated `.specify/specs/xe-ghep-hanoi-seo/tasks.md` (Traceable task matrix).
- Generated `design-system/MASTER.md` following UI/UX Pro Max tokens (VinFast Emerald `#008542`, Deep Forest `#064e3b`, Warm Amber `#f59e0b`, Be Vietnam Pro typography, 44px touch targets).

### [2026-10-06 15:30:00] Phase 4 — Implementation & TDD
- Scaffolded Next.js 15+ App Router codebase, Tailwind CSS, TypeScript, Lucide, Vitest.
- Configured `next.config.ts` (strict security headers, `trailingSlash: false`, WebP/AVIF images).
- Built core domain libraries: `slugify` (Rule 4.2), `formatVND`, `constructMetadata` (Rule 1.1-1.3, 2.1), `schema.ts` (Rule 7.1-7.4).
- Built data layers: `company-info.ts`, `routes.ts`, `airport-pricing.ts`, `long-distance-pricing.ts`, `articles.ts`.
- Built components: Semantic Header, Footer, Floating Contact buttons (Hotline/Zalo/SMS/Messenger/Booking), HeroBanner (LCP priority), QuickBookingTabs (3 tabs: Xe Ghép, Sân Bay, Đường Dài), FiveCommitments, FeaturedRoutes, WhyChooseUs, PartnerCallout, Testimonials, SeoArticle, Breadcrumbs, JsonLd.
- Built all 11+ required routes from `Duan.md`:
  - `/` (Trang chủ)
  - `/dat-xe` & `/dat-xe/thanh-cong` (`noindex`)
  - `/dich-vu-xe-ghep` & `/[slug]` (SSG 8 routes: Ninh Bình, Nam Định, Thái Bình, Hải Phòng, Quảng Ninh, Phú Thọ, Hải Dương, Hưng Yên)
  - `/taxi-dua-don-san-bay-noi-bai`
  - `/taxi-duong-dai`
  - `/bang-gia`
  - `/dang-ky-doi-tac`
  - `/tin-tuc` & `/tin-tuc/[slug]` (SSG 4 cẩm nang)
  - `/gioi-thieu`
  - `/lien-he`
  - `not-found.tsx` (HTTP 404)
  - `robots.ts` & `sitemap.ts` (Dynamic XML sitemap)

### [2026-10-06 15:40:00] Phase 5 — Verification & Production Build (Gate G4)
- **Unit & Integration Tests**: 14/14 tests passed in `tests/*.test.ts`.
- **Production Build**: `npm run build` executed successfully (Exit code 0).
  - 27 static/SSG pages prerendered.
  - First Load JS shared: 103 kB.
- **Raw HTML Inspection**:
  - Raw HTML contains full `<title>`, `<meta name="description">`, `<link rel="canonical">`.
  - Layout DOES NOT define canonical (zero duplicate canonical inheritance).
  - Schema JSON-LD properly rendered as `@graph` (`TaxiService`, `Organization`, `WebSite`, `BreadcrumbList`).
  - True 404 response handler ready.
  - All anchor links use standard `<a href="...">` (no `onClick` navigation).
- **Status**: Production-ready. Gate G4 PASSED.

### [2026-10-06 16:55:00] Phase 6 — Full Integration of `xehaiphong.md` Dataset
- **Domain & Branding**:
  - Migrated brand name to **Xe Ghép Hải Phòng**, domain to `https://xehaiphong.vn`.
  - Updated Address to **Quán Toan, Hải Phòng**, Hotline/Zalo to **0852.168.956**, Email to **datxe@xehaiphong.vn**.
- **Data & Pricing Engine**:
  - Configured 10 exact interprovincial routes from `xehaiphong.md` with 4 pricing tiers: Ghép 1 người, Ghép 2 người, Bao xe 4/5 chỗ / Xe riêng, Bao xe 7 chỗ.
  - Added new service: **Vận tải hàng hóa liên tỉnh** (ký gửi bưu phẩm, tài liệu siêu tốc trong ngày).
  - Implemented 6 core service commitments (giảm 30%-50% cước, giá minh bạch, chạy thẳng 1-3 khách, xe 5 sao đời mới, tài xế chuyên nghiệp, **hỗ trợ đổi hoặc hủy chuyến miễn phí 100%**).
  - Implemented 2 payment methods (Chuyển khoản trực tuyến & Tiền mặt cho tài xế).
- **Component & UX Upgrades**:
  - `QuickBookingTabs.tsx` & `FullBookingForm.tsx`: 3 dynamic tabs matching `xehaiphong.md`: Xe Đi Ghép, Bao Xe Riêng, Vận Tải Hàng Hóa.
  - Refactored `Header.tsx`, `Footer.tsx`, `FloatingContact.tsx`, `HeroBanner.tsx`, `FiveCommitments.tsx`, `OurServices.tsx`, `FeaturedRoutes.tsx`, `WhyChooseUs.tsx`, `SeoArticle.tsx`, `/bang-gia`, `/dich-vu-xe-ghep`, `app/[slug]/page.tsx`.
- **Verification Evidence**:
  - Vitest: 14/14 tests passed in `tests/*.test.ts`.
  - Next.js Production Build: 29 static SSG pages prerendered (`Exit code 0`).
  - Raw HTML audit confirmed canonical `https://xehaiphong.vn/...`, Schema.org `@graph` with authentic company & route data, and zero duplicate title brands.
  - Sitemap confirmed 23 canonical URLs with `https://xehaiphong.vn/`.

### [2026-10-08 09:35:00] Phase 7 — Full Redesign & Content Alignment per `spec_v2.md`
- **Brand & Company Info**:
  - Brand name: **XE GHÉP LIÊN TỈNH**, domain `https://xegheplientinh.vn`.
  - Hotline/Zalo: **0962.298.293** (tel: `0962298293`), Email: **xegheplientinhvip@gmail.com**, Fanpage: **Xe Ghép Bắc Giang - Bắc Ninh - Hải Phòng**.
  - Updated 6 core commitments per Section 5 in `spec_v2.md`.
- **9 Interprovincial Routes & Exact Pricing**:
  - Route 1: Hải Phòng ⇄ Bắc Ninh – Bắc Giang (Ghép: 250k - 300k, Bao 4-5 chỗ: 900k - 1tr, Bao 7 chỗ: 1.1tr - 1.2tr)
  - Route 2: Hải Phòng ⇄ Hà Nội – Nội Bài (Ghép: 200k - 250k, Bao xe: 700k - 800k)
  - Route 3: Hải Phòng ⇄ Hạ Long (Bao xe: 450k)
  - Route 4: Hải Phòng ⇄ Móng Cái (Bao xe: 1.4tr)
  - Route 5: Hạ Long ⇄ Bắc Ninh – Bắc Giang (Bao xe: 1.1tr)
  - Route 6: Hà Nội ⇄ Móng Cái (Bao xe: 1.7tr)
  - Route 7: Hà Nội ⇄ Hạ Long (Bao xe: 1.1tr)
  - Route 8: Hải Phòng ⇄ Hải Dương (Bao xe: 450k)
  - Route 9: Hải Phòng ⇄ Thái Nguyên (Bao xe: 1.2tr)
  - URL architecture: All routes reside at `/tuyen-lien-tinh/[slug]`.
- **Layout & Pages Rebuilt**:
  - `Header.tsx`: Logo with subline hotline, 5 nav items with 9-route dropdown under "Các tuyến liên tỉnh", red phone CTA button.
  - `TopBanner.tsx`: Row 1 (7 main routes) + Row 2 (ĐẶT XE LIÊN HỆ NGAY: 0962.298.293).
  - `FloatingContact.tsx`: Round action button on bottom-left, red pill button "GỌI NGAY: 0962.298.293" on bottom-right.
  - `Footer.tsx`: 4 columns strictly adhering to `spec_v2.md` Section 2.4.
  - Homepage (`src/app/page.tsx`): 6 sections in exact order (Section 1 Price Banner, Section 2 Hero, Section 3 BookingForm, Section 4 9-route pricing cards, Section 5 WhyChooseUs yellow box with slogan, Section 6 IntroTeaser).
  - Route listing (`/tuyen-lien-tinh`): Tab filters (Tất cả, Hải Phòng, Hà Nội, Hạ Long, Móng Cái, Bắc Ninh – Bắc Giang) + 9 cards.
  - Route detail (`/tuyen-lien-tinh/[slug]`): SSG 9 routes, full pricing table, FAQs, booking form, related routes.
  - `/gioi-thieu`: 7 detailed sections per spec Section 4.
  - `/lien-he`: Hotline, email, fanpage link, contact form, booking form.
  - Policies: `/chinh-sach/thanh-toan`, `/chinh-sach/dam-bao`, `/chinh-sach/bao-mat`.
  - Redirects: 308 redirects in `next.config.ts` from old routes to new `/tuyen-lien-tinh/[slug]` & `/tuyen-lien-tinh`.
- **Verification Evidence**:
  - Vitest: 14/14 tests passed (`npm test`).
  - Next.js Production Build: 26 static SSG pages successfully prerendered with exit code 0 (`npm run build`).
  - Zero TypeScript errors, zero lint warnings. All SEO canonicals, schemas, titles, descriptions comply with `AGENTS.md` v2.0.0.

---

## 2026-10-10 · Feature 002-connect-backend-api (Session này)

### Phase 0: Session Recovery & Khảo sát hiện trạng (Gate G0)
- Kiểm tra môi trường: Backend Payload CMS 3 (:3001) hoạt động với PostgreSQL (`cms-db`).
- Khảo sát branch `feat/cms-api` trong `TestSEO`:
  - 15/15 tests trong `tests/` pass.
  - `npx tsc --noEmit` báo 3 lỗi tại `src/components/booking/BookingForm.tsx` (dòng 401 & 826: `Cannot find name 'estimatedPrice'`).
  - `src/lib/api.ts` (757 dòng), `src/lib/booking.ts`, `src/lib/redirects.ts`, `src/lib/revalidate.ts`, `src/middleware.ts` đã scaffold đầy đủ.
  - Các trang công khai (`/`, `/tuyen-lien-tinh`, `layout.tsx`) đã chuyển đổi sang `getRoutes()`.
- Ghi nhận các điểm còn dang dở: `BookingForm.tsx`, `dat-xe/thanh-cong`, `tin-tuc`, `sitemap.ts`, `next.config.ts`.

### Phase 1: Specification (Gate G1)
- Viết `.specify/specs/002-connect-backend-api/spec.md`: 4 User Stories (US-1..US-4) định dạng Given-When-Then, phạm vi in-scope/out-of-scope.
- Viết `.specify/specs/002-connect-backend-api/plan.md`: 9 điểm Constitution Check, lộ trình T1..T6.
- Cập nhật `task_plan.md` và `findings.md`.
- Inline spec self-review: **PASSED** (What/How tách biệt, không sửa logic ngoài phạm vi, bảo toàn quy tắc SEO).
- Đang chờ người dùng xác nhận Gate G1 để chuyển sang Phase 4 (Implementation).

### Phase 4: Implementation & Verification (Gate G4)
- **T1: Sửa BookingForm.tsx**: Sửa triệt để 2 chỗ dùng `estimatedPrice.price` và `estimatedPrice.unit` tại dòng 401 & 826 thành `priceDisplay` và `unitDisplay`. Thêm `disabled={submitting}` ngăn submit lặp.
- **T2: Nối trang xác nhận `/dat-xe/thanh-cong`**: Gọi `lookupBooking(code, { token: t })` để lấy dữ liệu thực tế từ backend; hiển thị điểm trả, giờ đón, mã đơn, PII che `0962***293`. Giữ `noindex: true`.
- **T3: Nối Tin tức CMS**:
  - `tin-tuc/page.tsx`: Nạp `getArticles({ limit: 12 })` kèm fallback `FALLBACK_ARTICLES`.
  - `tin-tuc/[slug]/page.tsx`: Nạp `getArticle(slug)` cho `generateMetadata` và content; SSG với `generateStaticParams`; xử lý `notFound()` chuẩn SEO.
- **T4: Nối Sitemap động**: Gọi `getSitemapEntries()` lấy 20 canonical URLs đã sanitize từ CMS.
- **T5: Remote Patterns**: Thêm `localhost:3001`, `127.0.0.1:3001`, `xegheplientinh.vn` vào `next.config.ts`.
- **T6: Verification Evidence**:
  - `npx tsc --noEmit` -> Exit code 0 (0 error).
  - `npm test` -> 4 files, 15/15 tests PASSED (exit code 0).
  - `npm run build` -> Next.js 15.5 compiled successfully, 26 static/SSG pages prerendered, 0 lỗi runtime.

**GATE G4 ACCEPTED — HOÀN THÀNH KẾT NỐI TESTSEO VỚI BACKEND PAYLOAD CMS 3.**

---

### Phase 6: SEO Audit & Performance Optimization per AGENTS.md (2026-10-11)
- **Rà soát 16 mục trong AGENTS.md**:
  - `robots.ts`: Gỡ bỏ `/dat-xe/thanh-cong` khỏi `disallow` (do trang đã có `noindex: true`, vi phạm Rule 1.5). Thêm chặn toàn bộ `disallow: /` trên môi trường không phải production (Rule 14.1).
  - `src/lib/schema.ts`: Bổ sung `@context: "https://schema.org"` cho `buildBreadcrumbSchema` (Rule 7.1).
  - `src/app/sitemap.ts`: Bổ sung `getRoutes({ fields: "slug" })` vào danh sách fallback, đảm bảo 20 URLs luôn sẵn sàng (Rule 9.2).
  - Thứ tự Heading (Rule 3.2):
    - `PriceBannerSection.tsx`: Chuyển `<h2>` thành `<p>` có style đồng bộ để tránh H2 xuất hiện trước H1 ở `HeroSection`.
    - `src/app/tuyen-lien-tinh/page.tsx`: Nâng `<h3>` cam kết chung lên `<h2>` để không nhảy cấp sau `<h1>`.
    - `src/app/tin-tuc/page.tsx`: Bổ sung `<h2>` tiêu đề mục bài viết khác và chuyển tiêu đề sidebar sang `<h2>`.
  - Bảo mật & Hiệu suất (Rule 13.2 & Rule 6.5): Bổ sung `Strict-Transport-Security` và `X-Frame-Options` trong `next.config.ts`.
  - Icon & Brand (Rule 1.7): Tạo `public/icon.svg` (512x512) và khai báo `apple-touch-icon`. Sửa lỗi copy thương hiệu cũ "Xe Ghép Lubi" thành `{BRAND_NAME}` trong `not-found.tsx`.
  - Test Suite: Bổ sung `vitest.config.ts` để alias `@/` hoạt động ổn định; thêm test case cho `robots.ts` và breadcrumbs `@context`. 4 test files, 16/16 tests PASSED.
  - Build Check: `npm run build` compiled trong 8.7s, prerender thành công 26 static/SSG routes (exit code 0).

---

### Phase 7: Dynamic Company Settings API Integration (`/api/v1/settings/company`) (2026-10-11)
- **Mục tiêu**: Kết nối API `company_settings` từ Payload CMS 3 cho toàn bộ ứng dụng frontend thay vì hardcode thông tin liên hệ / cam kết, kèm cơ chế fallback `FALLBACK_COMPANY_SETTINGS` fail-open tuyệt đối an toàn.
- **Thực hiện**:
  1. `src/lib/api.ts`: Bổ sung `FALLBACK_COMPANY_SETTINGS`, bọc `try/catch` fail-open trong `getCompanySettings()`, xuất khẩu helper `getCompanyInfo()`.
  2. `src/lib/schema.ts`: Cập nhật `buildGlobalBusinessSchema(settings?: CompanySettingsData)` nhận động hotline, tên công ty, địa chỉ, working hours, geo coordinates từ CMS.
  3. `src/app/layout.tsx`: Nạp `Promise.all([getCompanySettings(), getRoutes()])` và phân phối `companyInfo={companySettings.info}` cho `Header`, `Footer`, `FloatingContact`, và Schema markup.
  4. Nối động `companyInfo` và `commitments` vào các components:
     - `Header.tsx`, `TopBanner.tsx`, `Footer.tsx`, `FloatingContact.tsx`, `HeroSection.tsx`, `BookingForm.tsx`, `AboutWhyChooseUs.tsx`.
  5. Nối động vào toàn bộ các trang:
     - `src/app/page.tsx`, `src/app/gioi-thieu/page.tsx`, `src/app/lien-he/page.tsx`, `src/app/dat-xe/page.tsx`, `src/app/dat-xe/thanh-cong/page.tsx`, `src/app/not-found.tsx`, `src/app/tuyen-lien-tinh/page.tsx`, `src/app/tuyen-lien-tinh/[slug]/page.tsx`, `src/app/tin-tuc/page.tsx`, `src/app/tin-tuc/[slug]/page.tsx`, `src/app/chinh-sach/thanh-toan/page.tsx`, `src/app/chinh-sach/bao-mat/page.tsx`, `src/app/chinh-sach/dam-bao/page.tsx`.
  6. Xử lý Vitest trên Windows Node v24: Cấu hình `poolOptions: { forks: { singleFork: true } }` trong `vitest.config.ts`.
  7. Verification:
     - `npx tsc --noEmit` -> 0 lỗi (Exit code 0).
     - `npm test` -> 4/4 test files, 17/17 tests PASSED (Exit code 0).
     - `npm run build` -> Next.js 15.5 compiled trong 13.1s, 26/26 static/SSG pages prerendered (Exit code 0).


