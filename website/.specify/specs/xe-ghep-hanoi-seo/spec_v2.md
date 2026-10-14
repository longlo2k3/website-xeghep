# Đặc Tả Bố Cục Nội Dung — Xe Ghép Liên Tỉnh (Spec-Kit Mode)

> **Mã đặc tả**: SPEC-XE-GHEP-001  
> **Phiên bản**: 1.0.0 (Bản gốc theo đúng thiết kế `xe-ghep-lien-tinh-layout.md`)  
> **Căn cứ**: [xe-ghep-lien-tinh-layout.md](../../../xe-ghep-lien-tinh-layout.md) & [Hiến Pháp Dự Án](../../memory/constitution.md) & [AGENTS.md](../../../AGENTS.md)

---

## 1. Kiến Trúc Sitemap

```
/                                  Trang chủ
/gioi-thieu                        Giới thiệu
/tuyen-lien-tinh                   Các tuyến liên tỉnh (trang tổng hợp)
  ├─ /tuyen-lien-tinh/hai-phong-bac-ninh-bac-giang
  ├─ /tuyen-lien-tinh/hai-phong-ha-noi-noi-bai
  ├─ /tuyen-lien-tinh/hai-phong-ha-long
  ├─ /tuyen-lien-tinh/hai-phong-mong-cai
  ├─ /tuyen-lien-tinh/ha-long-bac-ninh-bac-giang
  ├─ /tuyen-lien-tinh/ha-noi-mong-cai
  ├─ /tuyen-lien-tinh/ha-noi-ha-long
  ├─ /tuyen-lien-tinh/hai-phong-hai-duong
  └─ /tuyen-lien-tinh/hai-phong-thai-nguyen
/tin-tuc                           Tin tức (danh sách)
  └─ /tin-tuc/[slug]               Chi tiết bài viết
/lien-he                           Liên hệ
/chinh-sach/thanh-toan             Chính sách thanh toán
/chinh-sach/dam-bao                Chính sách đảm bảo
/chinh-sach/bao-mat                Chính sách bảo mật
```

---

## 2. Thành Phần Dùng Chung (Global)

### 2.1. Header (Sticky)

- **Bên trái**: Logo `XE GHÉP LIÊN TỈNH` + hotline `0962.298.293` hiển thị ngay dưới logo.
- **Ở giữa (Desktop)**: Menu điều hướng: Trang chủ · Giới thiệu · Các tuyến liên tỉnh ▾ · Tin tức · Liên hệ.
  - Dropdown "Các tuyến liên tỉnh" gồm 9 submenu và link đầu tiên "Xem tất cả các tuyến".
- **Bên phải (Desktop)**: Nút `GỌI NGAY: 0962.298.293` (nền đỏ, chữ trắng).
- **Mobile**: Icon Hamburger bên trái, logo ở giữa, nút gọi nhanh bên phải.

### 2.2. Top Banner (Ngay dưới header)

- **Dòng 1**: `XE GHÉP: MÓNG CÁI - HẠ LONG - HẢI PHÒNG - BẮC NINH - BẮC GIANG - HÀ NỘI`
- **Dòng 2 (nhấn mạnh)**: `ĐẶT XE LIÊN HỆ NGAY: 0962.298.293`

### 2.3. Nút Gọi Nổi (Floating)

- Nút tròn nổi góc dưới trái và thanh pill `GỌI NGAY: 0962.298.293` góc dưới phải, hiển thị trên mọi trang, liên kết trực tiếp `href="tel:0962298293"`.

### 2.4. Footer (4 Cột, Mobile xếp dọc)

- **Cột 1 (XE GHÉP LIÊN TỈNH)**: Dịch vụ xe ghép, xe tiện chuyến Móng Cái, Hạ Long, Hải Phòng, Hà Nội, Bắc Ninh, Bắc Giang. Xe chạy thẳng, nhanh, giá rõ ràng, đón trả tận nơi, phục vụ 24/7.
- **Cột 2 (THÔNG TIN LIÊN HỆ)**: Website: `xegheplientinh.vn` · Hotline: `0962.298.293` · Email: `xegheplientinhvip@gmail.com` · Fanpage: `Xe Ghép Bắc Giang - Bắc Ninh - Hải Phòng`.
- **Cột 3 (DỊCH VỤ XE)**: Link tới 4 nhóm tuyến chính: Móng Cái ⇄ Hạ Long ⇄ Hải Phòng ⇄ Hà Nội · Hà Nội ⇄ Bắc Ninh ⇄ Bắc Giang · Hải Phòng ⇄ Bắc Ninh ⇄ Bắc Giang.
- **Cột 4 (CHÍNH SÁCH)**: Chính sách thanh toán · Chính sách đảm bảo · Chính sách bảo mật.
- **Dòng cuối**: `© Bản quyền thuộc về Xe Ghép Liên Tỉnh`.

---

## 3. Trang Chủ (`/`)

### Section 1 — Banner Bảng Giá Các Tuyến Chính

- Ảnh banner lớn nền xanh/đường cao tốc, tiêu đề **BẢNG GIÁ CÁC TUYẾN CHÍNH**.
- Lưới 7 ô tuyến trọng điểm:
  1. Hải Phòng ⇔ Hải Dương
  2. Hải Phòng ⇔ Hạ Long
  3. Hải Phòng ⇔ Thái Nguyên
  4. Hải Phòng ⇔ Móng Cái
  5. Hà Nội ⇔ Móng Cái
  6. Hạ Long ⇔ Bắc Ninh ⇔ Bắc Giang
  7. Hải Phòng ⇔ Hà Nội ⇔ Nội Bài
- Dải chữ nổi bật: **DỊCH VỤ GỬI HÀNG HOÁ TỐC GIÁ CHỈ TỪ 150K TẤT CẢ CÁC TUYẾN**.
- Ghi chú: Xe ghép chỉ có từ 1–3 khách/chuyến, phục vụ 2 chiều đón trả tận nhà, phục vụ cả ngày lẫn đêm; giá có thể thay đổi tuỳ thời điểm lễ, tết.

### Section 2 — Hero

- **H1**: `XE GHÉP LIÊN TỈNH`
- **Sub**: `CHUYÊN MÓNG CÁI – HẠ LONG – HẢI PHÒNG – BẮC NINH – BẮC GIANG – HÀ NỘI.` Chất lượng dịch vụ 5 ★★★★★. Cam kết 100% xe riêng đời mới, đưa đón tận nhà, giá trọn gói. Giảm 10% cho khách hàng cũ.
- **CTA**: Nút đỏ `GỌI NGAY: 0962.298.293`.
- Nền: Ảnh xe + gradient xanh dương.

### Section 3 — Đặt Xe Trực Tuyến (`BookingForm`)

Tiêu đề: **ĐẶT XE TRỰC TUYẾN**

- Điểm đón (text + autocomplete, icon pin xanh).
- Điểm đến (text + autocomplete, icon pin đỏ).
- Nút Đảo chiều (⇄): Hoán đổi Điểm đón và Điểm đến.
- Hình thức: Radio chọn `Ghép ghế` / `Bao xe`.
- Họ và tên: Text (bắt buộc).
- Số điện thoại: Tel (bắt buộc, validate số điện thoại Việt Nam).
- Tùy chọn dịch vụ: Select chọn `Xe 4 chỗ` / `Xe 5 chỗ` / `Xe 7 chỗ` / `Gửi hàng`.
- Ngày và giờ đón: Datetime (không cho chọn quá khứ).
- Nút Submit: **Đặt xe ngay** ➔ Thông báo: _"Chúng tôi sẽ gọi lại trong ít phút"_.

### Section 4 — Bảng Giá Xe Ghép

- **H2**: `BẢNG GIÁ XE GHÉP`
- Ghi chú: _Giá đã bao gồm phí cầu đường bến bãi – Cam kết 100% xe riêng đời mới, đưa đón tại nhà – Miễn phí huỷ chuyến._
- Lưới 9 `RouteCard` (3 cột desktop, 1 cột mobile):
  1. **Hải Phòng ⇄ Bắc Ninh ⇄ Bắc Giang**: Ghép 1 người: 400k – 500k · Ghép 2 người: từ 700k · Bao xe 5 chỗ: từ 900k · Bao xe 7 chỗ: từ 1.000k.
  2. **Hải Phòng ⇄ Hà Nội ⇄ Nội Bài**: Ghép 1 người: 400k · Ghép 2 người: 700k · Bao xe 5 chỗ: từ 899k · Bao xe 7 chỗ: từ 999k.
  3. **Hải Phòng ⇄ Hạ Long**: Bao xe 4 chỗ: 400k – 500k · Bao xe 7 chỗ: 500k – 600k · Ghép 1 khách: 250k – 300k.
  4. **Hải Phòng ⇄ Móng Cái**: Bao xe 4 chỗ: 1.500k – 1.600k · Bao xe 7 chỗ: 1.600k – 1.700k · Ghép 1 khách: 500k – 600k.
  5. **Hạ Long ⇄ Bắc Ninh ⇄ Bắc Giang**: Ghép 1 người: 450k – 550k · Ghép 2 người: từ 700k · Bao xe 5 chỗ: từ 900k · Bao xe 7 chỗ: từ 1.000k.
  6. **Hà Nội ⇄ Móng Cái**: Bao xe 4 chỗ: 2.200k – 2.400k · Bao xe 7 chỗ: 2.300k – 2.500k · Ghép 1 khách: 600k – 800k.
  7. **Hà Nội ⇄ Hạ Long**: Bao xe 4 chỗ: 1.100k – 1.200k · Bao xe 7 chỗ: 1.200k – 1.300k · Ghép 1 khách: 450k – 550k.
  8. **Hải Phòng ⇄ Hải Dương**: Ghép 1 khách: 250k · Ghép 2 khách: 400k · Bao xe riêng: 500k.
  9. **Hải Phòng ⇄ Thái Nguyên**: Ghép 1 người: 600k · Ghép 2 người: 900k · Bao xe riêng: 1.400k.
- Mỗi card có nút **ĐẶT XE NGAY**.

### Section 5 — Vì Sao Chọn Xe Ghép Liên Tỉnh (`WhyChooseUs`)

Khung nền vàng nhạt, viền vàng, tiêu đề: **Vì Sao Chọn Xe Ghép Liên Tỉnh**:

- Chúng tôi cam kết 100% hoàn tiền nếu xe không đảm bảo chất lượng.
- Phục vụ đưa đón tận nhà, giảm chi phí đi lại cho khách hàng.
- Đội ngũ lái xe dày dạn kinh nghiệm, chuyên nghiệp nhiệt tình.
- Luôn cam kết với mức giá tốt nhất cho khách hàng.
- Miễn phí huỷ chuyến khi khách hàng thay đổi lộ trình.
- Chính sách hoàn lại tiền 100% đền 200% về chất lượng dịch vụ.
- **XE GHÉP – XE TIỆN CHUYẾN MÓNG CÁI – HẠ LONG – HẢI PHÒNG – BẮC NINH – BẮC GIANG – HÀ NỘI**.

### Section 6 — Giới Thiệu Ngắn (Teaser)

- **H2**: `GIỚI THIỆU VỀ XE GHÉP LIÊN TỈNH`
- **H3**: _Xe ghép liên tỉnh – Giải pháp di chuyển tiết kiệm, nhanh chóng_
- Nội dung: Giới thiệu ưu thế xe ghép đón trả tận nhà so với xe khách và thuê xe riêng.
- **H3**: _Ưu điểm nổi bật_ (chỉ ghép 1–3 khách/chuyến, xuất phát nhanh, giá rõ ràng, xe đời mới sạch sẽ, phục vụ 24/7).
- **H3**: _Các tuyến xe ghép liên tỉnh đang phục vụ_ (Móng Cái ⇄ Hạ Long ⇄ Hải Phòng ⇄ Hà Nội, Hà Nội ⇄ Bắc Ninh ⇄ Bắc Giang, Hải Phòng ⇄ Bắc Ninh ⇄ Bắc Giang).
- Dòng kết & Nút "Xem thêm giới thiệu" ➔ `/gioi-thieu`.

---

## 4. Trang Giới Thiệu (`/gioi-thieu`)

- Breadcrumb: `Trang chủ › Giới thiệu` + **H1**: `Giới thiệu về Xe Ghép Liên Tỉnh`.
- 1. Về chúng tôi (Mô hình xe ghép đón trả tận nhà, xe riêng đời mới).
- 2. Ưu điểm nổi bật (5 icon cards: 1–3 khách, xuất phát nhanh, giá rõ ràng, xe đời mới, đón trả tận nơi 24/7).
- 3. Phạm vi phục vụ (Danh sách tuyến link tới từng trang chi tiết).
- 4. Dịch vụ (Xe ghép, Bao xe riêng, Gửi hàng hoá hỏa tốc từ 150k).
- 5. Quy trình đặt xe 4 bước (Gọi/điền form ➔ Báo giá ➔ Đón tận nhà ➔ Thanh toán sau chuyến).
- 6. Cam kết (`WhyChooseUs`).
- 7. CTA Hotline `0962.298.293` + `BookingForm` rút gọn.

---

## 5. Các Tuyến Liên Tỉnh (`/tuyen-lien-tinh` & Chi Tiết)

### 5.1. Trang tổng hợp `/tuyen-lien-tinh`

- Breadcrumb + **H1**: `Các tuyến xe ghép liên tỉnh`.
- Bộ lọc nhanh (tab): `Tất cả` · `Hải Phòng` · `Hà Nội` · `Hạ Long` · `Móng Cái` · `Bắc Ninh – Bắc Giang`.
- Lưới 9 `RouteCard` + Khối ghi chú chung + CTA gọi hotline & form đặt xe.

### 5.2. Trang chi tiết tuyến `/tuyen-lien-tinh/[slug]`

- Breadcrumb + **H1**: `Xe ghép [Điểm A] ⇄ [Điểm B]`.
- Hero tuyến: Ảnh đại diện + 1 câu giá "từ …k" + nút "GỌI NGAY: 0962.298.293".
- `PriceTable`: Bảng giá chi tiết theo loại xe.
- Thông tin chuyến: Điểm đón trả, giờ chạy 24/7.
- `BookingForm`: Điền sẵn Điểm đón / Điểm đến theo tuyến.
- Giới thiệu tuyến (chuẩn SEO).
- FAQ câu hỏi thường gặp + Tuyến liên quan + CTA hotline.

---

## 6. Trang Tin Tức (`/tin-tuc` & `/tin-tuc/[slug]`)

- `/tin-tuc`: Breadcrumb + **H1**: `Tin tức` + Chuyên mục tab + Bài nổi bật + Lưới bài viết + Sidebar tuyến nổi bật & hotline.
- `/tin-tuc/[slug]`: Chi tiết bài viết chuẩn SEO, ảnh đại diện, CTA giữa bài và cuối bài, 3 bài viết liên quan.

---

## 7. Trang Liên Hệ & Chính Sách

- `/lien-he`: Breadcrumb + **H1**: `Liên hệ` + Hotline, email, fanpage + Form liên hệ + Form đặt xe + Kênh gọi nhanh / Zalo.
- `/chinh-sach/thanh-toan`: Chính sách thanh toán sau chuyến đi / chuyển khoản.
- `/chinh-sach/dam-bao`: Chính sách đảm bảo chất lượng xe và hoàn tiền.
- `/chinh-sach/bao-mat`: Chính sách bảo mật thông tin hành khách.
