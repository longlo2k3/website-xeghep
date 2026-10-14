# Product Specification — Xe Ghép Lubi (xeghephanoi.vn)

> **Feature Name**: Nền tảng Website Dịch Vụ Xe Ghép & Taxi Sân Bay Nội Bài Chuẩn SEO  
> **Status**: Ready for G1 Review  
> **Version**: 1.0.0  
> **Perspective**: Pure Product Perspective (What & Why) — No implementation details

---

## 1. Executive Summary & Vision

Dịch vụ Xe Ghép Lubi (Công ty Cổ phần Đầu tư Lubi Việt Nam) cung cấp giải pháp di chuyển thông minh, tiết kiệm và thân thiện với môi trường bằng **100% đội xe điện VinFast** (VF5, VFe34, VF8, VF9) cùng các dòng xe 7-16 chỗ chuyên nghiệp. Nền tảng website đóng vai trò là kênh tiếp thị số chủ lực, tối ưu trải nghiệm khách hàng từ khâu tìm kiếm tuyến đường trên Google đến chuyển đổi đặt xe tức thì qua giao diện trực quan và các kênh liên hệ tức thời (Hotline, Zalo, Messenger).

---

## 2. Target Audience & Personas

- **Persona A - Người đi làm / Thăm gia đình liên tỉnh (Ninh Bình, Quảng Ninh, Hải Phòng, Phú Thọ...)**: Cần xe đón trả tận nhà với chi phí chỉ bằng 1/3 giá bao xe, muốn biết rõ giá trước khi đặt, mong muốn xe sạch sẽ, văn minh và đúng giờ.
- **Persona B - Hành khách đi sân bay Nội Bài**: Cần độ tin cậy tuyệt đối về thời gian đón/tiễn máy bay 24/7, giá trọn gói đã bao gồm vé cổng sân bay và phí cầu đường, không lo phụ phí phát sinh.
- **Persona C - Khách hàng bao xe công tác / Gia đình du lịch**: Cần dịch vụ xe riêng riêng tư, lịch trình linh hoạt, xe điện êm ái, hiện đại.
- **Persona D - Tài xế & Đối tác nhà xe**: Muốn hợp tác cùng Lubi để tối ưu tỷ lệ kín chỗ chuyến đi hai chiều, gia tăng thu nhập hàng tháng.

---

## 3. Product User Stories & Acceptance Criteria

### US-01: Trang Chủ & Form Đặt Xe Nhanh 3 Tab
**As a** khách hàng truy cập website,  
**I want to** nhanh chóng tra cứu giá và gửi yêu cầu đặt xe theo loại dịch vụ (Xe ghép, Sân bay, Đường dài),  
**So that** tôi biết ngay chi phí ước tính và được nhân viên liên hệ xác nhận trong 5 phút.

- **Scenario 1.1: Tra cứu và đặt xe ghép liên tỉnh**
  - **Given** người dùng đang ở tab "Xe ghép" trên trang chủ
  - **When** người dùng chọn điểm đi (ví dụ Hà Nội), điểm đến (Ninh Bình), và hình thức (Ghép ghế / Bao xe / Gửi đồ)
  - **Then** hệ thống hiển thị ngay mức giá ước tính "chỉ từ" tương ứng
  - **And** người dùng bấm "Đặt xe ngay" để chuyển sang bước nhập SĐT nhận xe hoặc liên hệ hotline.

- **Scenario 1.2: Tra cứu đặt xe sân bay Nội Bài**
  - **Given** người dùng chọn tab "Sân bay Nội Bài"
  - **When** người dùng chọn quận đón tại Hà Nội và chiều di chuyển (Nội Bài ➔ Hà Nội hoặc Hà Nội ➔ Nội Bài)
  - **Then** hệ thống hiển thị giá trọn gói đã gồm vé cổng sân bay và phí cầu đường.

- **Scenario 1.3: Xem 5 cam kết vàng & Các tuyến nổi bật**
  - **Given** người dùng cuộn xem nội dung trang chủ
  - **When** xem danh sách các tuyến nổi bật (Hà Nội - Ninh Bình, Quảng Ninh, Hải Phòng, Thái Bình...)
  - **Then** mỗi thẻ tuyến hiển thị ảnh xe VinFast, cự ly, giá từ, và nút bấm dẫn đến trang chi tiết của tuyến đó.

---

### US-02: Quy Trình Đặt Xe Toàn Diện & Trang Cảm Ơn
**As a** khách hàng có nhu cầu đi xe cụ thể,  
**I want to** điền form đặt xe với đầy đủ thông tin (họ tên, SĐT, ngày giờ đi, điểm đón chi tiết, số người),  
**So that** đơn đặt chỗ của tôi được ghi nhận chính xác và có mã tra cứu.

- **Scenario 2.1: Gửi form đặt xe thành công**
  - **Given** người dùng ở trang `/dat-xe`
  - **When** người dùng điền họ tên, số điện thoại hợp lệ (10 chữ số), chọn tuyến xe, ngày giờ đón và bấm "Xác nhận đặt xe"
  - **Then** hệ thống chuyển hướng đến trang cảm ơn hiển thị Mã đặt xe (Booking ID), tóm tắt thông tin chuyến đi, hướng dẫn "Tổng đài sẽ gọi hoặc nhắn Zalo xác nhận trong 5 phút".

- **Scenario 2.2: Ràng buộc dữ liệu biểu mẫu**
  - **Given** người dùng chưa nhập số điện thoại hoặc nhập số điện thoại không hợp lệ
  - **When** bấm nút "Xác nhận đặt xe"
  - **Then** hệ thống hiển thị thông báo lỗi rõ ràng bên dưới trường số điện thoại và giữ nguyên các thông tin đã nhập.

---

### US-03: Trang Tuyến Chi Tiết (Ví dụ: Hà Nội ⇄ Ninh Bình)
**As a** người dùng tìm kiếm từ khóa "xe ghép Hà Nội Ninh Bình" trên Google,  
**I want to** tiếp cận trang thông tin chi tiết về tuyến đường này,  
**So that** tôi nắm rõ bảng giá các loại xe, lộ trình đón trả, thời gian di chuyển và đặt xe ngay trên trang.

- **Scenario 3.1: Tiếp cận thông tin chuyên sâu theo tuyến**
  - **Given** người dùng truy cập trang `/xe-ghep-ninh-binh`
  - **Then** trang hiển thị tiêu đề rõ ràng, cự ly (~95km), thời gian di chuyển (~1h30), bảng so sánh giá ghép ghế vs bao xe (VF5/VF8), các điểm đón trả cố định.

- **Scenario 3.2: Đặt xe trực tiếp với tuyến đường mặc định**
  - **Given** người dùng đang ở trang tuyến Ninh Bình
  - **When** tương tác với form đặt xe nhanh trên trang
  - **Then** trường tuyến đường đã được chọn sẵn là "Hà Nội ⇄ Ninh Bình".

- **Scenario 3.3: Giải đáp thắc mắc và tuyến lân cận**
  - **Given** người dùng ở cuối trang tuyến
  - **Then** hiển thị phần câu hỏi thường gặp (FAQ) của tuyến và danh sách các tuyến liên quan (Hà Nam, Nam Định, Thái Bình) để tiếp tục điều hướng.

---

### US-04: Taxi Đón Tiễn Sân Bay Nội Bài & Taxi Đường Dài
**As a** hành khách di chuyển sân bay hoặc đi công tác đường dài,  
**I want to** tra cứu bảng giá theo quận huyện nội thành và theo cự ly kilomet,  
**So that** tôi dự trù được chi phí rõ ràng và hiểu rõ các quy định đi kèm.

- **Scenario 4.1: Tra cứu giá đón tiễn Nội Bài theo quận**
  - **Given** người dùng ở trang `/taxi-dua-don-san-bay-noi-bai`
  - **Then** hiển thị bảng giá chi tiết từ sân bay Nội Bài về từng quận (Hoàn Kiếm, Cầu Giấy, Hà Đông...) theo dòng xe 5 chỗ, 7 chỗ, 16 chỗ và 1 chiều/2 chiều.
  - **And** làm rõ cam kết: giá đã bao gồm vé vào cổng sân bay, tài xế theo dõi giờ hạ cánh để đón đúng giờ.

- **Scenario 4.2: Tra cứu chính sách taxi đường dài**
  - **Given** người dùng ở trang `/taxi-duong-dai`
  - **Then** hiển thị mức giá theo km và quy định chuyến 2 chiều (miễn phí hoặc phụ thu thời gian chờ 60.000đ/giờ tối đa 3 giờ).

---

### US-05: Bảng Giá Minh Bạch & Đối Tác Hợp Tác
**As a** khách hàng hoặc đối tác tài xế,  
**I want to** xem bảng giá niêm yết tổng hợp hoặc đăng ký tham gia mạng lưới tài xế Lubi,  
**So that** tôi tin tưởng vào tính minh bạch của dịch vụ hoặc tăng thêm thu nhập.

- **Scenario 5.1: Xem bảng giá tổng hợp**
  - **Given** người dùng vào trang `/bang-gia`
  - **Then** hiển thị đầy đủ bảng giá tất cả các dịch vụ (Xe ghép, Taxi Nội Bài, Đường dài), có ngày cập nhật bảng giá và ghi chú hóa đơn VAT.

- **Scenario 5.2: Đăng ký đối tác tài xế**
  - **Given** tài xế vào trang `/dang-ky-doi-tac`
  - **When** điền họ tên, số điện thoại, loại xe đang sở hữu, biển số và khu vực hoạt động
  - **Then** hệ thống thông báo gửi hồ sơ thành công và hẹn lịch liên hệ phỏng vấn/xác minh phương tiện.

---

### US-06: Tin Tức / Cẩm Nang Tuyến & Giới Thiệu / Liên Hệ
**As a** người dùng tìm hiểu kinh nghiệm đi xe hoặc thông tin doanh nghiệp,  
**I want to** đọc các bài viết cẩm nang, thông tin pháp lý của Lubi và bản đồ chỉ đường,  
**So that** tôi yên tâm về uy tín thương hiệu và dễ dàng liên hệ hỗ trợ.

- **Scenario 6.1: Đọc bài viết cẩm nang**
  - **Given** người dùng ở trang `/tin-tuc/[slug]`
  - **Then** bài viết hiển thị tiêu đề, ngày đăng, tác giả, mục lục bài viết, nội dung chất lượng cao và nút "Đặt xe tuyến này" ở cuối bài.

- **Scenario 6.2: Xem thông tin liên hệ và gọi điện nhanh**
  - **Given** người dùng ở bất kỳ trang nào trên website
  - **Then** luôn nhìn thấy thanh công cụ nổi (Hotline 0858.911.247, Zalo, SMS, Messenger, Đặt xe) sẵn sàng liên hệ chỉ với 1 chạm trên di động.

---

## 4. Non-Functional & SEO Requirements (What & Why)

1. **Khả năng lập chỉ mục & xếp hạng (Indexability & Discoverability)**:
   - Toàn bộ nội dung cốt lõi của tất cả các trang phải có sẵn ngay trong mã nguồn HTML được máy chủ trả về, giúp bot tìm kiếm (Google, Bing) đọc hiểu 100% nội dung mà không cần chờ chạy JavaScript.
   - Mỗi trang có một địa chỉ định danh chính thức (Canonical URL) duy nhất, loại bỏ trùng lặp nội dung.
   - Thẻ tiêu đề và thẻ mô tả độc nhất cho từng trang, tập trung từ khóa ý định tìm kiếm của người dùng ở đầu.

2. **Dữ liệu có cấu trúc trung thực (Schema.org Truthfulness)**:
   - Trang chủ và các trang dịch vụ chứa thông tin thực thể doanh nghiệp vận tải (TaxiService / LocalBusiness / Organization), tuyến đường và mức giá khớp hoàn toàn với nội dung người dùng nhìn thấy trên màn hình. Tuyệt đối không khai khống đánh giá hay giá ảo.

3. **Tốc độ & Trải nghiệm tương tác (Core Web Vitals)**:
   - Tải trang mượt mà ngay trên kết nối 4G di động: nội dung quan trọng nhất hiển thị trong dưới 2.5 giây, trang không bị giật nhảy layout khi ảnh tải xong, phản hồi thao tác chạm bấm nhanh chóng.

4. **Khả năng tiếp cận (Accessibility - WCAG 2.1 AA)**:
   - Màu sắc chữ đạt độ tương phản chuẩn dễ đọc, cỡ chữ thân thiện trên điện thoại, nút bấm có kích thước tối thiểu 44×44px tránh bấm nhầm.

---

## 5. Scope Boundaries

- **In Scope**:
  - Toàn bộ 11 nhóm trang theo `Duan.md`: Trang chủ, Đặt xe + Cảm ơn, Dịch vụ xe ghép tổng hợp, Các trang chi tiết tuyến (Ninh Bình, Nội Bài, Quảng Ninh, Hải Phòng, Thái Bình, Hưng Yên, Phú Thọ, Bắc Ninh...), Taxi Nội Bài, Taxi đường dài, Bảng giá, Đối tác, Tin tức & bài viết chi tiết, Giới thiệu, Liên hệ.
  - Header, Footer, Thanh nút liên hệ nổi đa kênh (Hotline, Zalo, SMS, Messenger, Nút Đặt xe).
  - Tự động tạo `sitemap.xml` và `robots.txt` chuẩn SEO.
  - Bộ Schema.org JSON-LD (@graph) đầy đủ cho doanh nghiệp, dịch vụ và bài viết.
  - 100% tiếng Việt tự nhiên, dữ liệu tuyến đường thực tế, cam kết dịch vụ thật.
- **Out of Scope (Giai đoạn này)**:
  - Cổng thanh toán trực tuyến thẻ tín dụng tự động (khách hàng chọn thanh toán tiền mặt cho tài xế hoặc chuyển khoản ngân hàng qua mã QR xác nhận).
  - Hệ thống định vị GPS tài xế theo thời gian thực (được điều hành thủ công qua tổng đài Zalo Lubi).
