# Design System Master Specification — Xe Ghép Lubi

> **Design Engine**: `ui-ux-pro-max` (Transportation & Eco-Mobility Service)  
> **Brand**: Xe Ghép Lubi — Công ty Cổ phần Đầu tư Lubi Việt Nam  
> **Design Philosophy**: Green Mobility (100% VinFast EV), High Reliability, Instant Conversion, WCAG 2.1 AA Compliant

---

## 1. Color Palette (60-30-10 Rule & Semantic Tokens)

| Token Name | Hex Code | Tailwind Class | Role | Usage |
|---|---|---|---|---|
| **Primary Base** | `#008542` | `bg-emerald-600` / `text-emerald-600` | 60% Brand Identity | Primary buttons, brand logo, active tab indicator, key badges |
| **Primary Deep** | `#064e3b` | `bg-emerald-900` / `text-emerald-900` | Accent / Contrast | Footer background, hero gradients, strong headings |
| **Primary Light** | `#ecfdf5` | `bg-emerald-50` | Surface Tint | Card backgrounds, highlight banners, form focus backgrounds |
| **Secondary Accent** | `#f59e0b` | `bg-amber-500` / `text-amber-500` | 10% CTA / Conversion | Hotline badges, "Đặt xe ngay" high-attention buttons, ratings |
| **Secondary Hover** | `#d97706` | `bg-amber-600` | Interaction State | Hover state for accent buttons |
| **Neutral 900 (Dark)** | `#0f172a` | `text-slate-900` | 30% Typography | Primary body headings, high-contrast readable copy (13.5:1 ratio) |
| **Neutral 700 (Muted)** | `#334155` | `text-slate-700` | Secondary Body | Paragraph descriptions, supporting metadata (8.2:1 ratio) |
| **Neutral 500 (Subtle)**| `#64748b` | `text-slate-500` | Microcopy | Timestamps, helper text, input labels (4.8:1 ratio) |
| **Neutral 200 (Border)**| `#e2e8f0` | `border-slate-200` | Boundaries | Card borders, dividers, table grid lines |
| **Neutral 50 (Surface)**| `#f8fafc` | `bg-slate-50` | Page Canvas | Alternating section backgrounds, table headers |
| **Pure White** | `#ffffff` | `bg-white` | Card Surface | Floating cards, modals, sticky header, input fields |

---

## 2. Typography Hierarchy (Mobile-First)

- **Font Family**: Inter, Be Vietnam Pro, system-ui, -apple-system, sans-serif.
- **Base Body**: 16px (`text-base`), `leading-relaxed` (1.625) — prevents mobile iOS auto-zoom on input focus.

| Element | Mobile Size | Desktop Size | Weight | Line Height | Usage |
|---|---|---|---|---|---|
| **Display / H1** | 28px (`text-2xl`) | 40px (`text-4xl`) | 800 (Bold) | 1.2 | Unique page hero title (strictly 1 per page) |
| **H2 Section** | 22px (`text-xl`) | 28px (`text-2xl`) | 700 (Bold) | 1.3 | Major feature & service section titles |
| **H3 Card** | 18px (`text-lg`) | 20px (`text-xl`) | 600 (Semibold) | 1.4 | Route cards, commitments, article titles |
| **Body Large** | 16px (`text-base`) | 18px (`text-lg`) | 400 (Regular) | 1.6 | Hero lead descriptions, quote summaries |
| **Body Regular** | 15px (`text-sm`) | 16px (`text-base`) | 400 (Regular) | 1.6 | Standard reading paragraphs, table cells |
| **Small / Label** | 13px (`text-xs`) | 14px (`text-sm`) | 500 (Medium) | 1.5 | Form labels, badges, footer copyright |

---

## 3. Spacing & Touch Metrics (WCAG 2.1 AA)

- **Minimum Touch Target**: 44×44px on all interactive elements (buttons, nav items, select options, quick contact icons).
- **Rhythm Grid**: 4px / 8px / 16px / 24px / 32px / 48px / 64px standard spacing scale.
- **Container Width**: `max-w-7xl` (1280px) on desktop with `px-4 sm:px-6 lg:px-8` safe margin.
- **Visual Feedback**: Visible focus ring `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2`.
- **Cursor Pointer**: Explicit `cursor-pointer` applied to all clickable cards, links, tabs, and buttons.
- **Structural Icons**: 100% SVG vector via Lucide React. Zero emojis as functional or structural UI icons.

---

## 4. Component Patterns

### 4.1. Quick Booking Form (3 Tabs)
- Container: Elevated card with `shadow-xl border border-slate-100 rounded-2xl bg-white p-4 sm:p-6`.
- Tabs: Pill-style tabs with active state in brand emerald (`bg-emerald-600 text-white shadow-sm`), inactive in `bg-slate-100 text-slate-700 hover:bg-slate-200`.
- Price Highlight: Display bold badge with `text-emerald-700 font-extrabold text-lg` for transparent upfront cost.

### 4.2. Floating Contact Bar (Multichannel)
- Position: Fixed at bottom on mobile (`fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-2.5 flex justify-around items-center`), floating right pills on desktop (`fixed right-4 bottom-6 z-50 flex flex-col gap-2.5`).
- Channels:
  - 📞 **Gọi điện** (`tel:0858911247`) — Nút đỏ nổi bật hoặc xanh lá
  - 💬 **Zalo** (`https://zalo.me/0858911247`) — Xanh Zalo `#0068ff`
  - ✉️ **SMS** (`sms:0858911247`) — Xanh slate
  - ⚡ **Đặt xe ngay** (`/dat-xe`) — Màu cam ấm `#f59e0b`
- Touch safe area padding: `pb-safe` on iOS devices.

### 4.3. Route & Service Cards
- Border: `border border-slate-200 hover:border-emerald-300 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg`.
- Image: 16:9 ratio with descriptive alt text, lazy-loaded unless in viewport.
- Information hierarchy: Title (`h3`) → Distance & Time badge → Starting price (`Chỉ từ 150.000đ`) → CTA link `<Link href="...">`.

### 4.4. Five Commitments Block
- 5 clean bento-grid cards with emerald vector icons (ShieldCheck, Car, Clock, Sparkles, UserCheck).
- 100% VinFast EV promise clearly articulated.
