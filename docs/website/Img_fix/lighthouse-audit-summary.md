# Tổng hợp kết quả kiểm tra Lighthouse

## 1. Hiệu năng — Mobile

### Cơ hội cải thiện

- **Cải thiện việc phân phối hình ảnh**
  - Mức tiết kiệm ước tính: **430 KiB**
  - Cần tối ưu cách phân phối/kích thước/định dạng hình ảnh.

- **Yêu cầu chặn hiển thị**
  - Mức tiết kiệm ước tính: **650 mili giây**
  - Cần giảm tài nguyên làm chậm quá trình render ban đầu.

- **JavaScript cũ**
  - Mức tiết kiệm ước tính: **12 KiB**
  - Có thể giảm lượng JavaScript không cần thiết hoặc transpile không phù hợp với trình duyệt hiện đại.

### Các vấn đề khác

- **Buộc chỉnh lại luồng**
  - Cần kiểm tra và giảm các tác vụ khiến trình duyệt phải thực hiện lại quá trình tính toán layout/render.

- **Phát hiện yêu cầu LCP**
  - Cần xác định và tối ưu tài nguyên liên quan đến phần tử LCP (Largest Contentful Paint).

- **Cây phần phụ thuộc mạng**
  - Kiểm tra chuỗi các request phụ thuộc lẫn nhau để giảm thời gian tải tài nguyên.

### Các mục cần theo dõi

- **Tối ưu hoá kích thước DOM**
- **Bảng chi tiết về LCP (Nội dung lớn nhất hiển thị)**

---

## 2. Khả năng hỗ trợ / Accessibility — Mobile

### Tên và nhãn

- **Các phần tử biểu mẫu không có nhãn liên kết**
  - Một số form control chưa có label được liên kết đúng.
  - Cần đảm bảo các input/select/... có nhãn rõ ràng và có quan hệ semantic với control tương ứng.

- **Các phần tử lựa chọn không có phần tử nhãn đi kèm**
  - Một số control dạng lựa chọn chưa có label phù hợp.
  - Cần bổ sung nhãn hoặc semantic phù hợp để trình đọc màn hình có thể hiểu mục đích của control.

### Độ tương phản

- **Màu nền trước và nền sau không có đủ tỷ lệ tương phản**
  - Một số màu chữ/nền chưa đạt tỷ lệ tương phản cần thiết.
  - Cần điều chỉnh màu foreground/background để cải thiện khả năng đọc.

> Các vấn đề trên ảnh hưởng đến chức năng diễn giải ngữ nghĩa của các biện pháp kiểm soát trong ứng dụng và có thể làm giảm trải nghiệm của người dùng sử dụng công nghệ hỗ trợ, chẳng hạn như trình đọc màn hình.

---

## 3. Khả năng hỗ trợ / Accessibility — Desktop

### Tên và nhãn

- **Các phần tử biểu mẫu không có nhãn liên kết**
  - Một số form control chưa có label được liên kết đúng.

- **Các phần tử lựa chọn không có phần tử nhãn đi kèm**
  - Một số control dạng lựa chọn chưa có label phù hợp.

### Độ tương phản

- **Màu nền trước và nền sau không có đủ tỷ lệ tương phản**
  - Một số màu chữ/nền chưa đạt tỷ lệ tương phản cần thiết.
  - Cần điều chỉnh màu foreground/background để cải thiện khả năng đọc.

---

# Tổng hợp ưu tiên xử lý

| Ưu tiên | Vấn đề | Thiết bị | Ước tính / Ghi chú |
|---|---|---|---|
| 🔴 Cao | Yêu cầu chặn hiển thị | Mobile | Tiết kiệm khoảng **650 ms** |
| 🔴 Cao | Cải thiện việc phân phối hình ảnh | Mobile | Tiết kiệm khoảng **430 KiB** |
| 🔴 Cao | Form control không có label liên kết | Mobile + Desktop | Accessibility |
| 🔴 Cao | Control lựa chọn không có label | Mobile + Desktop | Accessibility |
| 🔴 Cao | Tỷ lệ tương phản chưa đủ | Mobile + Desktop | Accessibility |
| 🟠 Trung bình | JavaScript cũ | Mobile | Tiết kiệm khoảng **12 KiB** |
| 🟠 Trung bình | Buộc chỉnh lại luồng | Mobile | Tối ưu rendering/layout |
| 🟠 Trung bình | Phát hiện yêu cầu LCP | Mobile | Tối ưu LCP |
| 🟠 Trung bình | Cây phần phụ thuộc mạng | Mobile | Giảm request chain |
| 🟡 Theo dõi | Tối ưu kích thước DOM | Mobile | Kiểm tra DOM complexity |
| 🟡 Theo dõi | Chi tiết LCP | Mobile | Phân tích phần tử LCP |

## Checklist xử lý

### Performance

- [x] Tối ưu kích thước và định dạng hình ảnh (chuyển đổi banner 5.6MB -> 80KB WebP, tất cả ảnh tuyến đường -> WebP).
- [x] Sử dụng responsive images (`srcset`, `sizes`) khi phù hợp.
- [x] Lazy-load hình ảnh không nằm trong viewport ban đầu (`HeroSection`, `RoutePricingGrid`...).
- [x] Xác định và giảm CSS/JS chặn render (tinh gọn font weights từ 6 xuống 4).
- [x] Kiểm tra preload đối với tài nguyên quan trọng (chỉ giữ duy nhất 1 ảnh LCP `banner.webp` ở Section 1, loại bỏ priority thừa ở `HeroSection`).
- [x] Loại bỏ hoặc giảm JavaScript không cần thiết.
- [x] Kiểm tra các tác vụ gây forced reflow/layout.
- [x] Xác định phần tử LCP và tối ưu thời gian tải/render (`banner.webp` 80KB tải siêu tốc).
- [x] Kiểm tra network dependency chain (triệt tiêu tình trạng tải đồng thời 2 banner nặng tranh chấp băng thông).
- [x] Giảm DOM nếu cấu trúc trang quá lớn.

### Accessibility

- [x] Mỗi input/select/textarea có label phù hợp.
- [x] Liên kết `label` với form control bằng `htmlFor`/`id` (sử dụng React `useId()` đồng bộ và duy nhất).
- [x] Kiểm tra các control lựa chọn và bổ sung accessible name (bổ sung `role="radiogroup"` và thẻ label cho từng radio `rideType`).
- [x] Kiểm tra tỷ lệ tương phản giữa text và background (sửa `text-slate-500` -> `text-slate-600` / `text-slate-400` trên nền sáng/tối đạt chuẩn WCAG AA >= 4.5:1).
- [x] Kiểm tra cả trạng thái bình thường, hover, focus và disabled.
- [x] Kiểm tra lại bằng build và test tự động (`npm run build` và `npm run test` đều PASS 100%).
