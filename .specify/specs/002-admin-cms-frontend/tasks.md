# Tasks: Admin CMS Frontend Implementation

> **Spec**: [.specify/specs/002-admin-cms-frontend/spec.md](spec.md)
> **Plan**: [.specify/specs/002-admin-cms-frontend/plan.md](plan.md)
> **Constitution Reference**: `.specify/memory/constitution.md` (Checkpoints CP-1...CP-7)

---

## Giai đoạn 1: Khởi tạo dự án & Cấu hình nền tảng (Setup)

- [x] **T101**: Khởi tạo dự án `admin/` bằng Vite + React 19 + TypeScript, cấu hình `vite.config.ts` (Proxy `/api` -> `http://localhost:3001`), Tailwind CSS, PostCSS và Vitest.
  - *Files*: `admin/package.json`, `admin/vite.config.ts`, `admin/tsconfig.json`, `admin/tailwind.config.js`, `admin/src/index.css`
  - *Test*: `npm run build` và `npm test` trong `admin/` chạy thành công.
- [x] **T102**: Định nghĩa toàn bộ hệ thống Types (`admin/src/types/`) đồng bộ với backend schema: Auth, User, Route, Article, Page, Booking, Driver, Media, Settings, Redirects.
  - *Files*: `admin/src/types/*.ts`
  - *Test*: `npx tsc --noEmit` không có lỗi cú pháp.
- [x] **T103**: Xây dựng Utilities & Booking State Machine (`lib/`): format tiền tệ VND, định dạng ngày tháng, hàm mask số điện thoại, và logic máy trạng thái đơn đặt xe có kiểm thử đơn vị.
  - *Files*: `admin/src/lib/utils.ts`, `admin/src/lib/stateMachine.ts`, `admin/src/tests/stateMachine.test.ts`, `admin/src/tests/utils.test.ts`
  - *Test*: Viết test Vitest cho `stateMachine.test.ts` và `utils.test.ts` đảm bảo 100% pass trước khi cài UI.

---

## Giai đoạn 2: Lớp Dịch vụ API & Xác thực Phân quyền (Auth & RBAC)

- [x] **T104**: Xây dựng API Client (`api-client.ts`) với Axios: tự động gắn token `Bearer`, bắt lỗi 401 tự động logout, chuẩn hóa error envelope `{ message, code, fields }`.
  - *Files*: `admin/src/lib/api-client.ts`, `admin/src/lib/query-client.ts`
  - *Test*: Test đơn vị mô phỏng interceptor và xử lý token.
- [x] **T105**: Xây dựng Auth Context & Hook (`useAuth`), trang Đăng nhập (`LoginPage.tsx`) hỗ trợ hiển thị lỗi tiếng Việt, nhớ tài khoản.
  - *Files*: `admin/src/context/AuthContext.tsx`, `admin/src/features/auth/LoginPage.tsx`
  - *Test*: Test đăng nhập thành công lưu token và cập nhật trạng thái người dùng.
- [x] **T106**: Thiết lập Routing & Phân quyền (`ProtectedRoute.tsx`, `RoleGuard.tsx`): chặn truy cập khi chưa đăng nhập, tự động ẩn/chặn các phân hệ không thuộc thẩm quyền của `editor` hoặc `dispatcher`.
  - *Files*: `admin/src/routes/index.tsx`, `admin/src/routes/ProtectedRoute.tsx`, `admin/src/routes/RoleGuard.tsx`
  - *Test*: Test chuyển hướng khi không có quyền truy cập.

---

## Giai đoạn 3: Khung Giao diện & Thành phần Dùng chung (Layouts & UI Primitives)

- [x] **T107**: Xây dựng `DashboardLayout`: Sidebar điều hướng phân quyền (lọc menu theo Role: Admin, Editor, Dispatcher), Header với thông tin người dùng, nút Đăng xuất, Breadcrumb điều hướng.
  - *Files*: `admin/src/layouts/DashboardLayout.tsx`, `admin/src/components/common/Sidebar.tsx`, `admin/src/components/common/Header.tsx`
  - *Test*: Render layout kiểm tra hiển thị đúng các menu tương ứng từng role.
- [x] **T108**: Xây dựng các UI Primitives dùng chung (`components/ui/` & `components/common/`): Button, Input, Table, Badge, Modal/Dialog, `DataTable` (hỗ trợ phân trang, tìm kiếm), `ConfirmDialog`, `StatusBadge`.
  - *Files*: `admin/src/components/ui/*`, `admin/src/components/common/DataTable.tsx`, `admin/src/components/common/StatusBadge.tsx`, `admin/src/components/common/ConfirmDialog.tsx`
  - *Test*: Kiểm tra render và tương tác modal/button.

---

## Giai đoạn 4: Quản lý Thư viện Media & Tiện ích Biên tập Nội dung

- [x] **T109**: Xây dựng Phân hệ Thư viện Media (`features/media/`): tải lên kéo thả nhiều file, bắt buộc nhập Alt text chuẩn SEO (§2.1/§2.6), hiển thị lưới ảnh kèm thông tin kích thước và nút sao chép link.
  - *Files*: `admin/src/features/media/MediaGallery.tsx`, `admin/src/features/media/MediaUploadModal.tsx`
  - *Test*: Test tải lên ảnh và hiển thị danh sách media từ API `/api/media`.
- [x] **T110**: Xây dựng `MediaPickerModal`: Modal chọn ảnh dùng chung, cho phép chọn ảnh đại diện hoặc chèn ảnh vào bài viết từ các form khác.
  - *Files*: `admin/src/components/common/MediaPickerModal.tsx`
  - *Test*: Test sự kiện chọn ảnh trả về object ảnh chuẩn.
- [x] **T111**: Xây dựng Trình soạn thảo `RichTextEditor` và Khung kiểm tra SEO `SeoPreview`:
  - `RichTextEditor`: soạn thảo trực quan xuất HTML, tự sinh thẻ H2 có id để làm mục lục.
  - `SeoPreview`: thanh đo độ dài tiêu đề (≤70 ký tự) và mô tả (≤160 ký tự), mô phỏng giao diện Google SERP.
  - *Files*: `admin/src/components/common/RichTextEditor.tsx`, `admin/src/components/common/SeoPreview.tsx`
  - *Test*: Test xuất HTML và đếm ký tự chuẩn xác.

---

## Giai đoạn 5: Quản trị Nội dung — Bài viết & Trang (Articles & Pages)

- [x] **T112**: Xây dựng Quản lý Bài viết (`features/articles/`): Danh sách bài viết (lọc danh mục `kinh-nghiem`, `tin-tuyen`, `khuyen-mai`; lọc trạng thái `draft`/`published`), Form tạo/sửa bài viết tích hợp RichTextEditor, SeoPreview và MediaPicker. Tự động cảnh báo tạo 301 khi đổi slug.
  - *Files*: `admin/src/features/articles/ArticleList.tsx`, `admin/src/features/articles/ArticleForm.tsx`
  - *Test*: Test tạo mới và chỉnh sửa bài viết qua Payload API `/api/articles`.
- [x] **T113**: Xây dựng Quản lý Trang (`features/pages/`): Phân biệt trang hệ thống (`kind = system`) và trang nội dung (`kind = content`). Vô hiệu hóa nút xóa đối với trang hệ thống. Form chỉnh sửa cấu hình SEO và nội dung chính sách.
  - *Files*: `admin/src/features/pages/PageList.tsx`, `admin/src/features/pages/PageForm.tsx`
  - *Test*: Test không cho phép xóa trang hệ thống, lưu thành công trang chính sách qua `/api/pages`.

---

## Giai đoạn 6: Quản trị Tuyến đường & Bảng giá cước (Routes & Pricing Tiers)

- [x] **T114**: Xây dựng Danh sách Tuyến đường (`RouteList.tsx`): hiển thị 9+ tuyến, bộ lọc vùng miền, trạng thái (`active`, `draft`, `archived`), nhãn `bannerLabel` và cờ `isBannerTop`.
  - *Files*: `admin/src/features/routes/RouteList.tsx`
  - *Test*: Test nạp danh sách tuyến từ `/api/routes`.
- [x] **T115**: Xây dựng Form Quản lý Tuyến đường (`RouteForm.tsx`):
  - Nhập thông tin tuyến, tự động sinh slug từ tên tuyến.
  - Cấu hình 4 hạng vé (`tierShare1`, `tierShare2`, `tierCharter4to5`, `tierCharter7`) với loại giá (`fixed`, `range`, `from`, `negotiable`), tự tính `priceFrom`.
  - Quản lý danh sách điểm đón (`pickups`), điểm trả (`dropoffs`), câu hỏi thường gặp (`faqs`) và slides hình ảnh.
  - Cảnh báo tự sinh chuyển hướng 301 khi thay đổi slug tuyến đang hoạt động.
  - *Files*: `admin/src/features/routes/RouteForm.tsx`, `admin/src/features/routes/PricingTiersSection.tsx`
  - *Test*: Test lưu cấu hình tuyến đường thành công qua `/api/routes`.

---

## Giai đoạn 7: Tiếp nhận & Điều phối Đơn đặt xe (Bookings & Drivers)

- [x] **T116**: Xây dựng Quản lý Đơn đặt xe (`features/bookings/`):
  - Bảng danh sách đơn hàng có tìm kiếm theo mã đơn, lọc theo trạng thái và ngày đón.
  - Che số điện thoại khách hàng đối với tài khoản `editor`.
  - Chi tiết đơn hàng hiển thị lộ trình, thời gian đón, loại xe, giá dự tính và lịch sử chuyển trạng thái (`statusHistory`).
  - *Files*: `admin/src/features/bookings/BookingList.tsx`, `admin/src/features/bookings/BookingDetailModal.tsx`
  - *Test*: Test hiển thị đơn và che SĐT với role `editor`.
- [x] **T117**: Xây dựng Bộ nút chuyển trạng thái tuân thủ State Machine & Gán tài xế:
  - Chỉ hiển thị các nút chuyển đổi trạng thái hợp lệ theo State Machine (`pending` -> `confirmed`/`cancelled`, v.v.).
  - Giao diện gán tài xế từ danh sách tài xế đang hoạt động (`active`).
  - *Files*: `admin/src/features/bookings/StatusTransitionActions.tsx`, `admin/src/features/drivers/DriverList.tsx`, `admin/src/features/drivers/DriverFormModal.tsx`
  - *Test*: Test chuyển đổi trạng thái hợp lệ và chặn thao tác không hợp lệ.

---

## Giai đoạn 8: Cấu hình Hệ thống, Bảng giá mở rộng, SEO & Tài khoản

- [x] **T118**: Xây dựng Cấu hình Doanh nghiệp & Giá chung (`features/settings/`):
  - Form Cấu hình Công ty (`CompanySettings`): hotline, zalo, địa chỉ, cam kết, đánh giá.
  - Form Cấu hình Giá (`PricingSettings`): thời gian đặt trước tối thiểu, phụ phí đêm/lễ, bắt buộc nhập hạn giá `priceValidUntil`.
  - Bảng giá Sân bay (12 quận) & Bảng giá đường dài theo km.
  - *Files*: `admin/src/features/settings/CompanySettingsForm.tsx`, `admin/src/features/settings/PricingSettingsForm.tsx`, `admin/src/features/pricing/AirportPricingTable.tsx`, `admin/src/features/pricing/DistanceRatesTable.tsx`
  - *Test*: Test lưu thành công qua `/api/globals/company-settings` và `/api/globals/pricing-settings`.
- [x] **T119**: Xây dựng Quản lý Chuyển hướng 301 & Giám sát Sitemap (`features/redirects/`, `features/seo/`):
  - Danh sách và thêm mới Redirects: kiểm tra và cảnh báo vòng lặp chuyển hướng.
  - Trang Giám sát Sitemap: danh sách URL, loại trừ `noindex`.
  - *Files*: `admin/src/features/redirects/RedirectList.tsx`, `admin/src/features/redirects/RedirectFormModal.tsx`, `admin/src/features/seo/SitemapMonitor.tsx`
  - *Test*: Test tạo redirect mới và phát hiện trùng lặp URL.
- [x] **T120**: Xây dựng Quản lý Tài khoản Quản trị (`features/users/` — chỉ Admin):
  - Danh sách tài khoản, thêm mới người dùng, phân quyền vai trò (`admin`, `editor`, `dispatcher`).
  - *Files*: `admin/src/features/users/UserList.tsx`, `admin/src/features/users/UserFormModal.tsx`
  - *Test*: Test tạo user mới và chỉ cho phép admin truy cập.

---

## Giai đoạn 9: Bảng điều khiển Tổng quan & Hoàn thiện Hệ thống (Dashboard & Polish)

- [x] **T121**: Xây dựng Bảng điều khiển Tổng quan (`DashboardOverview.tsx`): thống kê nhanh số lượng đơn mới trong ngày, tổng số tuyến active, số bài viết đã xuất bản, widget danh sách đơn cần xử lý gấp.
  - *Files*: `admin/src/features/dashboard/DashboardOverview.tsx`
  - *Test*: Test render dashboard và tính toán thống kê.
- [x] **T122**: Tích hợp toàn diện, kiểm thử build, cấu hình CORS ở backend nếu cần và cập nhật tài liệu hướng dẫn chạy dự án.
  - *Files*: `backend/src/payload.config.ts` (thêm origin `http://localhost:5173`), `admin/README.md`, `README.md`
  - *Test*: `npm run build` trong `admin/` thành công (exit 0), `npm test` xanh, chạy dev server mượt mà kết nối backend.
