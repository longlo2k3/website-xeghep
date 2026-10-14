# Technical Implementation Plan — Xe Ghép Lubi (xeghephanoi.vn)

> **Feature**: Nền tảng Website Dịch Vụ Xe Ghép & Taxi Sân Bay Chuẩn SEO Next.js  
> **Status**: Ready for G2 Review  
> **Version**: 1.0.0  
> **Perspective**: Engineering Perspective (How)  
> **Constitution Checkpoint References**: Adheres to `.specify/memory/constitution.md` (§1, §2.1-§2.5, §3, §4)

---

## 1. Architecture Overview & Decisions

```
+------------------------------------------------------------------------+
| Next.js App Router (SSR / SSG First, React 19, TypeScript Strict)     |
+------------------------------------------------------------------------+
  |-- Root Layout (app/layout.tsx):
  |   * lang="vi", UTF-8 charset <= 1024 bytes, responsive viewport
  |   * metadataBase = "https://xeghephanoi.vn"
  |   * NO canonical defined here (Strictly obeys Constitution §2.1)
  |   * Global Organization & LocalBusiness JSON-LD schema
  |   * Header, Footer, FloatingContact widget
  |
  |-- Static / Dynamic Route Handlers:
  |   * app/sitemap.ts -> XML sitemap with 100% 200 indexable canonical URLs
  |   * app/robots.ts -> Crawl directives allowing all indexable pages
  |   * app/not-found.tsx -> True HTTP 404 response
  |
  |-- Core Pages (Server Components by default):
  |   * app/page.tsx: Trang chủ (Hero LCP priority, QuickBookingTabs, 5 Commitments, Featured Routes)
  |   * app/dat-xe/page.tsx: Form đặt xe đầy đủ, ước tính giá tức thì
  |   * app/dat-xe/thanh-cong/page.tsx: Xác nhận đặt chỗ & mã đơn (noindex preview tag)
  |   * app/dich-vu-xe-ghep/page.tsx: Danh sách toàn bộ tuyến liên tỉnh
  |   * app/xe-ghep-[slug]/page.tsx: Trang tuyến chi tiết (generateStaticParams SSG)
  |   * app/taxi-dua-don-san-bay-noi-bai/page.tsx: Bảng giá theo từng quận Hà Nội
  |   * app/taxi-duong-dai/page.tsx: Bảng giá theo cự ly km & chính sách 2 chiều
  |   * app/bang-gia/page.tsx: Bảng giá tổng hợp & so sánh
  |   * app/dang-ky-doi-tac/page.tsx: Form đăng ký lái xe & nhà xe
  |   * app/tin-tuc/page.tsx & app/tin-tuc/[slug]/page.tsx: Cẩm nang & bài viết (generateStaticParams)
  |   * app/gioi-thieu/page.tsx: Giới thiệu Công ty CP Đầu tư Lubi Việt Nam
  |   * app/lien-he/page.tsx: Trụ sở Hà Đông, hotline 0858.911.247, Google Map
+------------------------------------------------------------------------+
```

---

## 2. Constitution Checkpoints & Engineering Alignment

### Checkpoint §2.1: Rendering & Canonical Isolation
- **Rule**: Every indexable page defines its own absolute canonical. Root layout has zero `alternates.canonical`.
- **Implementation**:
  ```ts
  // Helper in src/lib/seo.ts
  export function createPageMetadata({ title, description, path }: PageMetaInput): Metadata {
    const canonical = `https://xeghephanoi.vn${path}`;
    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        title,
        description,
        url: canonical,
        siteName: "Xe Ghép Lubi",
        locale: "vi_VN",
        type: "website",
        images: [{ url: "https://xeghephanoi.vn/images/og-xeghephanoi.webp", width: 1200, height: 630 }],
      },
    };
  }
  ```

### Checkpoint §2.1: Next.js 15+ Async Params
- **Rule**: `params` and `searchParams` are Promises.
- **Implementation**:
  ```ts
  type RouteProps = { params: Promise<{ slug: string }> };
  export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
    const { slug } = await params;
    // ...
  }
  export default async function RoutePage({ params }: RouteProps) {
    const { slug } = await params;
    // ...
  }
  ```

### Checkpoint §2.3: Semantic Hierarchy & Skip Link
- **Rule**: Exactly one `<main>` per page, sequential `h1` → `h2` → `h3`, `<nav aria-label="...">`.
- **Implementation**: Accessible `<a href="#main-content" className="sr-only focus:not-sr-only">` skip link at top of body.

### Checkpoint §2.4: LCP Media & Zero CLS
- **Rule**: Intrinsic dimensions, `priority` on hero banner, lazy load on below-fold.
- **Implementation**: Hero image uses `priority`, `sizes="100vw"`, WebP format.

### Checkpoint §2.5: Schema.org Graph Truthfulness
- **Rule**: JSON-LD with `@graph`, escaping `<` for security, zero fabricated data.
- **Implementation**:
  ```tsx
  export function JsonLd({ data }: { data: Record<string, unknown> }) {
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(data).replace(/</g, "\\u003c"),
        }}
      />
    );
  }
  ```

---

## 3. Testing Strategy (Constitution §2.2 & §4)

- **Unit Tests with Vitest**:
  - `tests/seo.test.ts`: Verify canonical generation, title truncation heuristic, Open Graph parity.
  - `tests/schema.test.ts`: Verify Schema `@graph` builder generates valid TaxiService, BreadcrumbList, Article types.
  - `tests/pricing.test.ts`: Verify airport pricing lookup and route price calculators.
  - `tests/booking-form.test.tsx`: Test form validation (valid phone number, required fields, submission state).
- **Verification Commands**:
  - `npm run test`: All unit tests pass.
  - `npm run build`: Zero static generation errors, all routes prerendered.

---

## 4. Risk Assessment & Rollback

| Risk | Impact | Mitigation / Strategy |
|---|---|---|
| Duplicate Canonical via Layout | High (SEO penalty) | Strict isolation: zero `alternates.canonical` in `app/layout.tsx`. Test enforced via unit tests. |
| Hydration Mismatch on Booking Form | Medium | Booking tab interactivity isolated inside `'use client'` component with initial server fallback. |
| Broken Dynamic Slug Routing | High (404 on Google) | `generateStaticParams` precomputes all routes defined in `data/routes.ts` and `data/articles.ts`. Unknown slug triggers `notFound()`. |
| Missing LCP Optimization | High (Core Web Vitals) | Hero banner uses Next.js `priority` prop; local SVG/WebP placeholder assets. |
