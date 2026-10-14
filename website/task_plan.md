# Task Plan — Kết Nối TestSEO Với Backend Payload CMS 3 (/api/v1)

> **Project**: `TestSEO` (Next.js 15 App Router, Tailwind CSS, TypeScript, Payload CMS 3 Backend)  
> **Branch**: `feat/cms-api`  
> **Mode**: Spec-Kit (`.spec-mode` = `spec-kit`) · **Complexity**: Standard  
> **Spec**: `.specify/specs/002-connect-backend-api/spec.md`  
> **Plan**: `.specify/specs/002-connect-backend-api/plan.md`  
> **Current Phase**: Phase 5 — Archive & Verification (Gate G4 PASSED ✅)  

---

## 1. Trạng Thái Các Phase

| Phase | Mô tả | Status |
|---|---|---|
| Phase 0 | Session Recovery: Khảo sát hiện trạng branch `feat/cms-api`, kiểm tra backend (:3001), định vị lỗi `BookingForm.tsx` | ✅ done |
| Phase 1 | Specification: Viết spec US-1..US-4, tách What/How, Gate G1 inline review | ✅ passed (user confirmed) |
| Phase 2 | Planning: Mapping file, checklist task T1..T6, test strategy (Gate G2) | ✅ passed |
| Phase 3 | UI/UX Design: Giữ nguyên design tokens hiện có (không thay đổi UI) | N/A (bỏ qua) |
| Phase 4 | Implementation: T1..T6 (BookingForm, thanhtoan/lookup, articles, sitemap, next.config, verification) | ✅ done |
| Phase 5 | Archive & Verification (Gate G4): Typecheck, vitest pass (15/15), npm run build exit 0 | ✅ passed |
| Phase 6 | SEO Audit & Performance Optimization: Rà soát 16 mục AGENTS.md, sửa lỗi robots.txt/noindex, @context Schema, thứ tự Heading H1-H2, bảo mật HSTS/X-Frame, Sitemap fallback và hiệu suất build | ✅ passed |
| Phase 7 | Dynamic Company Settings API: Kết nối getCompanySettings() /api/v1/settings/company, fallback an toàn, đồng bộ toàn bộ layout, schema, components & pages | ✅ passed |

---

## 2. File Structure Mapping

```
TestSEO/
├── next.config.ts                                # [Done] Thêm localhost:3001 & domain CMS vào remotePatterns
├── src/
│   ├── lib/
│   │   ├── api.ts                                # [Ready] Typed envelope client cho 15 API
│   │   ├── booking.ts                            # [Ready] Helper validate/normalize phone, ISO date
│   │   ├── redirects.ts                          # [Ready] Helper resolveRedirect 301/308
│   │   ├── revalidate.ts                         # [Ready] Plan revalidateTag & revalidatePath
│   │   └── types.ts                              # [Ready] RouteItem, RoutePriceDetail
│   ├── middleware.ts                             # [Ready] Rewrite/redirect 301 tự động từ CMS
│   ├── app/
│   │   ├── layout.tsx                            # [Done] Nạp getRoutes() truyền Header
│   │   ├── page.tsx                              # [Done] Nạp getRoutes() cho Hero/PriceBanner/Grid
│   │   ├── tuyen-lien-tinh/
│   │   │   ├── page.tsx                          # [Done] Nạp getRoutes() cho RouteListing
│   │   │   └── [slug]/page.tsx                   # [Done] Nạp getRoute(slug) SSG
│   │   ├── dat-xe/
│   │   │   ├── page.tsx                          # [Done] Nạp getRoutes() cho form
│   │   │   └── thanh-cong/page.tsx               # [Done - T2] Nạp lookupBooking(code, {token}), fallback an toàn
│   │   ├── tin-tuc/
│   │   │   ├── page.tsx                          # [Done - T3a] Nạp getArticles() thay @/data/articles
│   │   │   └── [slug]/page.tsx                   # [Done - T3b] Nạp getArticle(slug), SSG & 404 handler
│   │   ├── sitemap.ts                            # [Done - T4] Nạp getSitemapEntries() từ CMS
│   │   └── api/
│   │       ├── webhooks/revalidate/route.ts      # [Ready] Nhận webhook revalidate
│   │       └── v1/webhooks/revalidate/route.ts   # [Ready] Alias proxy
│   └── components/
│       └── booking/
│           └── BookingForm.tsx                   # [Done - T1] Sửa lỗi undefined estimatedPrice -> priceDisplay
└── tests/
    ├── pricing.test.ts                           # [Pass 4/4]
    ├── routes-metadata.test.ts                   # [Pass 3/3]
    ├── schema.test.ts                            # [Pass 4/4]
    └── seo.test.ts                               # [Pass 4/4]
```

---

## 3. Master Checklist Công Việc (T1 — T6)

### - [x] T1: Khắc phục lỗi biên dịch `BookingForm.tsx` (CRITICAL)
- **File**: `src/components/booking/BookingForm.tsx`
- **Kết quả**: Đã thay `estimatedPrice.price` và `estimatedPrice.unit` tại dòng 401 & 826 bằng `priceDisplay` và `unitDisplay`; thêm `disabled={submitting}` ngăn double submit.
- **Evidence**: `npx tsc --noEmit` pass (exit code 0).

### - [x] T2: Hoàn thiện trang xác nhận `/dat-xe/thanh-cong`
- **File**: `src/app/dat-xe/thanh-cong/page.tsx`
- **Kết quả**: Nhận `code` và token tra cứu `t`. Gọi `lookupBooking(code, { token: t })` lấy dữ liệu thật (mã đơn, họ tên, SĐT che `0962***293`, lộ trình, điểm trả, thời gian, giá tiền, trạng thái). Fallback an toàn nếu thiếu params. Giữ cờ `noindex: true`.
- **Evidence**: Prerender động không lỗi.

### - [x] T3: Kết nối Tin tức & Cẩm nang từ CMS
- **Files**: `src/app/tin-tuc/page.tsx`, `src/app/tin-tuc/[slug]/page.tsx`
- **Kết quả**:
  - `tin-tuc/page.tsx`: Dùng `getArticles({ limit: 12 })` kèm fallback an toàn `FALLBACK_ARTICLES`.
  - `tin-tuc/[slug]/page.tsx`: Dùng `getArticles()` cho `generateStaticParams`, `getArticle(slug)` cho `generateMetadata` và trang chi tiết. `notFound()` khi bài viết không tồn tại.
- **Evidence**: Build SSG tạo thành công 2 bài viết (`/tin-tuc/bang-gia-xe-ghep-lien-tinh-moi-nhat-2026`, `/tin-tuc/kinh-nghiem-dat-xe-ghep-lien-tinh-tiet-kiem`).

### - [x] T4: Đồng bộ Sitemap động từ CMS
- **File**: `src/app/sitemap.ts`
- **Kết quả**: Gọi `getSitemapEntries()` từ CMS để đồng bộ 20 URL canonical đã loại trừ trang nội bộ & redirect 301, kèm `lastmod` và fallback an toàn.
- **Evidence**: Sitemap sinh đúng chuẩn `MetadataRoute.Sitemap`.

### - [x] T5: Bổ sung Remote Patterns cho Next/Image
- **File**: `next.config.ts`
- **Kết quả**: Đã thêm `localhost:3001`, `127.0.0.1:3001` và `xegheplientinh.vn` với pathname `/media/**`.
- **Evidence**: Next/Image nạp ảnh an toàn, không bị lỗi hostname.

### - [x] T6: Nghiệm thu toàn diện (Verification & Gate G4)
- **Evidence**:
  - `npx tsc --noEmit`: 0 lỗi typecheck (exit code 0).
  - `npm test`: 4/4 test suites, 15/15 tests PASSED (exit code 0).
  - `npm run build`: Compiled successfully in 17.8s, 26 routes (26 static/SSG + 2 dynamic endpoints) sinh thành công không cảnh báo lỗi (exit code 0).
