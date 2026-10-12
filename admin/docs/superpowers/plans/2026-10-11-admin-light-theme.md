# Admin CMS Light Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the Admin CMS from the hardcoded dark theme (slate-950/900) to a modern, crisp light theme with a clean light-gray background (`bg-slate-50`), pure white cards and containers (`bg-white`), subtle borders (`border-slate-200`), and high-contrast dark text (`text-slate-900`/`text-slate-600`).

**Architecture:** Update core layout (`DashboardLayout`, `Header`, `Sidebar`), primitive UI components (`Card`, `Button`, `Badge`, `Input`, `Select`, `Textarea`, `Modal`), data components (`DataTable`, `StatusBadge`, `ConfirmDialog`), and composite components (`SeoPreview`, `RichTextEditor`, `MediaPickerModal`) to replace dark slate classes with light palette classes. Maintain all accessibility standards and ensure existing test suites pass.

**Tech Stack:** React 19, TypeScript 5, Vite 6, Tailwind CSS 3, Lucide React, Vitest 3, React Testing Library.

---

### Task 1: Core Layout & Navigation Theme Migration

**Files:**
- Modify: `src/layouts/DashboardLayout.tsx`
- Modify: `src/components/common/Header.tsx`
- Modify: `src/components/common/Sidebar.tsx`
- Test: `src/tests/layout.test.tsx`

- [ ] **Step 1: Update `DashboardLayout.tsx` background and text colors**

In `src/layouts/DashboardLayout.tsx`:
Change:
```tsx
<div className="min-h-screen bg-slate-950 text-slate-100 flex">
```
To:
```tsx
<div className="min-h-screen bg-slate-50 text-slate-900 flex">
```

- [ ] **Step 2: Update `Header.tsx` to Light Theme**

In `src/components/common/Header.tsx`:
- Header background: `bg-white/95 border-b border-slate-200 shadow-sm backdrop-blur-md`
- Mobile menu button: `text-slate-600 hover:text-slate-900 hover:bg-slate-100`
- Breadcrumb links: `text-slate-500 hover:text-slate-800`, Chevron: `text-slate-400`, Current title: `text-slate-900`
- User card: `bg-slate-100/90 border border-slate-200 text-xs`, user name: `text-slate-800`
- Logout button: `bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 shadow-none`

- [ ] **Step 3: Update `Sidebar.tsx` to Light Theme**

In `src/components/common/Sidebar.tsx`:
- Mobile backdrop: `bg-slate-900/40 backdrop-blur-sm`
- Sidebar container: `bg-white border-r border-slate-200`
- Brand header: `border-b border-slate-100`, brand title: `text-slate-900`, subtitle: `text-slate-500`
- Mobile close button: `text-slate-400 hover:text-slate-700 hover:bg-slate-100`
- Navigation links:
  - inactive: `text-slate-600 hover:text-slate-900 hover:bg-slate-100`
  - active: `bg-blue-600 text-white shadow-sm shadow-blue-500/25 font-semibold`
  - inactive icons: `text-slate-400 group-hover:text-slate-600`
- Footer user info container: `border-t border-slate-100`, box: `bg-slate-50 border border-slate-200`, name: `text-slate-900`
- Role badge map: adjust for light theme pastel tones (`admin`: `bg-rose-50 text-rose-700 border-rose-200`, `editor`: `bg-emerald-50 text-emerald-700 border-emerald-200`, `dispatcher`: `bg-amber-50 text-amber-700 border-amber-200`).

- [ ] **Step 4: Run layout tests to verify**

Run: `npx vitest run src/tests/layout.test.tsx`
Expected: PASS (all 9 tests pass).

---

### Task 2: UI Primitives Migration to Light Theme (Card, Button, Badge)

**Files:**
- Modify: `src/components/ui/Card.tsx`
- Modify: `src/components/ui/Button.tsx`
- Modify: `src/components/ui/Badge.tsx`
- Test: `src/tests/components.test.tsx`

- [ ] **Step 1: Update `Card.tsx`**

In `src/components/ui/Card.tsx`:
- `Card`: `rounded-2xl bg-white border border-slate-200 shadow-sm text-slate-900 overflow-hidden`
- `CardHeader`: `flex flex-col space-y-1.5 p-6 border-b border-slate-100`
- `CardTitle`: `text-lg font-semibold leading-none tracking-tight text-slate-900`
- `CardDescription`: `text-xs text-slate-500 leading-relaxed`
- `CardFooter`: `border-t border-slate-100`

- [ ] **Step 2: Update `Button.tsx`**

In `src/components/ui/Button.tsx`:
- `secondary`: `bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-200/80 border border-slate-200 shadow-sm`
- `outline`: `bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 border border-slate-200 shadow-sm`
- `ghost`: `bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200/60 border border-transparent`
- Focus ring offset: `focus-visible:ring-offset-white`

- [ ] **Step 3: Update `Badge.tsx`**

In `src/components/ui/Badge.tsx`:
- `default`: `bg-blue-50 text-blue-700 border-blue-200`
- `secondary`: `bg-slate-100 text-slate-700 border-slate-200`
- `success`: `bg-emerald-50 text-emerald-700 border-emerald-200`
- `warning`: `bg-amber-50 text-amber-700 border-amber-200`
- `error` / `destructive`: `bg-rose-50 text-rose-700 border-rose-200`
- `info`: `bg-sky-50 text-sky-700 border-sky-200`
- `outline`: `bg-transparent text-slate-600 border-slate-300`

- [ ] **Step 4: Run component tests to verify**

Run: `npx vitest run src/tests/components.test.tsx`
Expected: PASS (all 20 tests pass).

---

### Task 3: Form Controls Migration to Light Theme (Input, Select, Textarea)

**Files:**
- Modify: `src/components/ui/Input.tsx`
- Modify: `src/components/ui/Select.tsx`
- Modify: `src/components/ui/Textarea.tsx`
- Test: `src/tests/components.test.tsx`

- [ ] **Step 1: Update `Input.tsx`**

In `src/components/ui/Input.tsx`:
- Label: `text-slate-700 font-semibold`
- Input field: `bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100`
- Error state: `border-rose-400 focus:border-rose-500 focus:ring-rose-500/20 text-rose-900`
- Helper text: `text-slate-500`

- [ ] **Step 2: Update `Select.tsx`**

In `src/components/ui/Select.tsx`:
- Label: `text-slate-700 font-semibold`
- Select element: `bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100`
- Chevron down icon: `text-slate-400`

- [ ] **Step 3: Update `Textarea.tsx`**

In `src/components/ui/Textarea.tsx`:
- Label: `text-slate-700 font-semibold`
- Textarea element: `bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100`
- Helper text: `text-slate-500`

- [ ] **Step 4: Run tests to verify**

Run: `npx vitest run src/tests/components.test.tsx`
Expected: PASS.

---

### Task 4: Overlays & Dialogs Migration to Light Theme (Modal, ConfirmDialog)

**Files:**
- Modify: `src/components/ui/Modal.tsx`
- Modify: `src/components/common/ConfirmDialog.tsx`
- Test: `src/tests/components.test.tsx`

- [ ] **Step 1: Update `Modal.tsx`**

In `src/components/ui/Modal.tsx`:
- Backdrop: `bg-slate-900/40 backdrop-blur-sm`
- Modal container: `bg-white border border-slate-200 rounded-2xl shadow-2xl`
- Header: `border-b border-slate-100`, title: `text-slate-900 font-semibold`, description: `text-slate-500`
- Close button: `text-slate-400 hover:text-slate-700 hover:bg-slate-100`
- Content body: `text-slate-700`
- Footer: `bg-slate-50 border-t border-slate-100`

- [ ] **Step 2: Update `ConfirmDialog.tsx`**

In `src/components/common/ConfirmDialog.tsx`:
- Title: `text-slate-900 font-bold`
- Description: `text-slate-600`
- Destructive icon: `bg-rose-50 border-rose-200 text-rose-600`
- Warning/Default icon: `bg-amber-50 border-amber-200 text-amber-600`

- [ ] **Step 3: Run tests to verify**

Run: `npx vitest run src/tests/components.test.tsx`
Expected: PASS.

---

### Task 5: Data Display & Table Migration to Light Theme (DataTable, StatusBadge)

**Files:**
- Modify: `src/components/common/DataTable.tsx`
- Modify: `src/components/common/StatusBadge.tsx`
- Test: `src/tests/components.test.tsx`

- [ ] **Step 1: Update `DataTable.tsx`**

In `src/components/common/DataTable.tsx`:
- Search input: `bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500`
- Search clear icon: `text-slate-400 hover:text-slate-600`
- Table wrapper: `border border-slate-200 bg-white shadow-sm rounded-xl overflow-x-auto`
- Table thead: `bg-slate-50/90 text-slate-600 font-semibold border-b border-slate-200`
- Table th: hover text `hover:text-slate-900`
- Table tbody tr: `border-b border-slate-100 text-slate-700 hover:bg-slate-50/70`
- Table empty state: text `text-slate-500`
- Pagination footer: `bg-slate-50/60 border-t border-slate-200 text-slate-600`
- Pagination buttons: `bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40`

- [ ] **Step 2: Update `StatusBadge.tsx`**

In `src/components/common/StatusBadge.tsx`:
Ensure badges map to the updated pastel light variants (`success`, `warning`, `info`, `destructive`, `secondary`).

- [ ] **Step 3: Run component tests to verify**

Run: `npx vitest run src/tests/components.test.tsx`
Expected: PASS.

---

### Task 6: Common Utilities & Editor Light Sync (SeoPreview, RichTextEditor, MediaPickerModal)

**Files:**
- Modify: `src/components/common/SeoPreview.tsx`
- Modify: `src/components/common/RichTextEditor.tsx`
- Modify: `src/components/common/MediaPickerModal.tsx`
- Test: `src/tests/editorAndSeo.test.tsx`

- [ ] **Step 1: Update `SeoPreview.tsx`**

Replace `bg-slate-950` and `bg-slate-900` cards with clean light preview cards (`bg-slate-50 border-slate-200 text-slate-800`).

- [ ] **Step 2: Update `RichTextEditor.tsx`**

Update editor toolbar from `bg-slate-950 border-slate-800` to `bg-slate-50 border-b border-slate-200 text-slate-700`.
Update editor text area from `bg-slate-950 text-slate-200` to `bg-white text-slate-900`.

- [ ] **Step 3: Update `MediaPickerModal.tsx`**

Ensure media card containers and grid items use `bg-slate-100/80 border-slate-200` instead of `bg-slate-950`.

- [ ] **Step 4: Run editor & SEO tests**

Run: `npx vitest run src/tests/editorAndSeo.test.tsx`
Expected: PASS.

---

### Task 7: Full Test Suite Run & Final Verification

- [ ] **Step 1: Run complete Vitest suite**

Run: `npm run test`
Expected: All 18 test files pass (219+ tests).

- [ ] **Step 2: Run TypeScript typecheck**

Run: `npm run typecheck`
Expected: 0 errors.
