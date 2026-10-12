# Technical Implementation Plan: Admin CMS Frontend

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` or `executing-plans` to implement this plan task-by-task.
> **Feature**: `002-admin-cms-frontend`
> **Mode**: Spec-Kit (`.spec-mode` = `spec-kit`)
> **Spec**: [.specify/specs/002-admin-cms-frontend/spec.md](spec.md)

**Goal:** Xây dựng dự án SPA Admin CMS độc lập tại `admin/` sử dụng React 19, Vite, TypeScript, Tailwind CSS, shadcn/ui và TanStack Query để quản trị toàn bộ nội dung, đơn đặt xe, giá cước, SEO và cấu hình hệ thống trên nền tảng Payload CMS 3 backend.

**Architecture:** Kiến trúc Feature-First Modular SPA. Mỗi phân hệ (auth, dashboard, articles, pages, routes, bookings, drivers, media, settings, redirects, users) đóng gói riêng biệt các API hooks, components, schemas và types. Vite Dev Server tích hợp reverse proxy chuyển tiếp các request `/api/*` tới backend `:3001` để triệt tiêu vấn đề CORS. Client-side routing với React Router v6 bảo vệ bằng `RoleGuard` dựa trên JWT và thông tin user từ `GET /api/users/me`.

**Tech Stack:**
- **Core:** React 19, TypeScript 5+, Vite 6
- **Routing:** React Router v6
- **State & Data Fetching:** TanStack Query v5 (React Query), Axios
- **UI Components & Styling:** Tailwind CSS v3/v4, Radix UI primitives, Lucide React (chuẩn §2.6 constitution)
- **Forms & Validation:** React Hook Form, Zod
- **Rich Text & Formatting:** TipTap / Lexical HTML Editor, Date-fns, Numeral/Intl formatters
- **Testing:** Vitest, React Testing Library

---

## 1. Constitution Checkpoints Verification

| Checkpoint | Nguyên tắc hiến pháp | Cách đáp ứng trong thiết kế |
|---|---|---|
| **CP-1** | §2.1 SEO Preservation | Giao diện quản lý Tuyến/Bài viết tự sinh slug chuẩn; tự động cảnh báo & tạo 301 Redirect khi đổi slug; hiển thị thanh đếm ký tự Title (≤70) và Description (≤160); giám sát thẻ noindex và sitemap. |
| **CP-2** | §2.2 Server Authority | Phía frontend không tự ý tính giá hay quyết định giá vé; mọi đơn đặt xe và tính giá gọi server; tuân thủ chuẩn phong bì `{ success, statusCode, message, data, error }`; tôn trọng nghiêm ngặt State Machine của Bookings (chỉ cho phép các bước chuyển trạng thái hợp lệ). |
| **CP-3** | §2.3 Security & Privacy | Token JWT lưu trong bộ nhớ/storage bảo mật; tự động đăng xuất khi nhận 401; ẩn số điện thoại khách hàng (mask 3 số giữa) đối với tài khoản vai trò `editor`; mật khẩu người dùng chỉ gửi qua HTTPS/hash. |
| **CP-4** | §2.4 Testing (TDD) | Sử dụng Vitest + React Testing Library; viết test cho các utility, state machine transitions, hook xác thực và form validation trước khi hoàn thiện UI. |
| **CP-5** | §2.5 Performance | Tối ưu bundle với code-splitting (`React.lazy`), TanStack Query quản lý cache và stale-time (giảm tải request lặp lại), giao diện phản hồi < 100ms. |
| **CP-6** | §2.6 User Experience | 100% tiếng Việt chuyên nghiệp; không dùng emoji thay icon (sử dụng hoàn toàn Lucide React SVG); hiển thị rõ ràng thông báo lỗi tiếng Việt, không để lọt "null"/"undefined"; các phần tử bấm được có `cursor-pointer`. |
| **CP-7** | §3 Architecture Governance | Dự án đặt tại thư mục `admin/`, chạy port 5173 (hoặc 3000), độc lập với `backend/` (:3001); kết nối qua REST API chuẩn của Payload CMS 3. |

---

## 2. Bản đồ cấu trúc thư mục (File Structure Mapping)

```
admin/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts                     # Cấu hình proxy /api -> http://localhost:3001
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css                      # Tailwind base & CSS variables shadcn
│   ├── types/
│   │   ├── auth.ts                    # User, Role (admin, editor, dispatcher), AuthState
│   │   ├── api.ts                     # Envelope, PaginatedResponse, ApiError
│   │   ├── routes.ts                  # RouteDoc, PriceTier, PricingDetail
│   │   ├── articles.ts                # ArticleDoc, Category, TOC
│   │   ├── pages.ts                   # PageDoc (system, content)
│   │   ├── bookings.ts                # BookingDoc, BookingStatus, StateMachine
│   │   ├── drivers.ts                 # DriverDoc
│   │   ├── media.ts                   # MediaDoc
│   │   ├── settings.ts                # CompanySettings, PricingSettings, Airport, Distance
│   │   └── redirects.ts               # RedirectDoc
│   ├── lib/
│   │   ├── api-client.ts              # Axios instance với Bearer token interceptor & error handling
│   │   ├── query-client.ts            # TanStack QueryClient config
│   │   ├── utils.ts                   # cn, formatVND, formatDate, maskPhone
│   │   └── stateMachine.ts            # Booking state machine logic & valid transitions
│   ├── context/
│   │   └── AuthContext.tsx            # AuthProvider, useAuth hook
│   ├── routes/
│   │   ├── index.tsx                  # BrowserRouter & Route configuration
│   │   ├── ProtectedRoute.tsx         # Kiểm tra đăng nhập
│   │   └── RoleGuard.tsx              # Kiểm tra quyền (admin / editor / dispatcher)
│   ├── layouts/
│   │   ├── DashboardLayout.tsx        # Sidebar, Header, Breadcrumbs, User dropdown
│   │   └── AuthLayout.tsx             # Login wrapper
│   ├── components/
│   │   ├── ui/                        # shadcn/ui components (button, input, table, dialog, badge, select, etc.)
│   │   ├── common/
│   │   │   ├── PageHeader.tsx         # Tiêu đề trang + Action button
│   │   │   ├── DataTable.tsx          # Bảng dữ liệu phân trang, sort, search
│   │   │   ├── StatusBadge.tsx        # Badge trạng thái đơn, bài viết, tuyến
│   │   │   ├── ConfirmDialog.tsx      # Hộp thoại xác nhận xóa/hành động nguy hiểm
│   │   │   ├── RichTextEditor.tsx     # Soạn thảo nội dung sinh HTML
│   │   │   ├── SeoPreview.tsx         # Thanh đo title/desc + Google SERP preview
│   │   │   └── MediaPickerModal.tsx   # Modal chọn ảnh từ thư viện
│   ├── features/
│   │   ├── auth/                      # LoginPage
│   │   ├── dashboard/                 # DashboardOverview (thống kê đơn, doanh thu, bài viết)
│   │   ├── routes/                    # RouteList, RouteForm (cấu hình tier, pickup, faqs)
│   │   ├── articles/                  # ArticleList, ArticleForm (editor HTML, SEO, TOC)
│   │   ├── pages/                     # PageList, PageForm (kind system vs content)
│   │   ├── bookings/                  # BookingList, BookingDetailModal, StatusTransitionActions
│   │   ├── drivers/                   # DriverList, DriverForm
│   │   ├── media/                     # MediaGallery, MediaUploadZone
│   │   ├── pricing/                   # AirportPricingTable, DistanceRatesTable
│   │   ├── settings/                  # CompanySettingsForm, PricingSettingsForm
│   │   ├── redirects/                 # RedirectList, RedirectForm
│   │   └── users/                     # UserList, UserForm (chỉ Admin)
│   └── tests/                         # Vitest tests cho utilities, auth, state machine
```

---

## 3. Rủi ro & Chiến lược kiểm soát (Risks & Mitigation)

1. **Rủi ro CORS giữa cổng admin và backend**:
   - *Kiểm soát:* Vite config sử dụng `server.proxy` chuyển tiếp tất cả request `/api` về `http://localhost:3001`. Khi build production, cho phép cấu hình `VITE_API_URL` và cập nhật backend CORS.
2. **Rủi ro sai lệch State Machine đơn đặt xe**:
   - *Kiểm soát:* Port lại logic State Machine từ `backend/src/lib/booking/stateMachine.ts` vào `admin/src/lib/stateMachine.ts`. Giao diện chỉ cho phép hiển thị các nút chuyển đổi trạng thái hợp lệ, ngăn chặn hoàn toàn lỗi `409 INVALID_TRANSITION`.
3. **Rủi ro phân quyền người dùng**:
   - *Kiểm soát:* Lớp `RoleGuard` bảo vệ cả ở cấp độ Component (ẩn menu) và cấp độ Router (chặn truy cập URL). Thêm vào đó, backend đã có access control lớp cơ sở dữ liệu để bảo vệ kép.
