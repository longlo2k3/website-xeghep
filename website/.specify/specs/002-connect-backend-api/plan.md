# Engineering Plan — Kết Nối TestSEO Với Backend Payload CMS 3 (/api/v1)

> **Feature**: `002-connect-backend-api`  
> **Workspace**: `c:\Users\LongVi\OneDrive\Desktop\TestSEO` (branch `feat/cms-api`)  
> **Spec**: `.specify/specs/002-connect-backend-api/spec.md`  

---

## 1. Technical Context & Architecture

- **Frontend App**: Next.js 15+ App Router, React 19, TypeScript strict, Tailwind CSS.
- **Backend API**: Payload CMS 3 monolith chạy trên port 3001 (`http://localhost:3001` dev, hoặc cấu hình qua `CMS_URL` / `NEXT_PUBLIC_CMS_URL`).
- **Data Layer Client**: `src/lib/api.ts` đã được thiết kế với wrapper envelope typed:
  - `getRoutes()`, `getRoute(slug)`: Lấy dữ liệu tuyến đường.
  - `postEstimate(input)`: Tính giá ước tính realtime.
  - `postBooking(payload, idempotencyKey)`: Tạo đơn đặt xe.
  - `lookupBooking(code, { token })`: Tra cứu thông tin đơn hàng an toàn.
  - `getArticles()`, `getArticle(slug)`: Lấy bài viết tin tức.
  - `getSitemapEntries()`: Lấy danh sách URL sitemap chuẩn từ CMS.
  - `getCompanySettings()`, `getPricingSettings()`, `getAirportPricing()`, `getDistanceRates()`: Cấu hình doanh nghiệp và bảng giá.
- **Webhook Revalidation**: `src/app/api/webhooks/revalidate` và `src/app/api/v1/webhooks/revalidate` đã dựng sẵn để nhận webhook từ backend khi admin cập nhật dữ liệu.

---

## 2. Constitution Check (9/9 Verifications)

1. **SSR / SSG First**: Mọi trang công khai (`/`, `/tuyen-lien-tinh`, `/tin-tuc`, `/gioi-thieu`, `/lien-he`, `/chinh-sach/*`) đều là Server Components, nạp dữ liệu từ backend và render sẵn HTML.
2. **Absolute Canonical**: Từng trang sinh canonical tuyệt đối qua `constructMetadata`.
3. **No Layout Canonical**: `src/app/layout.tsx` KHÔNG định nghĩa canonical (chỉ có `metadataBase`).
4. **Next.js 15 Async Params**: Tất cả các dynamic route (`[slug]`) và `searchParams` đều dùng `await params` / `await searchParams`.
5. **Real HTTP Status Codes**: Không tìm thấy tài nguyên -> ném `notFound()` (trả mã 404 thực tế).
6. **No Soft Links**: Điều hướng nội bộ 100% qua `<Link>` hoặc `<a>`, không dùng `onClick` + `router.push` thay cho liên kết ngữ nghĩa.
7. **Noindex Private Pages**: `/dat-xe/thanh-cong` luôn gắn cờ `noindex: true`.
8. **Schema.org Truthfulness**: JSON-LD Schema `@graph` khớp 100% với dữ liệu hiển thị thực tế từ backend.
9. **Image LCP & Remote Patterns**: Next/Image được cấu hình `remotePatterns` cho phép tải ảnh từ domain CMS mà không bị lỗi cấu hình.

---

## 3. Implementation Steps & File Changes

### Bước 1: Sửa lỗi BookingForm (`src/components/booking/BookingForm.tsx`)
- Thay thế `estimatedPrice.price` và `estimatedPrice.unit` tại dòng 401 & 826 bằng `priceDisplay` và `unitDisplay`.
- Đảm bảo trạng thái loading "…" hoặc giá mặc định hiển thị mượt mà.

### Bước 2: Nối trang cảm ơn (`src/app/dat-xe/thanh-cong/page.tsx`)
- Tiếp nhận `searchParams: { code?: string; t?: string }`.
- Nếu có `code` và `t`, gọi `lookupBooking(code, { token: t })`.
- Hiển thị thông tin chính xác từ đơn hàng đã lưu trong DB (khách hàng, điện thoại đã ẩn `0962***293`, lộ trình, loại xe, thời gian, giá tiền format VND).
- Giữ fallback an toàn nếu không có tham số.

### Bước 3: Nối Tin tức & Bài viết (`src/app/tin-tuc/page.tsx` & `src/app/tin-tuc/[slug]/page.tsx`)
- Trong `src/app/tin-tuc/page.tsx`: gọi `getArticles({ limit: 12 })`.
- Trong `src/app/tin-tuc/[slug]/page.tsx`:
  - `generateStaticParams`: gọi `getArticles()` lấy danh sách slug.
  - `generateMetadata`: gọi `getArticle(slug)`.
  - `ArticleDetailPage`: gọi `getArticle(slug)`, render nội dung và TOC từ CMS. Xử lý `isNotFoundError(error)` -> `notFound()`.

### Bước 4: Nối Sitemap động (`src/app/sitemap.ts`)
- Gọi `getSitemapEntries()`.
- Map danh sách sitemap entry sang format `MetadataRoute.Sitemap`.
- Fallback an toàn nếu backend không phản hồi.

### Bước 5: Cấu hình Remote Patterns (`next.config.ts`)
- Thêm `localhost` (port 3001) và URL từ biến môi trường `CMS_URL` vào `images.remotePatterns`.

### Bước 6: Kiểm tra toàn diện (Verification)
- Chạy `npm test`: tất cả các test unit / contract pass.
- Chạy `npx tsc --noEmit`: 0 lỗi typecheck.
- Chạy `npm run build`: compile thành công toàn bộ static & dynamic routes.
