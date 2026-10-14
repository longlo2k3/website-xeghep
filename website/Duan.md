# Danh sách trang và nội dung cần thể hiện

Website dịch vụ xe ghép (tham chiếu xeghephanoi.vn)

Danh sách được lấy từ trang chủ và menu/link của site. Nội dung chi tiết của các trang con là suy ra theo cấu trúc, chưa mở từng trang.

## Sơ đồ trang

| #   | Trang                            | URL gốc                                                                                                                                                                              |
| --- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Trang chủ                        | `/`                                                                                                                                                                                  |
| 2   | Đặt xe                           | `/dat-xe/`                                                                                                                                                                           |
| 3   | Dịch vụ xe ghép (tổng hợp tuyến) | `/dich-vu-xe-ghep/`                                                                                                                                                                  |
| 4   | Trang tuyến (nhiều trang)        | `/xe-ghep-noi-bai/`, `/xe-ghep-ninh-binh/`, `/xe-ghep-quang-ninh/`, `/xe-ghep-thai-binh/`, `/xe-ghep-hai-phong/`, `/xe-ghep-hung-yen/`, `/xe-ghep-phu-tho/`, `/xe-ghep-bac-ninh/`... |
| 5   | Taxi đưa đón sân bay Nội Bài     | `/taxi-dua-don-san-bay-noi-bai/`                                                                                                                                                     |
| 6   | Taxi đường dài                   | `/taxi-duong-dai/`                                                                                                                                                                   |
| 7   | Bảng giá (danh mục)              | `/category/bang-gia/`                                                                                                                                                                |
| 8   | Đối tác / đăng ký đối tác        | `/dang-ky-doi-tac/`                                                                                                                                                                  |
| 9   | Tin tức (danh mục + bài viết)    | `/category/tin-tuc/`                                                                                                                                                                 |
| 10  | Giới thiệu                       | `/gioi-thieu/`                                                                                                                                                                       |
| 11  | Liên hệ                          | `/lien-he/`                                                                                                                                                                          |

Thành phần dùng chung ở mọi trang: header, footer, nút nổi gọi/SMS/Zalo/Messenger và nút "Đặt xe".

## Thành phần dùng chung

### Header

- Logo, hotline/Zalo (0858.911.247), nút "Đặt xe ngay"
- Menu: Trang chủ, Dịch vụ xe ghép, Dịch vụ khác (Taxi sân bay Nội Bài, Taxi đường dài), Bảng giá, Đối tác, Tin tức, Liên hệ

### Footer

- Thông tin công ty: tên, địa chỉ, hotline
- Cột "Hỗ trợ khách hàng": Giới thiệu, Dịch vụ xe ghép giá rẻ, Taxi sân bay, Taxi đường dài
- Link mạng xã hội, bản quyền

### Nút nổi

- Gọi điện, Tư vấn Zalo, SMS, Messenger, nút "Đặt xe"

## 1. Trang chủ

- **Banner/slider**: ảnh xe điện VinFast, quảng bá dịch vụ xe ghép và sân bay
- **Form đặt xe nhanh** gồm 3 tab:
  - _Xe ghép_: điểm đi, điểm đến, loại hình (Ghép xe / Bao xe / Gửi đồ), giá chuyến đi, nút "Xem trên bản đồ", "Đặt xe ngay"
  - _Sân bay_: điểm đón/đến (Nội Bài ⇄ các quận Hà Nội), loại xe 5/7/16 chỗ, 1 chiều/2 chiều, giá. Ghi chú: giá đã gồm vé cổng sân bay, phí cầu đường, chưa gồm VAT
  - _Đường dài_: tương tự, ghi chú giá chưa gồm phà/cao tốc, quy định xe 2 chiều (trên 30km, về trong ngày, chờ 60.000đ/giờ, tối đa 3 giờ)
- **5 cam kết vàng**: 100% xe điện VinFast (dưới 7 chỗ), giá trọn gói không phát sinh, đón trả tận nơi, xe mới sạch, lái xe chuyên nghiệp
- **Dịch vụ của chúng tôi** (4 khối): Xe ghép sân bay Nội Bài, Xe ghép/bao xe trọn gói, Dịch vụ xe đường dài, Đối tác chuyên nghiệp
- **Các tuyến nổi bật** (card, có giá "chỉ từ"): Nội Bài ⇄ các tỉnh (110.000đ), Hà Nội ⇄ Ninh Bình (300.000đ), Quảng Ninh (250.000đ), Thái Bình (300.000đ), Hải Phòng (450.000đ), Hưng Yên (150.000đ), Phú Thọ (250.000đ), Bắc Ninh (170.000đ), kèm link "Xem tất cả các tuyến"
- **Vì sao chọn chúng tôi**: đặt xe nhanh (VFe34, VF8, VF5, VF9), giá tốt nhất, đúng giờ tận tâm (tối đa 2 điểm đón/trả), thanh toán linh hoạt (tiền mặt, chuyển khoản, VND/USD)
- **Đối tác và doanh nghiệp**: lời kêu gọi hợp tác, nút "Đăng ký đối tác ngay"
- **Khách hàng nói gì**: 6 đánh giá (tên, địa phương, nội dung, avatar)
- **Nội dung SEO** (bài giới thiệu dài về dịch vụ xe ghép Hà Nội)

## 2. Đặt xe

- Form đầy đủ: họ tên, SĐT, loại dịch vụ, điểm đón (kèm địa chỉ chi tiết), điểm đến, loại xe, 1 chiều/2 chiều, ngày giờ đi, số người, ghi chú
- Hiển thị giá ước tính theo tuyến và loại xe
- Điều khoản ngắn: "vé xe được xác nhận lại qua Zalo hoặc điện thoại", tuyến khác gọi hotline
- Trang cảm ơn sau khi gửi, kèm mã đơn

## 3. Dịch vụ xe ghép

- Giới thiệu dịch vụ (xe ghép, bao hàng ghế, bao xe trọn gói)
- **Danh sách toàn bộ tuyến**: tên tuyến, giá "chỉ từ", ảnh, link sang trang tuyến
- Ưu điểm so với xe khách/taxi thường
- Nút đặt xe và hotline

## 4. Trang tuyến (ví dụ Hà Nội ⇄ Ninh Bình)

- Tiêu đề H1 theo từ khoá tuyến, ảnh xe VinFast
- Mô tả tuyến: quãng đường, thời gian di chuyển, điểm đón/trả
- **Bảng giá** theo loại xe, loại dịch vụ, 1 chiều/2 chiều
- Form đặt xe nhanh (đã chọn sẵn tuyến)
- Quyền lợi/cam kết dịch vụ
- Quy trình đặt xe (3–4 bước)
- FAQ (hỏi đáp thường gặp)
- Tuyến liên quan, đánh giá khách hàng

## 5. Taxi đưa đón sân bay Nội Bài

- Giới thiệu dịch vụ đón/tiễn sân bay 24/7
- Bảng giá Nội Bài ⇄ từng quận Hà Nội (5/7/16 chỗ, 1 chiều/2 chiều)
- Giá đã bao gồm: vé cổng sân bay, phí cầu đường
- Quy trình đón (theo dõi chuyến bay, tài xế đón tại sảnh), thời gian chờ
- Form đặt xe sân bay, FAQ

## 6. Taxi đường dài

- Giới thiệu dịch vụ taxi đường dài, các tỉnh phục vụ
- Bảng giá theo km/tuyến, loại xe
- Quy định: phí phà/cao tốc, xe 2 chiều (chờ 60.000đ/giờ, tối đa 3 giờ, qua ngày gọi hotline)
- Form đặt xe, FAQ

## 7. Bảng giá

- Danh sách bài/bảng giá theo từng dịch vụ hoặc tuyến (xe ghép, sân bay, đường dài)
- Bảng giá dễ so sánh: tuyến, loại xe, 1 chiều/2 chiều
- Ngày cập nhật giá, ghi chú phụ phí, VAT

## 8. Đối tác

- Lời giới thiệu chương trình hợp tác (tài xế, doanh nghiệp vận tải)
- Quyền lợi đối tác (tăng thu nhập, nguồn khách)
- Điều kiện tham gia (loại xe, giấy tờ)
- **Form đăng ký**: họ tên, SĐT, loại xe, biển số, khu vực chạy, ghi chú

## 9. Tin tức

- **Danh sách bài**: ảnh, tiêu đề, mô tả ngắn, ngày đăng, phân trang
- **Chi tiết bài**: nội dung, mục lục, ảnh, bài liên quan, nút đặt xe cuối bài
- Danh mục/thẻ để lọc (kinh nghiệm đi xe, tin tuyến, khuyến mãi)

## 10. Giới thiệu

- Giới thiệu công ty (Công ty Cổ phần Đầu tư Lubi Việt Nam)
- Sứ mệnh, đội xe VinFast, đội ngũ lái xe
- Cam kết dịch vụ, năng lực, số liệu nổi bật (nếu có)

## 11. Liên hệ

- Hotline/Zalo, địa chỉ công ty (Tầng 2, Chung cư Xuân Mai Tower, Tô Hiệu, Hà Đông, Hà Nội)
- Form liên hệ (họ tên, SĐT, nội dung)
- Bản đồ Google Maps, giờ làm việc 24/7
