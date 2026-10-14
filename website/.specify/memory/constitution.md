# Project Constitution — Xe Ghép Lubi (Spec-Kit Mode)

> **Version**: 4.0 (Aligned with AGENTS.md v2.0.0 SEO Rules)  
> **Approved**: 2026-10-06  
> **Scope**: All specs, plans, tasks, architecture, components, and code in this project must strictly comply.  
> **Enforcement**: Actively verified at gates G1–G4. `plan.md` must reference constitution checkpoints.

---

## 1. Core Mission & Engineering Philosophy

This project delivers a high-performance, enterprise-grade, SEO-optimized web application for **Dịch Vụ Xe Ghép Lubi (xeghephanoi.vn)** built on Next.js App Router (TypeScript, Tailwind CSS). Every feature is crafted with senior frontend rigor and uncompromising technical SEO excellence.

---

## 2. Non-Negotiable SEO Rules (from AGENTS.md)

### 2.1. Rendering & Crawlability (🔴 MUST)
- **SSR / SSG First**: All indexable pages must render full text, metadata, headings, links, and structured data in raw server HTML (`curl` testable).
- **Absolute Self-Referencing Canonical**: Every indexable page must output its own unique self-canonical URL.
- **Zero Layout Canonical Inheritance**: The root layout (`app/layout.tsx`) MUST define `metadataBase` but MUST NEVER define `alternates.canonical`, avoiding duplicate canonical bugs across routes.
- **Next.js 15+ Async Params**: `params` and `searchParams` in pages and `generateMetadata` are Promises and MUST be awaited (`const { slug } = await params;`).
- **Real HTTP Status Codes**: Missing resources must invoke `notFound()` to render a genuine 404 response. No soft 404s.
- **Crawlable Navigation**: All internal transitions MUST use `<Link href="...">` or native `<a href="...">`. Never use `onClick` + `router.push` as substitutes for links.

### 2.2. Meta Tags & Social Signals (🔴 MUST & 🟠 SHOULD)
- **Title Tag**: Unique, descriptive, ~50–60 characters, brand suffix after separator (`|` or `-`), primary intent keyword at front.
- **Meta Description**: Unique, 120–155 characters, compelling CTA, accurate summary of page intent.
- **Open Graph & Twitter Cards**: 1200×630px images, absolute URLs matching canonical, `twitter:card` set to `summary_large_image`.
- **Charset & Viewport**: `<meta charset="UTF-8">` within first 1024 bytes; viewport `width=device-width, initial-scale=1`, never blocking user zoom.
- **Robots & Sitemap**: `robots.ts` disallows private paths only in production; dynamic `sitemap.ts` contains only 200 indexable canonical URLs.

### 2.3. Semantic HTML & Accessible Content (🟠 SHOULD & 🔴 MUST)
- **Structure**: Exactly one `<main>` element per page, `<header>`, `<footer>`, `<nav aria-label="...">`.
- **Heading Hierarchy**: Strict sequential hierarchy (`h1` → `h2` → `h3`), exactly one `h1` per page representing primary search topic. No heading jumps.
- **Semantic Tags**: `<article>`, `<section>`, `<aside>`, `<time datetime="ISO8601">`, `<figure>`, `<figcaption>`.

### 2.4. Image & Media Optimization (🔴 MUST)
- **Image Dimensions**: Every image must define intrinsic `width` and `height` to prevent Cumulative Layout Shift (CLS).
- **Hero / LCP Optimization**: Hero banner image must use `priority` (`fetchpriority="high"`), without `loading="lazy"`.
- **Below-the-fold Images**: Must use `loading="lazy"` and `decoding="async"`.
- **Alt Text**: Natural, descriptive alt text for meaningful images; decorative icons get `alt=""` or `aria-hidden="true"`.
- **File Format**: Modern WebP / AVIF with descriptive Vietnamese kebab-case slugs (`xe-vinfast-vf8-noi-bai.webp`).

### 2.5. Structured Data / Schema.org (🔴 MUST & 🟠 SHOULD)
- **Format**: JSON-LD injected in raw HTML via `<script type="application/ld+json">`.
- **Truthfulness**: Zero fabricated ratings, reviews, or pricing. All schema values must strictly match on-page visible content.
- **Graph Linkage**: Use `@graph` to interconnect `Organization`, `LocalBusiness` / `TaxiService`, `WebSite`, `BreadcrumbList`, and `Service` / `Article`.

---

## 3. UI/UX, Performance & Accessibility

### 3.1. Design System & A11y (WCAG 2.1 AA)
- Mobile-first responsive design across mobile (375px+), tablet (768px+), and desktop (1024px, 1280px+).
- Touch target minimum 44×44px with comfortable spacing.
- Contrast ratio >= 4.5:1 for body copy and >= 3:1 for large headings and icons.
- No emojis used as structural UI icons; use Lucide / SVG icons with accessible labels.
- Visible keyboard focus rings (`focus-visible:ring-2`).

### 3.2. Core Web Vitals Baselines
- **LCP (Largest Contentful Paint)**: <= 2.5s (Server rendering + hero priority image + font display swap).
- **CLS (Cumulative Layout Shift)**: <= 0.1 (Explicit media dimensions, reserved ad/form spaces, font metric overrides via `next/font`).
- **INP (Interaction to Next Paint)**: <= 200ms (Minimal client JS, optimized event listeners, debounced inputs).

---

## 4. Code Quality & Testing Governance

- **TypeScript Strict**: 100% type-safe, zero implicit `any`.
- **TDD & Unit Testing**: Vitest / React Testing Library for business utilities (slugify, pricing calculators, metadata helpers, schema builders) and critical interactive UI components (booking tabs, contact modals).
- **Separation of Concerns**: Pure domain logic separated from presentation components; Server Components by default, `'use client'` only when state/interactivity is required.
