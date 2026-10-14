# Feature Specification — Kết Nối TestSEO Với Backend Payload CMS 3 (/api/v1)

> **Feature**: `002-connect-backend-api`  
> **Workspace**: `c:\Users\LongVi\OneDrive\Desktop\TestSEO` (branch `feat/cms-api`)  
> **Backend Source**: `c:\Users\LongVi\OneDrive\Desktop\cms\backend` (:3001)  
> **Constitution Compliance**: Aligned with `constitution.md` (SSR/SSG, Absolute Canonicals, no layout canonical, Schema @graph, noindex /dat-xe/thanh-cong)  

---

## 1. Bối cảnh & Mục tiêu

Site frontend Next.js 15 (`TestSEO`) đã được scaffold đầy đủ giao diện, SEO schema, layout và các components. Hiện tại branch `feat/cms-api` đang trong quá trình chuyển đổi từ mock static data (`@/data/routes.ts`, `@/data/articles.ts`, `@/data/company-info.ts`) sang gọi trực tiếp hệ thống API `/api/v1` của Payload CMS 3 backend.

Mục tiêu của đợt hoàn thiện này là:
1. Khắc phục dứt điểm các lỗi biên dịch TypeScript đang dang dở trong `BookingForm.tsx`.
2. Hoàn thiện trang xác nhận đặt xe `/dat-xe/thanh-cong` kết nối `lookupBooking` để hiển thị dữ liệu đơn hàng thực tế (mã đơn, lộ trình, giá ước tính, họ tên, số điện thoại đã che `0962***293`).
3. Hoàn thiện mục Tin tức & Cẩm nang (`/tin-tuc` và `/tin-tuc/[slug]`) lấy dữ liệu từ API `/api/v1/articles` và `/api/v1/articles/:slug` thay vì import cứng từ `@/data/articles`.
4. Hoàn thiện `sitemap.ts` đồng bộ động từ `/api/v1/seo/sitemap`.
5. Đảm bảo cấu hình hình ảnh `next.config.ts` chấp nhận host backend media (`localhost:3001` / `CMS_URL`).
6. Đảm bảo toàn bộ unit tests, typecheck (`tsc --noEmit`), và production build (`npm run build`) vượt qua 100% với exit code 0.

---

## 2. User Stories & Acceptance Criteria

### US-1: Báo Giá & Đặt Xe Trực Tuyến Từ Form (BookingForm)
**As a** khách hàng có nhu cầu đi xe ghép hoặc bao xe,  
**I want** form đặt xe tự động tính giá ước tính theo thời gian thực từ backend và gửi đơn xe an toàn,  
**So that** tôi biết chính xác mức giá niêm yết và nhận được mã đơn đặt chuyến thành công.

- **Scenario 1.1: Hiển thị giá ước tính tức thì từ backend**
  - **Given** người dùng chọn điểm đón, điểm đến hoặc tuyến đường,
  - **When** người dùng thay đổi loại xe, hình thức (ghép ghế / bao xe) hoặc số lượng khách,
  - **Then** form debounce gọi `POST /api/v1/pricing/estimate` và hiển thị giá niêm yết tương ứng, không gây lỗi runtime hay lỗi TypeScript (`priceDisplay`, `unitDisplay`).

- **Scenario 1.2: Gửi đơn đặt xe thành công**
  - **Given** người dùng điền đầy đủ họ tên, số điện thoại Việt Nam hợp lệ (10 số, đầu số hợp lệ), ngày giờ đón (tối thiểu sau thời điểm hiện tại),
  - **When** người dùng nhấn nút "ĐẶT XE NGAY",
  - **Then** client gửi payload chuẩn hóa tới `POST /api/v1/bookings` kèm `Idempotency-Key`, nhận về `bookingCode` và `lookupToken`, sau đó chuyển hướng an toàn tới `/dat-xe/thanh-cong?code=...&t=...`.

---

### US-2: Trang Xác Nhận Đơn Hàng & Tra Cứu (/dat-xe/thanh-cong)
**As a** khách hàng vừa hoàn tất đặt chuyến,  
**I want** xem lại thông tin chi tiết chuyến đi vừa đặt với tính năng bảo mật thông tin,  
**So that** tôi an tâm chuyến đi đã được ghi nhận và có mã đơn để tra cứu khi cần.

- **Scenario 2.1: Hiển thị thông tin đơn hàng từ API tra cứu**
  - **Given** URL chứa tham số `code` và token tra cứu `t`,
  - **When** trang tải trên server (SSR/Suspense),
  - **Then** trang gọi `lookupBooking(code, { token: t })` để lấy dữ liệu thực tế: mã đơn, tên khách, số điện thoại đã che (masked PII), lộ trình, thời gian đón, giá cước niêm yết và trạng thái "Chờ xác nhận".

- **Scenario 2.2: Fallback an toàn & Bảo mật SEO**
  - **Given** người dùng truy cập trực tiếp hoặc không có token tra cứu hợp lệ,
  - **Then** trang hiển thị thông tin fallback an toàn mà không crash (500),
  - **And** trang luôn giữ chỉ thị `noindex: true` (không cho phép Google index trang cảm ơn chứa dữ liệu riêng tư).

---

### US-3: Tin Tức & Cẩm Nang Từ CMS (/tin-tuc & /tin-tuc/[slug])
**As a** độc giả và khách hàng tiềm năng,  
**I want** đọc các bài viết hướng dẫn, kinh nghiệm đi xe và cẩm nang mới nhất được quản lý từ CMS,  
**So that** tôi nắm bắt thông tin hữu ích và dịch vụ xe chất lượng.

- **Scenario 3.1: Danh sách bài viết động**
  - **Given** người dùng truy cập `/tin-tuc`,
  - **When** trang tải,
  - **Then** danh sách bài viết được nạp qua `getArticles({ limit: 12 })`, hiển thị tiêu đề, trích dẫn, ảnh đại diện, tác giả và ngày đăng.

- **Scenario 3.2: Chi tiết bài viết chuẩn SEO & SSG**
  - **Given** người dùng truy cập `/tin-tuc/[slug]`,
  - **When** slug tồn tại và đã publish trên CMS,
  - **Then** trang nạp qua `getArticle(slug)`, render đúng tiêu đề, mục lục (TOC), nội dung HTML đã sanitize, structured data Article schema, và canonical URL tuyệt đối.
  - **And** nếu bài viết không tồn tại trên CMS, hệ thống trả về mã 404 thực tế (`notFound()`).

---

### US-4: Sitemap Động & Cấu Hình Hình Ảnh Backend
**As a** công cụ tìm kiếm (Googlebot),  
**I want** sitemap.xml cập nhật liên tục từ CMS và hình ảnh tải trơn tru,  
**So that** toàn bộ các trang canonical được lập chỉ mục đầy đủ và không gặp lỗi tải tài nguyên.

- **Scenario 4.1: Sitemap đồng bộ từ CMS**
  - **Given** bot hoặc người dùng truy cập `/sitemap.xml`,
  - **When** Next.js sinh sitemap,
  - **Then** sitemap nạp danh sách URL từ `/api/v1/seo/sitemap` (kèm `lastmod`), tự động loại trừ các trang noindex (`/dat-xe/thanh-cong`, `/admin`, `/api`) và các URL đã bị redirect 301.

- **Scenario 4.2: Next/Image hỗ trợ ảnh từ CMS**
  - **Given** các hình ảnh được trả về từ CMS với domain backend (`localhost:3001` hoặc URL production),
  - **When** component `<Image />` render,
  - **Then** `next.config.ts` đã cấu hình `remotePatterns` tương ứng, không bị lỗi cấu hình hostname.

---

## 3. Ranh Giới Phạm Vi (Scope Boundaries)

- **In-Scope**:
  - `src/components/booking/BookingForm.tsx` (sửa lỗi syntax/types, liên kết giá ước tính).
  - `src/app/dat-xe/thanh-cong/page.tsx` (nối `lookupBooking`).
  - `src/app/tin-tuc/page.tsx` và `src/app/tin-tuc/[slug]/page.tsx` (nối `getArticles`, `getArticle`).
  - `src/app/sitemap.ts` (nối `getSitemapEntries`).
  - `next.config.ts` (bổ sung `remotePatterns` cho media backend).
  - Unit tests & validation: kiểm tra toàn bộ test suite, typecheck và production build.
- **Out-of-Scope**:
  - Không sửa đổi backend (Backend đã hoàn thành 100% tại Gate G4).
  - Không thay đổi thiết kế giao diện hay màu sắc design system cốt lõi.
