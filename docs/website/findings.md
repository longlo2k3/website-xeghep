# Findings — Kết Nối TestSEO Với Backend Payload CMS 3 (/api/v1)

## A. Trạng Thái Hiện Tại (Khảo sát 2026-10-10)

1. **Backend Payload CMS 3 (:3001)**:
   - Container Postgres `cms-db` đang hoạt động (Up 11 hours, healthy).
   - Port 3001 đang lắng nghe, các endpoint chính đã được verify trực tiếp:
     - `GET /api/v1/routes`: Trả về 9 tuyến đầy đủ tier giá, thumbnail URL, regions.
     - `GET /api/v1/settings/company`: Trả về thông tin hotline `0962.298.293`, 6 cam kết, 2 phương thức thanh toán, 4 đánh giá.
     - `GET /api/v1/seo/sitemap`: Trả về 20 canonical URLs đã lọc sạch trang nội bộ và trang redirect.
     - `GET /api/v1/pricing/airport` & `GET /api/v1/pricing/distance`: Hoạt động chuẩn xác.
     - `POST /api/v1/pricing/estimate`: Trả về báo giá tức thì.
     - `POST /api/v1/bookings` & `GET /api/v1/bookings/:code`: Tạo đơn và tra cứu đơn kèm token HMAC.

2. **Frontend TestSEO (`feat/cms-api`)**:
   - `src/lib/api.ts` (757 dòng): Đã cài đặt đầy đủ client envelope typed cho toàn bộ 15 API backend.
   - `src/lib/booking.ts`: Đã có validate số điện thoại Việt Nam, convert ngày giờ sang ISO +07:00, honeypot `website`, và UUID `Idempotency-Key`.
   - `src/lib/redirects.ts` & `src/middleware.ts`: Đã có cache in-memory 60s và cơ chế fail-open khi CMS offline.
   - `src/lib/revalidate.ts` & `src/app/api/webhooks/revalidate`: Đã sẵn sàng nhận webhook `x-revalidate-secret`.
   - `@/data/routes.ts`: Đã được gỡ bỏ; các trang chủ, `/tuyen-lien-tinh`, `layout.tsx`, `gioi-thieu`, `lien-he` đã nhận `routes` từ `getRoutes()`.

## B. Những Điểm Cần Xử Lý Để Hoàn Thiện (Gaps)

1. **`src/components/booking/BookingForm.tsx`**:
   - Dòng 401 & dòng 826 tham chiếu `estimatedPrice.price` và `estimatedPrice.unit` (biến cũ chưa khai báo sau khi refactor) gây lỗi TS2304 khi chạy `tsc --noEmit`.
   - Cần thay bằng `priceDisplay` và `unitDisplay` (đã có sẵn từ kết quả gọi `postEstimate`).

2. **`src/app/dat-xe/thanh-cong/page.tsx`**:
   - Hiện vẫn chỉ đọc query string cơ bản hoặc dùng mockup data `HP886699`.
   - Cần dùng `lookupBooking(code, { token: t })` để lấy thông tin thực tế của đơn hàng từ backend nếu có param, fallback nếu không có, giữ `noindex: true`.

3. **`src/app/tin-tuc/page.tsx` & `src/app/tin-tuc/[slug]/page.tsx`**:
   - Vẫn import trực tiếp từ `@/data/articles`.
   - Cần chuyển sang `getArticles()` và `getArticle(slug)` từ `src/lib/api.ts`.

4. **`src/app/sitemap.ts`**:
   - Vẫn map thủ công `ARTICLES`.
   - Cần chuyển sang gọi `getSitemapEntries()` từ `src/lib/api.ts` để đồng bộ trực tiếp từ CMS.

5. **`next.config.ts`**:
   - `remotePatterns` hiện chỉ có `images.unsplash.com`. Cần bổ sung `localhost` port 3001 và domain CMS để Next/Image nạp ảnh từ CMS `/media/*`.

## C. Kết Quả Audit SEO Theo AGENTS.md (2026-10-11)

1. **Robots.txt vs Noindex Conflict (Rule 1.5 & Rule 14.1)**:
   - Phát hiện: `robots.ts` có `disallow: ["/dat-xe/thanh-cong"]` trong khi trang này đã có `noindex: true`. Rule 1.5 cấm vừa disallow vừa noindex.
   - Khắc phục: Gỡ bỏ `/dat-xe/thanh-cong` khỏi `disallow`, thêm rule chặn toàn bộ `disallow: /` trên môi trường non-production/staging để ngăn rò rỉ index.

2. **Structured Data Breadcrumbs @context (Rule 7.1)**:
   - Phát hiện: `buildBreadcrumbSchema` thiếu `@context: "https://schema.org"`.
   - Khắc phục: Đã bổ sung `@context` hợp lệ chuẩn W3C / Google Rich Results.

3. **Heading Hierarchy (Rule 3.2)**:
   - Phát hiện: Trang chủ có `<h2>` ở `PriceBannerSection` nằm trên `<h1>` ở `HeroSection`. Trang `/tuyen-lien-tinh` nhảy từ `<h1>` xuống `<h3>`. Trang `/tin-tuc` thiếu `<h2>` bao quanh lưới bài viết khác.
   - Khắc phục: Đồng bộ thứ tự chuẩn H1 -> H2 -> H3 không nhảy cấp.

4. **Security & Performance Headers (Rule 13.2 & Rule 6.5)**:
   - Đã bổ sung `Strict-Transport-Security: max-age=31536000; includeSubDomains` và `X-Frame-Options: SAMEORIGIN` vào `next.config.ts`.

5. **Favicon & Scalable SVG Assets (Rule 1.7)**:
   - Tạo `public/icon.svg` độ phân giải cao 512x512, cập nhật `layout.tsx` icons khai báo đầy đủ favicon và apple-touch-icon.

6. **Sitemap Dynamic Fallback (Rule 9.2)**:
   - Bổ sung `getRoutes({ fields: "slug" })` vào danh sách fallback trong `sitemap.ts` để luôn có đầy đủ 20 URL ngay cả khi API CMS gián đoạn.

## D. Kết Nối Toàn Diện API Company Settings (2026-10-11)

1. **API Client & Graceful Fallback (`src/lib/api.ts`)**:
   - `getCompanySettings()` đã được bổ sung `try/catch` với `FALLBACK_COMPANY_SETTINGS` fail-open an toàn, đảm bảo nếu CMS gặp sự cố thì hệ thống không bao giờ bị sập (500).
   - Xuất khẩu helper `getCompanyInfo()` trả về `CompanyInfoData` cho các component chỉ cần thông tin thương hiệu/liên hệ.

2. **Cập nhật Schema & Layout (`src/lib/schema.ts`, `src/app/layout.tsx`)**:
   - `buildGlobalBusinessSchema(settings?: CompanySettingsData)` nhận động dữ liệu từ CMS (hotline, address, geocodes, working hours) và fallback an toàn về `COMPANY_INFO`.
   - `layout.tsx` gọi song song `Promise.all([getCompanySettings(), getRoutes()])` và phân phối `companyInfo` xuống `Header`, `Footer`, `FloatingContact`, và Schema markup.

3. **Tất Cả Các Trang & Component Đã Nhận Dynamic Company Settings**:
   - `Header`, `TopBanner`, `Footer`, `FloatingContact`, `BookingForm`, `HeroSection`, `AboutWhyChooseUs`.
   - Các trang: Trang chủ (`/`), Giới thiệu (`/gioi-thieu`), Liên hệ (`/lien-he`), Đặt xe (`/dat-xe`), Đặt xe thành công (`/dat-xe/thanh-cong`), Tuyến liên tỉnh (`/tuyen-lien-tinh` & `[slug]`), Tin tức (`/tin-tuc` & `[slug]`), Chính sách (`thanh-toan`, `bao-mat`, `dam-bao`), và 404 (`not-found.tsx`).
   - Kiểm tra `npm test` (17/17 pass), `npx tsc --noEmit` (0 lỗi), `npm run build` (26/26 trang tĩnh biên dịch thành công, exit code 0).



## E. Tối Ưu Tốc Độ Tải Trang & Bảo Vệ Timeout (2026-10-12)

1. **Khắc Phục Điểm Nghẽn Middleware (src/middleware.ts)**:
   - Thêm MIDDLEWARE_TIMEOUT_MS = 500.
   - Dùng Promise.race([loadRedirects(), timeoutPromise]) đảm bảo middleware không bao giờ chặn request quá 500ms khi CMS phản hồi chậm hoặc đang khởi động.

2. **Timeout Bảo Vệ Trong API Client (src/lib/api.ts)**:
   - Thêm DEFAULT_GET_TIMEOUT_MS = 2500 và DEFAULT_POST_TIMEOUT_MS = 8000.
   - Áp dụng AbortSignal.timeout trên mọi request gọi sang CMS. Bắt lỗi TimeoutError và map sang CMS_TIMEOUT.
   - Bổ sung 	ry/catch cho getRoutes() và getRoute(slug) với cơ chế fallback tự động về FALLBACK_ROUTES và allbackRouteDetail(slug), ngăn chặn hoàn toàn việc build hoặc SSR bị treo 60s.

3. **Bộ Dữ Liệu Fallback Tuyến Đường Chuẩn (src/data/fallback-routes.ts)**:
   - Tách 9 tuyến xe ghép phổ biến thành dataset dùng chung cho cả runtime fail-open và unit test fixtures.
   - Kiểm tra 
pm test (17/17 pass trong 0.95s), 
px tsc --noEmit (0 lỗi).
