# Báo cáo các hạng mục cần cải thiện – Lighthouse Mobile

## 1. Tổng quan hiện trạng

| Chỉ số | Kết quả | Đánh giá |
|---|---:|---|
| First Contentful Paint (FCP) | **1,2 giây** | 🟢 Tốt |
| Largest Contentful Paint (LCP) | **4,1 giây** | 🔴 Cần cải thiện |
| Total Blocking Time (TBT) | **30 ms** | 🟢 Tốt |
| Cumulative Layout Shift (CLS) | **0** | 🟢 Tốt |
| Speed Index | **2,4 giây** | 🟢 Tốt |

### Vấn đề chính

**LCP = 4,1 giây** là chỉ số cần ưu tiên xử lý.

Mục tiêu nên hướng tới:

- LCP: **< 2,5 giây**
- FCP: **< 1,8 giây**
- TBT: **< 200 ms**
- CLS: **< 0,1**
- Speed Index: **< 3,4 giây**

Hiện tại FCP, TBT, CLS và Speed Index đã khá tốt. Vì vậy, trọng tâm tối ưu nên tập trung vào **LCP và tài nguyên ảnh/CSS/JS ảnh hưởng đến phần tử LCP**.

---

# 2. Các hạng mục cần cải thiện

## 🔴 2.1. Tối ưu Largest Contentful Paint (LCP)

**Hiện tại: 4,1 giây → mục tiêu < 2,5 giây**

LCP thường bị ảnh hưởng bởi:

- Ảnh hero/banner lớn.
- Ảnh quảng cáo hoặc ảnh đầu trang.
- CSS chặn render.
- JavaScript làm chậm quá trình render.
- Tài nguyên LCP được phát hiện quá muộn.
- Font hoặc tài nguyên bên ngoài tải trước phần nội dung chính.

### Cần kiểm tra

- Xác định chính xác **LCP element** trong Lighthouse.
- Kiểm tra đó có phải ảnh hero/banner hay một block nội dung lớn không.
- Nếu LCP là ảnh:
  - Dùng `WebP`/`AVIF`.
  - Resize ảnh đúng kích thước hiển thị.
  - Không dùng ảnh có kích thước lớn hơn nhiều so với viewport.
  - Không lazy-load ảnh LCP.
  - Ưu tiên preload nếu cần.

### Với Next.js

Có thể ưu tiên ảnh LCP bằng `next/image`:

```tsx
<Image
  src="/images/hero.webp"
  alt="..."
  width={1200}
  height={600}
  priority
/>
```

Nếu ảnh LCP là tài nguyên quan trọng nhưng được phát hiện muộn, có thể cân nhắc preload:

```tsx
<link
  rel="preload"
  as="image"
  href="/images/hero.webp"
/>
```

> Không nên preload quá nhiều ảnh vì có thể làm cạnh tranh bandwidth với CSS/JS quan trọng.

---

## 🔴 2.2. Giảm CSS/JS chặn render

Lighthouse ghi nhận:

**Render-blocking resources → tiết kiệm ước tính khoảng 620 ms**

Đây là một trong những hạng mục đáng ưu tiên.

### Cần kiểm tra

- CSS nào đang được tải trước khi nội dung trên màn hình được render?
- Có CSS global quá lớn không?
- Có thư viện UI kéo theo nhiều CSS không sử dụng không?
- Có JS bundle nào cần thiết cho màn hình đầu tiên nhưng đang quá lớn không?

### Hướng xử lý

- Loại bỏ CSS không sử dụng.
- Chỉ tải CSS cần thiết.
- Tách code theo route/component.
- Lazy-load component không nằm trong viewport đầu tiên.
- Tránh import cả thư viện chỉ để sử dụng một component nhỏ.
- Kiểm tra bundle bằng bundle analyzer.

### Với Next.js

Có thể kiểm tra bundle:

```bash
npm install @next/bundle-analyzer
```

Sau đó phân tích các bundle lớn để tìm:

- package không cần thiết;
- package bị duplicate;
- component được import quá sớm;
- thư viện có kích thước lớn.

---

## 🟠 2.3. Giảm JavaScript không sử dụng

Lighthouse báo:

**Unused JavaScript → tiết kiệm ước tính khoảng 12 KiB**

Mức này không quá lớn nhưng vẫn nên xử lý.

### Cần kiểm tra

- JS được tải nhưng không sử dụng trên trang hiện tại.
- Component chỉ hiển thị khi user tương tác nhưng lại load ngay từ đầu.
- Thư viện lớn được import global.
- Các component phía client (`"use client"`) không thực sự cần thiết.

### Hướng xử lý

Ưu tiên Server Component khi dùng Next.js:

```tsx
// Không cần "use client" nếu component không có
// state, effect hoặc browser API.
export default function ProductList() {
  return <div>...</div>;
}
```

Với component nặng chỉ cần sau khi user tương tác:

```tsx
const HeavyComponent = dynamic(
  () => import("./HeavyComponent"),
  {
    ssr: false,
  }
);
```

---

## 🟠 2.4. Tối ưu phân phối hình ảnh

Lighthouse ghi nhận:

**Improve image delivery → tiết kiệm ước tính khoảng 59 KiB**

### Cần thực hiện

- Chuyển PNG/JPEG sang **WebP hoặc AVIF** nếu phù hợp.
- Resize ảnh theo kích thước thực tế.
- Không dùng ảnh `2000px` cho vùng chỉ hiển thị `400px`.
- Dùng responsive images.
- Lazy-load các ảnh nằm dưới fold.
- Chỉ ưu tiên ảnh thực sự nằm trong viewport đầu tiên.

### Với Next.js

Ưu tiên:

```tsx
<Image
  src={image}
  alt={alt}
  width={400}
  height={300}
  sizes="(max-width: 768px) 100vw, 400px"
/>
```

Các ảnh không phải LCP:

```tsx
<Image
  src={image}
  alt={alt}
  width={400}
  height={300}
  loading="lazy"
/>
```

---

## 🟠 2.5. Tối ưu cây phụ thuộc mạng

Lighthouse cảnh báo:

**Network dependency tree**

Điều này thường xảy ra khi một tài nguyên phải chờ tài nguyên khác tải xong mới có thể tiếp tục.

### Cần kiểm tra

- Chuỗi request của CSS → JS → API → ảnh.
- Third-party scripts.
- Font bên ngoài.
- Analytics/tracking.
- API request không cần thiết trong lần tải đầu tiên.

### Hướng xử lý

- Giảm số lượng request quan trọng.
- Ưu tiên critical resources.
- `preconnect` tới domain thực sự cần thiết.
- Trì hoãn third-party scripts.
- Không gọi API không cần thiết khi trang vừa mở.
- Cache tài nguyên tĩnh.

Ví dụ:

```html
<link rel="preconnect" href="https://example.com" />
```

Chỉ sử dụng khi domain đó thực sự là dependency quan trọng.

---

## 🟡 2.6. Tối ưu kích thước DOM

Lighthouse cũng đưa ra mục:

**Optimize DOM size**

DOM quá lớn có thể làm tăng:

- thời gian style calculation;
- layout;
- paint;
- memory usage;
- thời gian React phải render/re-render.

### Cần kiểm tra

- Component lồng nhau quá sâu.
- Render quá nhiều card cùng lúc.
- Các element không cần thiết.
- Danh sách dài nhưng không có virtualization.
- Các wrapper `<div>` dư thừa.

### Hướng xử lý

- Giảm wrapper không cần thiết.
- Tách component hợp lý.
- Pagination hoặc infinite scroll với danh sách lớn.
- Virtualization với danh sách rất dài.
- Không render nội dung chưa cần thiết.

---

# 3. Thứ tự ưu tiên xử lý

## Priority 1 – Bắt buộc

### 1. LCP – 4,1 giây

**Mục tiêu: < 2,5 giây**

Checklist:

- [ ] Xác định LCP element.
- [ ] Nếu LCP là ảnh → tối ưu WebP/AVIF.
- [ ] Resize ảnh đúng kích thước.
- [ ] Không lazy-load ảnh LCP.
- [ ] Cân nhắc `priority` với `next/image`.
- [ ] Kiểm tra CSS/JS chặn LCP.
- [ ] Kiểm tra request waterfall.
- [ ] Giảm thời gian server response nếu LCP bị ảnh hưởng bởi TTFB.

### 2. Render-blocking resources

**Tiết kiệm khoảng 620 ms**

Checklist:

- [ ] Xác định CSS/JS blocking.
- [ ] Remove unused CSS.
- [ ] Code splitting.
- [ ] Lazy-load component không cần thiết.
- [ ] Giảm third-party scripts.
- [ ] Kiểm tra global CSS.

---

# 4. Priority 2 – Nên xử lý

### 3. Image delivery

**Tiết kiệm khoảng 59 KiB**

- [ ] WebP/AVIF.
- [ ] Resize ảnh.
- [ ] Responsive images.
- [ ] Lazy-load ảnh dưới fold.
- [ ] Kiểm tra ảnh quảng cáo/banner.

### 4. Unused JavaScript

**Tiết kiệm khoảng 12 KiB**

- [ ] Kiểm tra bundle.
- [ ] Dynamic import component nặng.
- [ ] Giảm `"use client"` không cần thiết.
- [ ] Loại bỏ package/import không sử dụng.

### 5. Network dependency tree

- [ ] Kiểm tra request waterfall.
- [ ] Giảm request chain.
- [ ] Trì hoãn third-party.
- [ ] Tối ưu font.
- [ ] Cache static assets.

---

# 5. Priority 3 – Tối ưu thêm

### DOM

- [ ] Giảm số lượng DOM node.
- [ ] Giảm độ sâu nesting.
- [ ] Pagination/infinite scroll cho danh sách dài.
- [ ] Virtualization nếu có hàng trăm/hàng nghìn item.

---

# 6. Những phần hiện tại đã tốt

Không nên tối ưu quá mức các chỉ số đang tốt:

### FCP – 1,2 giây 🟢

Đã tốt. Không cần ưu tiên cao.

### TBT – 30 ms 🟢

Rất tốt.

Điều này cho thấy JavaScript hiện tại **không phải vấn đề blocking CPU nghiêm trọng**.

### CLS – 0 🟢

Rất tốt.

Layout không bị nhảy khi tải trang.

### Speed Index – 2,4 giây 🟢

Đang ở mức tốt.

---

# 7. Kế hoạch tối ưu đề xuất

```text
Lighthouse Mobile
       │
       ├── 1. Xác định LCP element
       │       ├── LCP là ảnh?
       │       │     ├── WebP/AVIF
       │       │     ├── Resize
       │       │     ├── priority
       │       │     └── preload nếu cần
       │       │
       │       └── LCP là HTML?
       │             ├── giảm CSS blocking
       │             ├── giảm JS blocking
       │             └── giảm dependency
       │
       ├── 2. Xử lý render-blocking ~620ms
       │       ├── Critical CSS
       │       ├── Code splitting
       │       └── Lazy load
       │
       ├── 3. Tối ưu image ~59KiB
       │       ├── WebP/AVIF
       │       ├── Resize
       │       └── Responsive image
       │
       ├── 4. Giảm unused JS ~12KiB
       │
       ├── 5. Network dependency tree
       │
       └── 6. Giảm DOM
```

# 8. Mục tiêu sau khi tối ưu

| Chỉ số | Hiện tại | Mục tiêu |
|---|---:|---:|
| FCP | 1,2s | < 1,8s |
| **LCP** | **4,1s 🔴** | **< 2,5s 🟢** |
| TBT | 30ms | < 200ms |
| CLS | 0 | < 0,1 |
| Speed Index | 2,4s | < 3,4s |

## Kết luận

Trang hiện tại **không gặp vấn đề nghiêm trọng về JavaScript blocking hoặc layout shift**. Vấn đề lớn nhất là **LCP 4,1 giây**.

Do đó, không nên dành quá nhiều thời gian tối ưu TBT/CLS khi chúng đã rất tốt. Hãy tập trung theo thứ tự:

**LCP → Render-blocking → Image delivery → Network dependency → Unused JS → DOM**

Mục tiêu thực tế là đưa **LCP từ 4,1s xuống dưới 2,5s**. Sau mỗi lần thay đổi, chạy lại Lighthouse ở cùng điều kiện Mobile để so sánh trước/sau.
