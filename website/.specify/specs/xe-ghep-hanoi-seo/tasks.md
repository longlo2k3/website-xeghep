# Traceable Tasks — Xe Ghép Lubi (xeghephanoi.vn)

> **Feature**: Nền tảng Website Dịch Vụ Xe Ghép Chuẩn SEO Next.js  
> **Status**: Synchronized with `task_plan.md`  
> **Traceability**: Each task links to acceptance criteria in `spec.md` and checkpoints in `plan.md`.

---

## Task Matrix

| Task ID | Module / File Target | Spec Trace | Constitution Check | Test Strategy |
|---|---|---|---|---|
| **T-1.1** | `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts` | US-01 - US-06 | §1, §2.1 | Build validation |
| **T-1.2** | `src/lib/utils.ts`, `src/lib/seo.ts`, `src/lib/schema.ts` | US-01 - US-06 | §2.1, §2.5 | Vitest `tests/seo.test.ts`, `tests/schema.test.ts` |
| **T-1.3** | `src/data/*.ts` (routes, airport, pricing, articles, company) | US-01, US-03, US-04 | §2.5 Truthfulness | Vitest `tests/pricing.test.ts` |
| **T-2.1** | `src/components/seo/JsonLd.tsx`, `src/components/seo/Breadcrumbs.tsx` | US-03, US-06 | §2.5, §2.3 | Render test & XSS verification |
| **T-2.2** | `src/components/layout/Header.tsx`, `Footer.tsx`, `FloatingContact.tsx` | US-01 - US-06 | §2.1, §2.3, §3.1 | Accessibility & link inspection |
| **T-3.1** | `src/app/layout.tsx`, `src/app/not-found.tsx`, `robots.ts`, `sitemap.ts` | US-01 - US-06 | §2.1 (No layout canonical!), §2.2 | Prerender & XML check |
| **T-4.1** | `src/components/home/*.tsx` & `src/app/page.tsx` (Trang chủ) | US-01 (Banner, 3 tab, 5 cam kết, Tuyến nổi bật) | §2.1, §2.3, §2.4 LCP | Visual & form interaction test |
| **T-4.2** | `src/app/dat-xe/page.tsx` & `src/app/dat-xe/thanh-cong/page.tsx` | US-02 (Form đầy đủ, validation, mã đơn) | §3.1 A11y, §2.1 noindex preview | Vitest `tests/booking-form.test.tsx` |
| **T-4.3** | `src/app/dich-vu-xe-ghep/page.tsx` & `src/app/xe-ghep-[slug]/page.tsx` | US-03 (Tổng hợp tuyến & chi tiết tuyến) | §2.1 generateStaticParams, canonical | Route snapshot & schema check |
| **T-4.4** | `src/app/taxi-dua-don-san-bay-noi-bai/page.tsx` & `taxi-duong-dai/page.tsx` | US-04 (Bảng giá quận HN, chính sách 2 chiều) | §2.1, §2.3 Semantic table | Content & metadata check |
| **T-4.5** | `src/app/bang-gia/page.tsx` & `src/app/dang-ky-doi-tac/page.tsx` | US-05 (Bảng giá so sánh & form đối tác) | §2.1, §3.1 Form validation | Content & metadata check |
| **T-4.6** | `src/app/tin-tuc/page.tsx`, `tin-tuc/[slug]/page.tsx`, `gioi-thieu`, `lien-he` | US-06 (Cẩm nang, giới thiệu Lubi, hotline) | §2.1, §2.5 Article Schema | Content & metadata check |
| **T-5.1** | End-to-end verification (`npm run test`, `npm run build`, raw HTML inspection) | All | §4 Verification | CI build & curl raw HTML check |
