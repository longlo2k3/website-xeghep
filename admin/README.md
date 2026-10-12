# Hệ Thống Quản Trị Admin CMS — Xe Ghép Liên Tỉnh

Giao diện Single Page Application (SPA) quản trị toàn diện dành riêng cho nền tảng **Xe Ghép Liên Tỉnh** (`xegheplientinh.vn`), được xây dựng tối ưu cho hiệu năng cao, trải nghiệm người dùng hiện đại và kiểm soát phân quyền chặt chẽ (RBAC).

---

## 🛠 Công Nghệ Sử Dụng

- **Frontend Core**: [React 19](https://react.dev/) + [TypeScript 5.7](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite 6](https://vitejs.dev/) (khởi động tức thì, HMR siêu tốc)
- **Styling & UI**: [Tailwind CSS v3](https://tailwindcss.com/) + Kiểu dáng [shadcn/ui](https://ui.shadcn.com/) (Dark Mode chuẩn mực, tông màu Slate chuyên nghiệp)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Fetching & State**: [Axios](https://axios-http.com/) với Interceptor tự động đính kèm JWT Bearer Token và xử lý mã lỗi Envelope chuẩn hóa + [TanStack Query v5](https://tanstack.com/query/latest)
- **Routing**: [React Router v6](https://reactrouter.com/) với cơ chế `ProtectedRoute` & `RoleGuard`
- **Testing**: [Vitest 3](https://vitest.dev/) + [@testing-library/react](https://testing-library.com/) (100% component và luồng dữ liệu có unit test)

---

## 🏛 Cấu Trúc Thư Mục Dự Án

```
admin/
├── index.html                  # HTML template chính của ứng dụng
├── vite.config.ts              # Cấu hình Vite, alias path `@/` trỏ tới `src/`, proxy API
├── tsconfig.json               # Cấu hình TypeScript nghiêm ngặt
├── tailwind.config.js          # Hệ màu theme Slate, bo góc, animation
├── package.json                # Dependencies, test scripts và build commands
├── src/
│   ├── main.tsx                # Điểm khởi chạy React root
│   ├── App.tsx                 # Wrapper QueryClientProvider, AuthProvider, BrowserRouter
│   ├── index.css               # Base Tailwind CSS, thanh cuộn tùy biến
│   ├── api/                    # Cấu hình API client bổ sung
│   ├── context/
│   │   └── AuthContext.tsx     # Context quản lý đăng nhập, JWT token, User profile, RBAC
│   ├── layouts/
│   │   └── DashboardLayout.tsx # Layout chung với Sidebar điều hướng và Header người dùng
│   ├── components/
│   │   ├── ui/                 # Nguyên tử UI (Button, Input, Select, Badge, Card, Modal, Dialog)
│   │   └── common/             # Thành phần dùng chung (DataTable, ConfirmDialog, MediaPickerModal, RichTextEditor, SeoPreview, Sidebar, Header, StatusBadge)
│   ├── features/               # 11 phân hệ chức năng chuyên biệt:
│   │   ├── auth/               # Đăng nhập quản trị viên (LoginPage)
│   │   ├── dashboard/          # Bảng điều khiển Tổng quan & KPI (DashboardOverview)
│   │   ├── routes/             # Quản trị Tuyến đường & Bảng giá cước 4 hạng (RouteList, RouteForm)
│   │   ├── articles/           # Bài viết Tin tức & Cẩm nang chuẩn SEO (ArticleList, ArticleForm)
│   │   ├── pages/              # Trang Nội dung tĩnh & Chính sách (PageList, PageForm)
│   │   ├── media/              # Thư viện Media, thẻ Alt bắt buộc (MediaGallery, MediaUploadModal)
│   │   ├── bookings/           # Đơn đặt xe, che SĐT Editor, State Machine (BookingList, BookingDetailModal, StatusTransitionActions)
│   │   ├── drivers/            # Quản lý Đội ngũ Tài xế (DriverList, DriverFormModal)
│   │   ├── pricing/            # Bảng giá Sân bay 12 quận & Bảng giá km (AirportPricingTable, DistanceRatesTable)
│   │   ├── redirects/          # Quản lý Chuyển hướng 301 & cảnh báo vòng lặp (RedirectList, RedirectFormModal)
│   │   ├── seo/                # Giám sát Sitemap XML loại trừ noindex (SitemapMonitor)
│   │   ├── settings/           # Cấu hình Doanh nghiệp & Thiết lập giá (CompanySettingsForm, PricingSettingsForm)
│   │   └── users/              # Quản lý Tài khoản Quản trị & Phân quyền (UserList, UserFormModal)
│   ├── lib/
│   │   ├── api-client.ts       # Axios instance, token storage, interceptors và dịch lỗi tiếng Việt
│   │   ├── stateMachine.ts     # State Machine chuyển đổi trạng thái đơn đặt xe hợp lệ
│   │   ├── utils.ts            # Hàm tiện ích: formatVND, formatDateTime, maskPhone, formatFileSize
│   │   └── query-client.ts     # Cấu hình cache TanStack Query
│   ├── routes/
│   │   ├── index.tsx           # Bản đồ định tuyến toàn ứng dụng
│   │   ├── ProtectedRoute.tsx  # Chặn người dùng chưa đăng nhập, tự chuyển về /login
│   │   └── RoleGuard.tsx       # Chặn truy cập trái quyền theo vai trò (admin, editor, dispatcher)
│   ├── tests/                  # Bộ kiểm thử Vitest toàn diện
│   └── types/                  # Định nghĩa TypeScript contracts đồng bộ với Payload CMS
```

---

## 📋 11 Phân Hệ Quản Trị Hệ Thống

| STT | Phân hệ | Đường dẫn | Phân quyền vai trò | Tính năng chính |
|:---:|---|---|:---:|---|
| **1** | **Bảng điều khiển Tổng quan** | `/dashboard`, `/` | Admin, Editor, Dispatcher | Thống kê 4 KPI (Đơn chờ duyệt, Tuyến hoạt động, Bài viết xuất bản, Tài xế hoạt động), Lối tắt nhanh Quick Actions theo role, Bảng 5 đơn chờ xử lý gấp, Thẻ tuyến xe nổi bật Banner Top. |
| **2** | **Tuyến đường & Giá cước** | `/routes`, `/routes/new`, `/routes/:id` | Admin, Editor | Quản lý 9+ tuyến xe liên tỉnh, tự động sinh slug, cấu hình 4 hạng vé (ghép 1, ghép 2, bao xe 4-5 chỗ, bao xe 7 chỗ), tự tính `priceFrom`, điểm đón/trả, FAQ, slides ảnh, cảnh báo 301 khi sửa slug. |
| **3** | **Bài viết & Cẩm nang SEO** | `/articles`, `/articles/new`, `/articles/:id` | Admin, Editor | Biên tập tin tức, cẩm nang du lịch, khuyến mại; chuẩn SEO (metaTitle, metaDescription, OG Image, noindex); tự động tạo mục lục TOC. |
| **4** | **Trang Nội dung & Chính sách** | `/pages`, `/pages/new`, `/pages/:id` | Admin, Editor | Quản lý các trang tĩnh và chính sách hệ thống (Điều khoản, Giới thiệu, Bảo mật); bảo vệ trang hệ thống (`kind=system`) ngăn ngừa vô tình xóa nhầm. |
| **5** | **Thư viện Media** | `/media` | Admin, Editor | Tải lên và quản lý ảnh/tệp tin, bắt buộc nhập thẻ Alt cho SEO, lọc theo loại tệp, xem trước ảnh, hỗ trợ hiển thị dạng Lưới (Grid) và Bảng (Table). |
| **6** | **Tiếp nhận Đơn đặt xe** | `/bookings` | Admin, Dispatcher, Editor | Bảng danh sách đơn hàng có tìm kiếm mã đơn, lọc theo trạng thái và ngày đón; **bảo mật che SĐT khách hàng** đối với tài khoản `editor`. |
| **7** | **Điều phối xe & State Machine** | `/bookings` | Admin, Dispatcher | Chuyển trạng thái đơn tuân thủ nghiêm ngặt State Machine (`pending` → `confirmed`/`cancelled` → `assigned` → `in_progress` → `completed`); gán tài xế đang hoạt động. |
| **8** | **Đội ngũ Tài xế** | `/drivers` | Admin, Dispatcher | Quản lý thông tin tài xế, số điện thoại, biển kiểm soát, loại xe chạy (4/5/7/16 chỗ) và công tắc bật/tắt trạng thái hoạt động. |
| **9** | **Bảng giá Mở rộng** | `/pricing` | Admin, Dispatcher | Bảng giá đón/tiễn sân bay Nội Bài cho 12 quận và Bảng giá đường dài lũy tiến theo dải km. |
| **10** | **Chuyển hướng 301 & Sitemap** | `/redirects`, `/seo` | Admin, Editor | Danh sách và thêm mới cấu hình Redirect 301/302/410, tự động phát hiện và cảnh báo vòng lặp chuyển hướng; trang giám sát Sitemap XML loại trừ `noindex`. |
| **11** | **Cấu hình & Quản lý Tài khoản** | `/settings`, `/users` | Chỉ **Admin** | Thiết lập thông tin doanh nghiệp (hotline, Zalo, địa chỉ, cam kết), cấu hình giá chung (`priceValidUntil` bắt buộc, phụ phí đêm/lễ), quản lý tài khoản và cấp quyền người dùng. |

---

## ⚙️ Biến Môi Trường (Environment Variables)

Tạo tệp `.env` hoặc `.env.local` tại thư mục `admin/`:

```bash
# URL Backend Payload CMS (Mặc định dev server proxy qua /api)
VITE_API_URL=http://localhost:3001/api
```

> **Lưu ý**: Trong môi trường phát triển local, nếu không thiết lập `VITE_API_URL`, hệ thống sẽ mặc định dùng đường dẫn tương đối `/api` (kết hợp với cấu hình proxy của Vite để chuyển tiếp tới cổng 3001 của Backend).

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Cài đặt thư viện dependencies
```powershell
cd admin
npm install
```

### 2. Khởi chạy máy chủ phát triển (Development)
```powershell
npm run dev
```
Ứng dụng sẽ khả dụng tại: **`http://localhost:5173`** (hoặc `http://127.0.0.1:5173`).

### 3. Kiểm tra kiểu dữ liệu (Type check)
```powershell
npm run typecheck
```

### 4. Chạy bộ kiểm thử (Unit Test)
```powershell
# Chạy toàn bộ test suites 1 lần
npm test

# Chạy test ở chế độ watch khi code
npm run test:watch
```

### 5. Đóng gói sản phẩm (Build Production)
```powershell
npm run build
```
Kết quả build được tạo trong thư mục `dist/` sẵn sàng triển khai trên bất kỳ Web Server hoặc CDN nào (Nginx, Vercel, Cloudflare Pages, S3).
