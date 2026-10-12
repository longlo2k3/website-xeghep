# Thiết kế Giao diện Sáng (Light Theme) cho Admin CMS

## 1. Mục tiêu & Phạm vi
Chuyển đổi toàn diện giao diện hệ thống quản trị Xe Ghép Liên Tỉnh (Admin CMS) từ giao diện tối (Dark Theme / Slate 950/900) sang giao diện sáng (Light Theme) hiện đại, sạch sẽ và chuyên nghiệp:
- Nền trang bao ngoài chuyển sang màu xám phấn nhẹ (`bg-slate-50`), thân thiện với mắt người dùng khi làm việc lâu dài.
- Các khối nội dung thẻ (Card), bảng dữ liệu (DataTable), thanh điều hướng (Sidebar), thanh đầu trang (Header) và hộp thoại (Modal) đồng bộ nền trắng tinh (`bg-white`) kèm viền xám nhạt (`border-slate-200`) và bóng mờ nhẹ (`shadow-sm`).
- Hệ thống văn bản (Typography) chuyển sang màu tối (`text-slate-900` cho tiêu đề chính, `text-slate-600` cho nội dung phụ, `text-slate-400` cho placeholder) đảm bảo độ tương phản cao đạt chuẩn WCAG AA.

## 2. Bảng quy đổi màu sắc (Color Palette Mapping)

| Thành phần giao diện | Trạng thái cũ (Dark Slate) | Trạng thái mới (Light Theme) | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Nền bao ngoài Dashboard** | `bg-slate-950 text-slate-100` | `bg-slate-50 text-slate-900` | Nền xám nhạt nhẹ nhàng làm nổi bật card trắng |
| **Thanh Sidebar** | `bg-slate-900 border-slate-800` | `bg-white border-slate-200 text-slate-800` | Đồng bộ thanh điều hướng sáng |
| **Sidebar Nav Items** | `text-slate-300 hover:bg-slate-800` | `text-slate-600 hover:bg-slate-100 hover:text-slate-900` | Item active giữ `bg-blue-600 text-white` |
| **Sidebar Footer / User Card** | `bg-slate-800/60 border-slate-700/50` | `bg-slate-100 border-slate-200 text-slate-800` | Thẻ thông tin user sáng sủa |
| **Thanh Header** | `bg-slate-900/90 border-slate-800` | `bg-white/95 border-slate-200 text-slate-800` | Kính mờ trắng `backdrop-blur-md` |
| **Header User Badge & Title** | `text-white`, `bg-slate-800/80` | `text-slate-900`, `bg-slate-100 border-slate-200` | Chữ rõ nét |
| **Card (Thẻ chứa nội dung)** | `bg-slate-800/60 border-slate-700/60` | `bg-white border-slate-200 shadow-sm text-slate-900` | Viền nhạt, nền trắng |
| **Card Header & Title** | `text-white border-slate-700/40` | `text-slate-900 border-slate-100` | Đường phân cách tinh tế |
| **Card Description** | `text-slate-400` | `text-slate-500` | Mô tả phụ dễ đọc |
| **Bảng DataTable (Container)**| `bg-slate-900/50 border-slate-800` | `bg-white border-slate-200 shadow-sm` | Khung bảng trắng |
| **DataTable Header (thead)** | `bg-slate-800/60 text-slate-400` | `bg-slate-50 text-slate-600 border-slate-200` | Đầu cột phân biệt rõ |
| **DataTable Rows (tr / td)** | `border-slate-800 text-slate-200` | `border-slate-100 text-slate-800 hover:bg-slate-50/80` | Dòng dữ liệu nổi bật khi hover |
| **DataTable Search & Inputs** | `bg-slate-800/80 border-slate-700/80` | `bg-white border-slate-200 text-slate-900` | Ô tìm kiếm nền trắng |
| **Input / Select / Textarea** | `bg-slate-800/90 border-slate-700` | `bg-white border-slate-200 text-slate-900` | Placeholder `text-slate-400` |
| **Modal Dialog** | `bg-slate-900 border-slate-700/80` | `bg-white border-slate-200 shadow-2xl text-slate-900` | Hộp thoại nền trắng |
| **Modal Backdrop** | `bg-slate-950/75` | `bg-slate-900/40 backdrop-blur-sm` | Nền mờ dịu mắt |
| **ConfirmDialog** | Nền tối, icon viền tối | Nền trắng, icon nền sáng dịu (`bg-rose-50`, `bg-amber-50`) | Thông báo cảnh báo rõ ràng |
| **Button Secondary & Outline**| `bg-slate-800 text-slate-200` | `bg-slate-100 text-slate-800 hover:bg-slate-200` | Nút phụ tương phản |
| **Badges & Status Tags** | Nền tối mờ (`bg-*/15 text-*-400`) | Nền pastel nhẹ (`bg-*-50 text-*-700 border-*-200`) | Nhãn trạng thái tươi sáng |

## 3. Danh sách các tệp tin cần cập nhật

1. `src/layouts/DashboardLayout.tsx`:
   - Đổi `bg-slate-950 text-slate-100` thành `bg-slate-50 text-slate-900`.
2. `src/components/common/Header.tsx`:
   - Đổi nền sang `bg-white/95 border-b border-slate-200`.
   - Cập nhật text breadcrumbs, header title sang `text-slate-900` và `text-slate-500`.
   - Cập nhật khối thông tin user và nút đăng xuất.
3. `src/components/common/Sidebar.tsx`:
   - Đổi nền sang `bg-white border-r border-slate-200`.
   - Đổi logo border/text sang tông sáng.
   - Cập nhật NavLink colors (`text-slate-600 hover:text-slate-900 hover:bg-slate-100`).
   - Cập nhật User card ở chân sidebar.
4. `src/components/ui/Card.tsx`:
   - Đổi `bg-slate-800/60 border-slate-700/60 text-slate-100` thành `bg-white border-slate-200 text-slate-900 shadow-sm`.
   - Cập nhật tiêu đề sang `text-slate-900`, mô tả sang `text-slate-500`.
5. `src/components/common/DataTable.tsx`:
   - Ô tìm kiếm, filter slot sang nền trắng viền `border-slate-200`.
   - Container bảng sang `bg-white border-slate-200`.
   - `thead` sang `bg-slate-50 text-slate-600 border-slate-200`.
   - Phân trang (Pagination footer) sang nền trắng, nút bấm chuyển trang sáng sủa.
6. `src/components/ui/Input.tsx`, `Select.tsx`, `Textarea.tsx`:
   - Nền `bg-white`, viền `border-slate-200`, chữ `text-slate-900`, label `text-slate-700`.
7. `src/components/ui/Modal.tsx` & `ConfirmDialog.tsx`:
   - Thân modal `bg-white border-slate-200`, tiêu đề `text-slate-900`, footer `bg-slate-50 border-slate-100`.
8. `src/components/ui/Button.tsx`, `Badge.tsx`:
   - Điều chỉnh variant styles cho phù hợp với nền sáng.
9. `src/components/common/SeoPreview.tsx`, `RichTextEditor.tsx`, `MediaPickerModal.tsx`:
   - Đồng bộ các component dùng chung có chứa class slate đậm sang tông màu sáng.

## 4. Kế hoạch kiểm thử & Xác minh chất lượng
- Chạy toàn bộ test suite (`npm run test` hoặc `npx vitest run`) đảm bảo không làm gãy vỡ test nào liên quan đến DOM rendering hay text content.
- Kiểm tra tính hiển thị của các trang chính:
  - Trang Tổng quan (Dashboard)
  - Trang Đơn đặt xe (Bookings)
  - Trang Tuyến đường & Giá (Routes)
  - Trang Bài viết (Articles)
- Xác nhận độ tương phản văn bản đạt chuẩn và không còn vùng nền tối sót lại gây xung đột thị giác.
