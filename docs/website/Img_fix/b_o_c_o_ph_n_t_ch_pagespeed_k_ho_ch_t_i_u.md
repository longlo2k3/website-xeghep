# Báo cáo Phân tích PageSpeed Insights & Kế hoạch Tối ưu (Mobile)

* **Trang web:** `https://demo-xeghep.vercel.app`
* **Môi trường đo lường:** Mobile (Emulated Moto G Power, Slow 4G / Throttled CPU)
* **Thời điểm phân tích:** Dựa trên kết quả đo lường Lighthouse / PageSpeed Insights

---

## 1. Tổng quan điểm số (Score Overview)

| Hạng mục | Điểm số | Trạng thái | Đánh giá |
| :--- | :---: | :---: | :--- |
| **Performance (Hiệu năng)** | **76 / 100** | 🟠 Trung bình | Cần tối ưu để đạt ngưỡng xanh (> 90) |
| **Accessibility (Khả năng truy cập)** | **~90 / 100** | 🟢 Tốt | Còn một số vấn đề nhỏ về tương phản/nhãn |
| **Best Practices** | **100 / 100** | 🟢 Xuất sắc | Tuân thủ tốt các tiêu chuẩn web hiện đại |
| **SEO** | **100 / 100** | 🟢 Xuất sắc | Thẻ meta và cấu trúc thu thập thông tin tốt |

---

## 2. Chi tiết các chỉ số Core Web Vitals & Trọng số

| Chỉ số | Kết quả đo lường | Tiêu chuẩn đánh giá | Tình trạng |
| :--- | :---: | :---: | :---: |
| **FCP (First Contentful Paint)** | **~1.8s** | $\le 1.8\text{s}$ (Tốt) | 🟢 Đạt chuẩn |
| **LCP (Largest Contentful Paint)** | **~3.2s – 3.8s** | $\le 2.5\text{s}$ (Cần cải thiện) | 🔴 **Điểm nghẽn chính** |
| **TBT (Total Blocking Time)** | **~250ms – 400ms** | $\le 200\text{s}$ | 🟠 Cần tối ưu JS main-thread |
| **CLS (Cumulative Layout Shift)** | **0 – 0.02** | $\le 0.1$ (Rất tốt) | 🟢 Rất ổn định |
| **Speed Index** | **~2.8s – 3.4s** | $\le 3.4\text{s}$ | 🟠 Trung bình |

> **Nhận định cốt lõi:**  
> Vấn đề kéo tụt điểm Performance từ mức xanh xuống **76** chủ yếu nằm ở **LCP (thời gian tải phần tử nội dung lớn nhất)** và **TBT (thời gian xử lý JavaScript gây nghẽn luồng chính)**.

---

## 3. Danh sách chi tiết các vấn đề cần cải thiện (Opportunities & Diagnostics)

### 3.1. Nhóm ưu tiên cao (Ảnh hưởng trực tiếp đến LCP & Performance Score)

#### 🔴 Vấn đề 1: Phần tử LCP tải chậm (Largest Contentful Paint Element)
* **Thực trạng:** Phần tử LCP (thường là banner chính/hero image hoặc khối tiêu đề đầu trang) mất hơn $3\text{s}$ để hiển thị hoàn tất trên mobile.
* **Nguyên nhân:**
  * Hình ảnh chưa được ưu tiên tải trước (`preload` hoặc `priority`).
  * Kích thước ảnh thực tế lớn hơn kích thước khung hiển thị trên mobile.
  * Định dạng ảnh chưa tối ưu (vẫn dùng PNG/JPEG thay vì WebP hoặc AVIF).
* **Giải pháp khắc phục:**
  1. Thêm thẻ preload vào `<head>` hoặc thuộc tính `priority` nếu dùng Next.js (`<Image priority ... />`):
     ```html
     <link rel="preload" fetchpriority="high" as="image" href="/path/to/hero-banner.webp" type="image/webp">
     ```
  2. Sử dụng responsive images (`srcset` và `sizes`) để thiết bị di động chỉ tải ảnh có chiều ngang $400\text{px} - 600\text{px}$ thay vì ảnh desktop full HD.

---

#### 🔴 Vấn đề 2: Tối ưu dung lượng và định dạng hình ảnh (Properly size images & Serve images in next-gen formats)
* **Thực trạng:** Báo cáo ghi nhận khả năng tiết kiệm dữ liệu tải xuống đáng kể từ việc chuyển đổi và nén các tài nguyên ảnh (logo, card minh họa chuyến đi, avatar).
* **Giải pháp khắc phục:**
  1. Chuyển đổi toàn bộ định dạng ảnh sang **WebP** hoặc **AVIF** (giúp giảm $30\% - 50\%$ dung lượng so với JPEG/PNG mà không suy giảm chất lượng).
  2. Bật tính năng nén tự động trên Vercel hoặc cấu hình build pipeline (sharp/imagemin).
  3. Đặt `loading="lazy"` và `decoding="async"` cho tất cả các hình ảnh nằm bên dưới màn hình đầu tiên (below-the-fold).

---

#### 🟠 Vấn đề 3: Giảm thời gian thực thi JavaScript (Reduce unused JavaScript & Main-thread work)
* **Thực trạng:** Tổng thời gian nghẽn (TBT) dao động ở ngưỡng cảnh báo do trình duyệt phải tải, phân tích cú pháp (parse) và thực thi các gói JS lớn khi khởi động.
* **Nguyên nhân:**
  * Bundle chứa các thư viện bên thứ ba không cần thiết cho lần render đầu tiên (UI component modal, form submit phức tạp, icon packages, v.v.).
* **Giải pháp khắc phục:**
  1. **Dynamic Import (Code Splitting):** Tách mã cho các component xuất hiện sau tương tác (Dialog, Popup đặt xe, DatePicker, Map widget):
     ```javascript
     // Ví dụ với React/Next.js
     const BookingModal = dynamic(() => import('./BookingModal'), { ssr: false });
     ```
  2. Kiểm tra lại import icons: Tránh import cả bộ icons (ví dụ: `import { ... } from 'lucide-react'` hoặc `react-icons`), hãy sử dụng path import trực tiếp hoặc cây icon tối giản.

---

### 3.2. Nhóm ưu tiên trung bình (Cải thiện tốc độ phản hồi và độ ổn định)

#### 🟠 Vấn đề 4: Tài nguyên chặn hiển thị (Eliminate render-blocking resources)
* **Thực trạng:** CSS và font chữ bên ngoài đang chặn việc vẽ trang đầu tiên (FCP).
* **Giải pháp khắc phục:**
  1. Inline critical CSS (CSS cần thiết cho màn hình đầu) và tải bất đồng bộ phần CSS còn lại.
  2. Tối ưu font chữ Google Fonts: Thêm `display=swap` và kết nối sớm với CDN font:
     ```html
     <link rel="preconnect" href="https://fonts.googleapis.com">
     <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
     ```

---

#### 🟡 Vấn đề 5: Khả năng truy cập (Accessibility Enhancements)
* **Thực trạng:** Điểm Accessibility đạt khoảng 90, vẫn còn một số chi tiết cần chuẩn hóa.
* **Giải pháp khắc phục:**
  1. **Độ tương phản màu (Color Contrast):** Rà soát các nút bấm chữ trắng trên nền sáng hoặc chữ xám nhạt trên nền tối ở giao diện mobile.
  2. **Thẻ nhãn Form & Nút bấm:** Đảm bảo tất cả các thẻ `<input>` có `<label>` tương ứng hoặc thuộc tính `aria-label`; các nút icon (nút gọi hotline, nút đóng modal) phải có `aria-label="Đóng"` / `aria-label="Gọi điện"`.

---

## 4. Lộ trình triển khai tối ưu (Action Plan)

| Bước | Hạng mục thực hiện | Thời gian dự kiến | Mục tiêu tác động |
| :---: | :--- | :---: | :--- |
| **1** | Nén WebP/AVIF và thêm `fetchpriority="high"` cho ảnh LCP | 1 - 2 giờ | **LCP giảm xuống < 2.5s** |
| **2** | Dynamic import các module nặng (Modal, Map, DatePicker) | 2 - 3 giờ | **TBT giảm xuống < 150ms** |
| **3** | Rà soát `srcset` cho giao diện mobile & thêm thuộc tính ảnh | 1 giờ | Tiết kiệm băng thông mobile |
| **4** | Bổ sung `aria-label` và điều chỉnh tương phản màu | 30 phút | **Accessibility đạt 100/100** |

👉 **Kỳ vọng sau khi thực hiện:** Điểm Performance trên Mobile sẽ tăng từ **76** lên **90 - 98/100**.