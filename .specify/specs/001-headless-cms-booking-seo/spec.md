# Feature Specification: Headless CMS, Booking Engine & SEO Management Platform

**Feature Branch**: `001-headless-cms-booking-seo`

**Created**: 2026-10-09

**Status**: Draft

**Input**: User description: "Tạo dự án backend + frontend dựa trên CMS_BACKEND_SEO_SPECIFICATION_v1.1.md cho nền tảng điều hành & đặt xe ghép liên tỉnh xegheplientinh.vn"

**Nguồn yêu cầu**: tài liệu đặc tả v1.1.0 (10 collections + 2 globals, Pricing Engine, Booking API, chiến lược SEO) + các quyết định của người dùng ngày 2026-10-09 (xem Assumptions).

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Khách nhận báo giá tức thì và đặt xe thành công (Priority: P1)

Khách vào website, chọn tuyến (hoặc tự nhập điểm đón/trả), chọn hình thức đi ghép/bao xe, số khách, loại xe, giờ đón; hệ thống hiện giá **ngay lập tức** (debounce) theo đúng bảng giá. Khách điền tên + SĐT + ghi chú, bấm đặt xe → nhận mã vé, xem lại đơn ở trang thành công.

**Why this priority**: Đây là đường doanh thu duy nhất của sản phẩm; mọi giá trị khác (SEO, CMS) đều phục vụ việc khách tìm thấy và đặt được xe.

**Independent Test**: Gọi API báo giá với các đầu vào khác nhau (đúng bộ golden cases) và gửi đơn đặt xe hợp lệ → trả về mã vé + giá đúng; không cần dữ liệu CMS nào khác ngoài tuyến/giá đã seed.

**Acceptance Scenarios**:

1. **Given** tuyến "Hải Phòng ⇄ Hà Nội ⇄ Nội Bài" đang active, **When** báo giá cho đi ghép 1 khách xe 4 chỗ, **Then** `priceType = fixed`, giá `400.000đ`.
2. **Given** cùng tuyến, **When** đổi sang 3 khách đi ghép, **Then** hệ thống khuyên bao xe và trả giá bao xe 4/5 chỗ (`từ 899.000đ`), kèm khuyến nghị trên giao diện.
3. **Given** tuyến không có giá bao xe 7 chỗ (Hải Dương), **When** báo giá bao xe 7 chỗ, **Then** `priceType = negotiable`, hiển thị "Liên hệ thỏa thuận", đơn vẫn đặt được.
4. **Given** không khớp tuyến nào và không có số km, **When** báo giá, **Then** `quote_required` kèm khung đơn giá/km (`Chỉ từ 8.000đ – 11.000đ / km`).
5. **Given** khách gửi dịch vụ gửi hàng, **When** báo giá, **Then** giá "từ 150.000đ" lấy từ cấu hình, không phụ thuộc tuyến.
6. **Given** form hợp lệ, **When** bấm đặt xe, **Then** đơn được lưu trạng thái `pending`, trả mã vé `XG-YYMMDD-XXXXXX`, và điều hướng sang trang thành công kèm mã + token tra cứu.
7. **Given** SĐT "0962.298.293" hoặc "+84962298293", **When** gửi đặt xe, **Then** được normalize về `0962298293` và hợp lệ.
8. **Given** giờ đón nhỏ hơn hiện tại + 15 phút, **When** gửi đặt xe, **Then** bị từ chối với lỗi `PICKUP_TIME_TOO_SOON`.
9. **Given** người dùng điền trường honeypot `website`, **When** gửi đặt xe, **Then** hệ thống trả về thành công giả mà **không** lưu đơn.
10. **Given** đơn đã tạo, **When** mở trang thành công với mã + token đúng, **Then** hiển thị thông tin đơn (đã che 4 số SĐT cuối theo quy tắc) + nhãn trạng thái tiếng Việt.
11. **Given** không có token hoặc sai token, **When** tra cứu mã đơn, **Then** trả `404` với thông báo chung (không phân biệt sai mã/sai token).
12. **Given** gửi cùng một `Idempotency-Key` trong 10 phút, **When** gửi lại, **Then** trả về đúng đơn cũ, không tạo trùng.

---

### User Story 2 — Marketer tự quản lý SEO mọi trang, không cần developer (Priority: P1)

Marketer sửa tiêu đề/mô tả SEO, ảnh chia sẻ Zalo/Facebook, bật/tắt noindex cho từng tuyến, bài viết, trang hệ thống và trang chính sách. Hệ thống tự sinh canonical, schema, sitemap, robots theo chuẩn và tự loại trang noindex khỏi sitemap.

**Why this priority**: Mục tiêu sống còn của dự án là "chuyển CMS không được làm mất thứ hạng"; marketer tự thao tác được thì mới hết phụ thuộc dev.

**Independent Test**: Bật `noindex` cho một tuyến thử → trang trả meta robots noindex **và** tuyến biến mất khỏi sitemap; tắt lại → hiện lại.

**Acceptance Scenarios**:

1. **Given** một tuyến có `metaTitle` 54 ký tự và `appendBrand` bật, **When** xem trang, **Then** title hiển thị = `metaTitle + " | Xe Ghép Liên Tỉnh"` và tổng ≤ 70 ký tự.
2. **Given** `appendBrand` tắt, **When** xem trang, **Then** title hiển thị đúng `metaTitle` không hậu tố.
3. **Given** trang không có `metaDescription`, **When** xem trang, **Then** dùng mô tả mặc định của nội dung (cắt ≤ 155 ký tự, không cắt giữa từ).
4. **Given** trang không có ảnh chia sẻ riêng, **When** xem thẻ OG, **Then** dùng ảnh mặc định của công ty (URL tuyệt đối, 1200×630).
5. **Given** trang tuyến, **When** xem thẻ canonical, **Then** canonical tự sinh từ URL hiện tại, admin không thể sửa.
6. **Given** bật `noindex` cho một trang, **When** tải sitemap, **Then** trang đó không có trong sitemap; khi tắt thì có.
7. **Given** dữ liệu công ty và tuyến, **When** xem mã schema, **Then** Organization/TaxiService/WebSite/Service+Offer/Article/BreadcrumbList được sinh từ dữ liệu thật; `priceValidUntil` đọc từ cấu hình, không phải ngày cố định.
8. **Given** ngày hiệu lực giá còn dưới 30 ngày hoặc đã hết, **When** mở trang quản trị, **Then** xuất hiện cảnh báo đỏ nhắc Marketer cập nhật.
9. **Given** website, **When** tải `robots.txt`, **Then** có `Disallow` cho trang thành công, khu quản trị, đường dẫn API và dòng Sitemap.
10. **Given** danh sách URL đủ điều kiện, **When** tải sitemap, **Then** đủ 6 trang hệ thống + 3 trang chính sách đang publish + tuyến active + bài đã đăng, có `lastmod` đúng thời gian cập nhật; không có URL redirect hay trang noindex.

---

### User Story 3 — Marketer quản lý tuyến đường và bảng giá dạng số (Priority: P1)

Marketer nhập giá cho từng tuyến theo **4 mức giá** (ghép 1, ghép 2, bao xe 4–5 chỗ, bao xe 7 chỗ) ở dạng số; mọi text giá hiển thị ("400k", "từ 899k", "400k – 500k", "Liên hệ thỏa thuận") được sinh tự động. Marketer kéo–thả thứ tự, chọn tuyến hiển thị ở banner, nhập điểm đón/trả, câu hỏi thường gặp, ảnh slide, vùng hoạt động.

**Why this priority**: Bảng giá hardcode trong code là vấn đề gốc khiến mọi lần đổi giá phải deploy lại — lý do tồn tại của dự án.

**Independent Test**: Seed 9 tuyến hiện có → mỗi tuyến đủ 4 mức giá dạng số, `priceFrom` tự tính bằng mức thấp nhất không thương lượng; sửa một giá → text hiển thị đổi theo mà không cần sửa chỗ nào khác.

**Acceptance Scenarios**:

1. **Given** Marketer nhập giá ghép 1 = 400000, **When** xem trang tuyến và danh sách, **Then** hiển thị "400.000đ" (hoặc "400k" theo vị trí) và giá tham chiếu = 400000.
2. **Given** mức giá thương lượng, **When** xem bảng giá, **Then** hiển thị "Liên hệ thỏa thuận" và không chặn khách đặt xe.
3. **Given** mức giá nhập max < min, **When** lưu tuyến, **Then** bị từ chối với lỗi_validation.
4. **Given** tuyến không có cả mức "ghép 1" lẫn "bao xe 4–5 chỗ", **When** lưu, **Then** bị từ chối.
5. **Given** tuyến có mức giá nhưng không có dòng bảng giá tương ứng, **When** xem bảng giá, **Then** dòng đó không hiển thị nhưng engine vẫn dùng để tính.
6. **Given** Marketer đổi slug một tuyến đã hiển thị, **When** lưu, **Then** hệ thống hỏi xác nhận và tự tạo chuyển hướng 301 từ slug cũ sang slug mới.
7. **Given** tuyến chuyển sang "không hiển thị", **When** khách truy cập trang tuyến, **Then** trả về 404 thật và tuyến rời khỏi sitemap.

---

### User Story 4 — Điều hành nhận thông báo tức thì và xử lý vòng đời đơn (Priority: P2)

Khi có đơn mới, tổng đài nhận tin nhắn Telegram trong vài giây (kèm mã vé, khách, tuyến, giá, ghi chú). Dispatcher xem danh sách đơn, xác nhận, gán tài xế, ghi trạng thái; mọi chuyển trạng thái sai bị hệ thống từ chối.

**Why this priority**: Không có luồng này đơn vẫn tạo được nhưng vận hành thủ công; mức P2 vì API đặt xe độc lập đã chạy được.

**Independent Test**: Tắt/treo kênh thông báo vẫn tạo được đơn; gửi chuyển trạng thái không hợp lệ → `409`; `assigned` thiếu tài xế → bị từ chối.

**Acceptance Scenarios**:

1. **Given** đơn mới được tạo, **When** hệ thống xử lý nền, **Then** thông báo Telegram đến trong ≤ 5 giây với đúng mẫu (mã, tên, SĐT, tuyến, điểm đón/trả, giờ đón, hình thức, giá, ghi chú, link phân xe).
2. **Given** kênh thông báo lỗi, **When** hệ thống retry 3 lần (5s/30s/2 phút) vẫn lỗi, **Then** gửi email dự phòng và đánh dấu đơn "chưa thông báo" trên bảng điều khiển.
3. **Given** thông báo có dữ liệu do khách nhập, **When** gửi, **Then** mọi ký tự đặc biệt được escape (khách không chèn được định dạng/liên kết).
4. **Given** đơn có giá thương lượng hoặc cần báo giá, **When** hiển thị trong thông báo, **Then** dòng giá ghi "CẦN BÁO GIÁ".
5. **Given** dispatcher chuyển `pending → confirmed`, **When** thực hiện, **Then** thành công và ghi lịch sử trạng thái (ai, khi nào, ghi chú).
6. **Given** dispatcher cố chuyển `pending → assigned`, **When** thực hiện, **Then** trả `409 INVALID_TRANSITION`.
7. **Given** trạng thái `assigned` nhưng chưa chọn tài xế đang hoạt động, **When** lưu, **Then** bị từ chối.
8. **Given** trạng thái `completed` thiếu giá cuối hoặc hình thức thanh toán, **When** lưu, **Then** bị từ chối.
9. **Given** trạng thái `cancelled` thiếu lý do, **When** lưu, **Then** bị từ chối.
10. **Given** vai trò biên tập viên, **When** xem danh sách đơn, **Then** không thấy số điện thoại khách; dispatcher thấy đầy đủ.

---

### User Story 5 — Biên tập viên quản lý tin tức và trang chính sách (Priority: P2)

Biên tập viên tạo bài viết (3 chuyên mục), nhập nội dung có headings; hệ thống tự làm sạch HTML, sinh mục lục, lưu thời gian đăng. Quản trị viên sửa SEO và nội dung 3 trang chính sách; 6 trang hệ thống chỉ sửa được phần SEO.

**Why this priority**: Nội dung phong phú hỗ trợ SEO, nhưng site chạy được với dữ liệu seed sẵn.

**Independent Test**: Tạo bài có 2 thẻ heading cấp 2 → mục lục sinh đúng 2 mục kèm neo link; lưu bài có thẻ cấm → bị loại bỏ.

**Acceptance Scenarios**:

1. **Given** bài viết có 2 heading cấp 2, **When** lưu bài, **Then** sinh mục lục `{ id, text }` với id duy nhất và các heading trong bài được gắn đúng id đó.
2. **Given** nội dung có link ra ngoài, **When** lưu bài, **Then** link được gắn `rel="noopener nofollow"`.
3. **Given** ảnh trong bài thiếu alt, **When** lưu, **Then** bị từ chối hoặc cảnh báo bắt buộc alt.
4. **Given** bài ở trạng thái nháp, **When** khách truy cập, **Then** 404; chuyển "đã đăng" thì hiện và vào sitemap.
5. **Given** bài đăng lần đầu, **When** lưu, **Then** tự ghi thời gian đăng; Marketer sửa được sau đó.
6. **Given** slug bài đổi khi đã đăng, **When** lưu, **Then** tự tạo chuyển hướng 301.
7. **Given** trang chính sách, **When** lưu nội dung, **Then** khách xem được nội dung đó; phần cam kết/phương thức thanh toán vẫn hiển thị từ cấu hình công ty.
8. **Given** 6 trang hệ thống, **When** thao tác ở khu quản trị, **Then** không thể tạo mới hay xóa; chỉ sửa SEO.

---

### User Story 6 — Chuyển hướng tự động, không mất ranking (Priority: P2)

Mọi đổi slug (tuyến, bài, trang) tự sinh chuyển hướng 301; 5 đường dẫn cũ của website được chuyển hướng sẵn; hệ thống chống vòng lặp/chuỗi chuyển hướng; nội dung gỡ vĩnh viễn trả `410`.

**Why this priority**: Bảo toàn xếp hạng SEO — quan trọng nhưng chỉ kích hoạt khi có thay đổi slug.

**Independent Test**: Đổi slug một tuyến đã publish → URL cũ trả 301 sang URL mới trong vòng 60 giây; cấu hình vòng lặp bị từ chối khi lưu.

**Acceptance Scenarios**:

1. **Given** tuyến đang hiển thị có slug A, **When** đổi sang B, **Then** tồn tại chuyển hướng A → B tự động, nguồn "tự động".
2. **Given** đã có chuyển hướng X → A, **When** A đổi thành B, **Then** X trỏ thẳng tới B (không chuỗi).
3. **Given** tồn tại chuyển hướng B → A (khôi phục slug cũ), **When** A đổi sang B, **Then** bản ghi B → A bị xóa để tránh vòng lặp.
4. **Given** Marketer tạo chuyển hướng mà toUrl dẫn quay lại từUrl trong ≤ 5 bước, **When** lưu, **Then** bị từ chối.
5. **Given** 5 đường dẫn cũ (dịch vụ, bảng giá, sân bay nội bài, đường dài, đối tác), **When** truy cập, **Then** trả 301 về trang đích mới.
6. **Given** nội dung bị gỡ vĩnh viễn, **When** truy cập, **Then** trả `410 Gone`.
7. **Given** hệ thống quản trị gặp sự cố không trả được danh sách chuyển hướng, **When** khách truy cập trang thường, **Then** website vẫn hoạt động bình thường (không chặn).

---

### User Story 7 — Quản trị cấu hình công ty và bảng giá phụ (Priority: P3)

Quản trị sửa thông tin công ty (tên, hotline, email, Zalo, fanpage, địa chỉ, logo, ảnh chia sẻ mặc định, phạm vi phục vụ, khoảng giá) và các chính sách giá (phí gửi hàng, thời gian chờ, phí cầu đường, lưu đêm, ngày lễ). Bảng giá sân bay theo 12 quận và bảng giá theo dải km được nhập số và kiểm tra chồng lấn.

**Why this priority**: Ảnh hưởng giao diện và schema nhưng không chặn luồng đặt xe chính.

**Independent Test**: Sửa hotline trong cấu hình → giá trị mới xuất hiện trong mọi phản hồi API cấu hình kèm liên kết gọi điện/Zalo/SMS tự sinh.

**Acceptance Scenarios**:

1. **Given** cấu hình công ty, **When** gọi API cấu hình, **Then** trả toàn bộ trường cộng trường phái sinh (liên kết gọi điện, Zalo, SMS, tên miền) và chỉ danh sách đánh giá đang hiển thị.
2. **Given** hotline `0962298293`, **When** sinh schema, **Then** số điện thoại dạng `+84962298293`.
3. **Given** chưa nhập khoảng giá, **When** sinh schema, **Then** tự tính từ giá thấp nhất tới giá bao xe cao nhất.
4. **Given** bảng giá theo km, **When** nhập hai dải chồng lấn hoặc có khoảng hở, **Then** bị từ chối.
5. **Given** bảng giá sân bay, **When** lưu giá khứ hồi lớn hơn tổng hai chiều, **Then** nhận cảnh báo (không chặn).
6. **Given** bảng giá theo km có số km, **When** báo giá, **Then** giá = số km × đơn giá dải tương ứng (đếm theo dải, không lũy tiến).
7. **Given** thiếu số km và không khớp tuyến/sân bay, **When** báo giá, **Then** trả `quote_required` kèm khung đơn giá/km.

---

### User Story 8 — Website luôn nhanh và cập nhật khi nội dung đổi (Priority: P3)

Khi Marketer sửa nội dung, các trang bị ảnh hưởng tự làm mới trong vài giây mà không cần deploy; website công khai trả lời nhanh (cache); trang tra cứu vé không bao giờ bị cache sai.

**Why this priority**: Chất lượng vận hành; ảnh hưởng trải nghiệm và Core Web Vitals nhưng không thay đổi chức năng.

**Independent Test**: Sửa giá một tuyến rồi bắn sự kiện làm mới → trang tuyến, trang chủ và danh sách tuyến phản ánh giá mới ≤ 5 giây; bắn sự kiện với secret sai → `401`.

**Acceptance Scenarios**:

1. **Given** secret đúng, **When** gửi yêu cầu làm mới cho một tuyến, **Then** tag dữ liệu liên quan (tuyến, sitemap, layout) được làm mới và trang chi tiết cũ + mới đều cập nhật.
2. **Given** secret sai, **When** gửi yêu cầu làm mới, **Then** trả `401` và không ghi log secret.
3. **Given** sửa hotline công ty, **When** truy cập bất kỳ trang nào, **Then** hotline mới hiển thị ở header, footer, banner nổi và schema.
4. **Given** thay đổi cấu hình giá, **When** gọi API cước, **Then** phản ánh thay đổi trong ≤ 60 giây.
5. **Given** trang tra cứu vé, **When** truy cập, **Then** dữ liệu luôn mới (không dùng cache).

---

### Edge Cases

- Tuyến `custom` hoặc không tồn tại trong `routeSlug` → rơi về khớp theo địa danh, rồi sân bay, rồi km, rồi `quote_required`.
- `routeSlug` trỏ tuyến ngừng hiển thị → không dùng tuyến đó; rơi về khớp địa danh (A20).
- Đi ghép 2 khách mà tuyến không có giá ghép 2 → tự nhân đôi giá ghép 1.
- Đi ghép ≥ 3 khách → tự tính theo giá bao xe 4/5 chỗ, khách vẫn đặt được.
- Bao xe 16 chỗ ở tuyến cố định → `quote_required` (tổng đài báo giá).
- Gửi hàng → giá độc lập tuyến, luôn "từ …".
- Không khớp tuyến + có "Nội Bài" + có quận + có chiều → bảng giá sân bay 12 quận.
- Không có số km và không khớp gì → `quote_required` kèm khung giá/km để hiển thị.
- Đơn bị từ chối (hết lượt kiểm tra/thôi miên honeypot) vẫn không được lộ thông tin hệ thống.
- Thông báo Telegram sập hoàn toàn → email dự phòng + dashboard đánh dấu chưa thông báo; đơn không mất.
- Sửa giá trong lúc có khách đang báo giá → giá chốt theo thời điểm tạo đơn (server tính lại).
- Ngày hiệu lực giá đã qua → website vẫn hiển thị giá (không 404/500), quản trị cảnh báo.
- Trang quản trị lỗi → website công khai vẫn chạy (không chặn vì cache).
- Đơn yêu cầu xóa dữ liệu cá nhân → ẩn danh thông tin sau khi xử lý.

## Requirements *(mandatory)*

### Functional Requirements

#### Nhóm A — Báo giá & Đặt xe (Pricing + Booking)

- **FR-A01**: Hệ thống MUST tính giá realtime theo 5 chế độ: tuyến cố định, sân bay, theo km, gửi hàng, và yêu cầu báo giá — chọn theo thứ tự: gửi hàng → khớp tuyến → sân bay → theo km → báo giá.
- **FR-A02**: Khớp tuyến MUST ưu tiên `routeSlug` hợp lệ đang hiển thị; nếu không, so khớp địa danh đã chuẩn hóa (bỏ dấu, chữ thường, bỏ nội dung ngoặc) với vùng của tuyến ở **cả hai chiều**; nhiều tuyến khớp → chọn khớp dài nhất, hòa thì thứ tự ưu tiên nhỏ hơn.
- **FR-A03**: Giá đi ghép: 1 khách = giá mỗi khách; 2 khách = giá tổng cho 2 (hoặc gấp đôi giá 1 nếu thiếu); ≥ 3 khách = giá bao xe 4/5 chỗ kèm khuyến nghị bao xe.
- **FR-A04**: Giá bao xe: 4/5 chỗ → mức bao 4–5 chỗ; 7 chỗ → mức bao 7 chỗ; 16 chỗ ở tuyến cố định → yêu cầu báo giá.
- **FR-A05**: Giá gồm khoảng (có min và max) MUST hiển thị dạng khoảng và lưu giá tham chiếu = min; giá thương lượng MUST cho phép đặt xe mà không có giá số.
- **FR-A06**: Giá theo km MUST tính nguyên quãng theo dải (không lũy tiến); cảnh báo chưa gồm phí cầu đường/phà theo cấu hình.
- **FR-A07**: Sân bay Nội Bài MUST áp dụng khi không khớp tuyến, một đầu chứa "nội bài", và có quận + chiều đi/về/khứ hồi; bảng giá 12 quận theo 3 cột xe.
- **FR-A08**: Gửi hàng MUST dùng giá sàn từ cấu hình, hiển thị "từ …", kèm thời gian giao dự kiến từ cấu hình.
- **FR-A09**: API báo giá MUST không lưu dữ liệu; mọi tính toán bằng số nguyên VND; text hiển thị sinh từ số qua hàm format dùng chung.
- **FR-A10**: API đặt xe MUST tự tính lại giá (bỏ qua mọi giá client gửi), sinh mã vé `XG-{YYMMDD}-{6 ký tự}` từ bảng ký tự bỏ 0/O/1/I/L, chống trùng (tối đa 5 lần), và trả `lookupToken` một lần.
- **FR-A11**: Đặt xe MUST hỗ trợ `Idempotency-Key` trong 10 phút, honeypot `website`, và rate limit 5 req/phút/IP + 20 đơn/ngày/SĐT.
- **FR-A12**: Thời gian đón MUST ≥ hiện tại + thời gian đặt trước tối thiểu (mặc định 15 phút) và ≤ 90 ngày; giờ không kèm múi giờ MUST hiểu theo múi giờ Việt Nam.
- **FR-A13**: Số khách đi ghép MUST 1–3; dịch vụ gửi hàng MUST bỏ qua hình thức và số khách.
- **FR-A14**: Tra cứu vé MUST yêu cầu token tra cứu hoặc 4 số SĐT cuối, trả 404 trùng nhất khi sai, rate limit 10 req/phút/IP, không cache.
- **FR-A15**: Trang thành công MUST hiển thị từ dữ liệu tra cứu API (không đọc query string tùy ý), có mã + trạng thái tiếng Việt + hình thức thanh toán tiếng Việt.

#### Nhóm B — Vòng đời đơn & Thông báo

- **FR-B01**: Máy trạng thái MUST chỉ cho phép các chuyển: chờ xác nhận → đã xác nhận → đã gán tài xế → đang chạy → hoàn tất; mọi trạng thái → đã hủy (kèm lý do); chuyển khác MUST trả `409`.
- **FR-B02**: Gán tài xế MUST yêu cầu tài xế đang hoạt động; hoàn tất MUST có giá cuối + hình thức thanh toán; hủy MUST có lý do trong bộ lý do.
- **FR-B03**: Mọi chuyển trạng thái MUST ghi lịch sử (từ, tới, người thực hiện, thời gian, ghi chú).
- **FR-B04**: Đơn mới MUST được lưu **trước**, thông báo **sau** (không bao giờ thất bại vì kênh thông báo lỗi); retry 3 lần (5s/30s/2 phút) rồi email dự phòng + đánh dấu chưa thông báo.
- **FR-B05**: Thông báo MUST escape dữ liệu khách nhập; mẫu MUST đủ: mã, tên, SĐT, tuyến, điểm đón, điểm đến, giờ đón, hình thức, giá (hoặc "CẦN BÁO GIÁ"), ghi chú, link phân xe.
- **FR-B06**: Giá trị đơn MUST được snapshot tại thời điểm đặt; đổi bảng giá sau không làm đổi đơn cũ.
- **FR-B07**: Phân quyền MUST: điều hành đọc/sửa mọi trường đơn; biên tập viên KHÔNG đọc được số điện thoại khách; tạo đơn chỉ qua API công khai.
- **FR-B08**: Dữ liệu cá nhân khách (tên, SĐT, điểm đón/trả) MUST tự ẩn danh sau 24 tháng hoặc khi khách yêu cầu xóa.

#### Nhóm C — SEO & Khả năng hiển thị

- **FR-C01**: Bộ trường SEO MUST áp dụng thống nhất cho tuyến, bài viết, trang (tiêu đề ≤ 70 ký tự kể cả hậu tố thương hiệu, mô tả ≤ 160, hậu tố thương hiệu bật/tắt được, ảnh chia sẻ, cờ noindex).
- **FR-C02**: Canonical MUST tự sinh từ URL hiện tại, không cho sửa.
- **FR-C03**: Ảnh chia sẻ MUST theo thứ tự ưu tiên: ảnh riêng của trang → ảnh đại diện nội dung → ảnh mặc định của công ty; luôn URL tuyệt đối 1200×630.
- **FR-C04**: `noindex` MUST loại trang khỏi sitemap và thêm meta robots chặn lập chỉ mục.
- **FR-C05**: Sitemap MUST tổng hợp từ trang hệ thống publish, trang chính sách publish, tuyến đang hiển thị và bài đã đăng — tất cả không noindex — với `lastmod` đúng thời gian cập nhật; loại trang thành công, khu quản trị, API và URL đã chuyển hướng.
- **FR-C06**: Robots MUST cho phép toàn bộ nhưng chặn trang thành công, khu quản trị, đường dẫn API; có dòng Sitemap.
- **FR-C07**: Schema MUST sinh từ dữ liệu thật: tổ chức/dịch vụ trang web toàn site; dịch vụ + ưu đãi cho trang tuyến; bài viết cho trang tin;breadcrumb cho mọi trang con. Ngày hiệu lực giá MUST lấy theo thứ tự: giá riêng của tuyến → giá mặc định của cấu hình.
- **FR-C08**: 6 trang hệ thống MUST quản lý được SEO; 3 trang chính sách MUST quản lý được cả SEO lẫn nội dung; khu quản trị MUST chặn tạo/xóa trang hệ thống.
- **FR-C09**: Slug MUST tự sinh không dấu, duy nhất trong nhóm; đổi slug của bản ghi đã hiển thị MUST tự tạo chuyển hướng và yêu cầu xác nhận.
- **FR-C10**: Chuyển hướng MUST chuẩn hóa `fromUrl` (chữ thường, bắt đầu `/`, không `/` cuối, không query), duy nhất; cấm vòng lặp/chuỗi (kiểm tra tối đa 5 bước); mã trạng thái ∈ {301, 302, 307, 308, 410}; bản ghi tắt/không tồn tại → 404 thật.

#### Nhóm D — Nội dung & Quản trị

- **FR-D01**: Bài viết MUST có 3 chuyên mục cố định với tên hiển thị suy ra (không nhập riêng), trích dẫn ≤ 300 ký tự, nội dung làm sạch theo allowlist, mục lục tự sinh từ heading cấp 2 khớp neo trong bài.
- **FR-D02**: Ảnh bài viết MUST bắt buộc alt; ảnh trong bài MUST có alt/width/height.
- **FR-D03**: Tuyến MUST có: danh sách điểm đón/trả từng địa danh, vùng hoạt động (5 khu cố định), từ khóa khớp tuyến, slide ảnh (ảnh đầu là ảnh LCP, có alt), câu hỏi thường gặp, tuyến liên quan (tối đa 3), thứ tự hiển thị, trạng thái.
- **FR-D04**: Giá tuyến MUST được lưu dạng số ở 4 mức; text hiển thị và giá tham chiếu (mức thấp nhất không thương lượng) MUST tự suy ra; dòng bảng giá MUST chọn theo mức giá, không nhập tay giá.
- **FR-D05**: Validates tuyến: `max ≥ min`, `min > 0`, có ít nhất một trong hai mức "ghép 1"/"bao xe 4–5 chỗ".
- **FR-D06**: Bảng giá sân bay MUST đủ 12 quận × 3 chiều × 3 loại xe (số); cảnh báo giá khứ hồi vượt tổng hai chiều.
- **FR-D07**: Bảng giá theo km MUST không chồng lấn, không khoảng hở giữa các dải; seed 4 dải: 0–30, 31–100, 101–200, 201+.
- **FR-D08**: Cấu hình công ty MUST gồm định danh, liên hệ (hotline hiển thị + hotline thô hợp lệ), địa điểm, banner/nội dung chung, thương hiệu SEO (logo, ảnh chia sẻ mặc định, phạm vi phục vụ, khoảng giá), danh sách cam kết/phương thức thanh toán/đánh giá.
- **FR-D09**: Cấu hình giá MUST gồm: giá sàn gửi hàng, thời gian giao, số khách tối đa đi ghép, thời gian đặt trước tối thiểu, thời gian miễn phí hủy, phần trăm ưu đãi khách cũ (chỉ hiển thị), ngày hiệu lực giá, chính sách khứ hồi/thời gian chờ/lưu đêm/phy phí cầu đường/ngày lễ.
- **FR-D10**: Giá trị phái sinh (liên kết gọi điện/Zalo/SMS, tên miền) MUST do hệ thống tính, không lưu.
- **FR-D11**: Người dùng quản trị MUST có 3 vai trò: quản trị (toàn quyền), biên tập (nội dung, không thấy SĐT khách), điều hành (đơn + tài xế).
- **FR-D12**: Dữ liệu ban đầu MUST đủ: 9 tuyến, bài viết mẫu, 12 quận sân bay, 4 dải km, 9 trang (6 hệ thống + 3 chính sách), 5 chuyển hướng cũ, cấu hình công ty/giá đầy đủ từ dữ liệu hiện có.

#### Nhóm E — Hiệu năng & Tích hợp

- **FR-E01**: Website công khai MUST cache được ở tầng CDN với thời gian sống ngắn và tự làm mới theo sự kiện; mọi thay đổi nội dung MUST làm mới được các trang bị ảnh hưởng (trang chi tiết cũ + mới, trang danh sách, trang chủ, layout, sitemap) ≤ 5 giây sau sự kiện.
- **FR-E02**: Sự kiện làm mới MUST xác thực bằng bí mật (so sánh an toàn thời gian cố định), trả `401` khi sai, không ghi bí mật ra log.
- **FR-E03**: Website MUST hoạt động bình thường khi khu quản trị lỗi (không chặn vì cache hỏng).
- **FR-E04**: Trang tra cứu vé và dữ liệu đơn MUST không cache.
- **FR-E05**: Ảnh MUST được phục vụ ở đường dẫn không nằm dưới tiền tố API, kèm alt + kích thước (không dịch chuyển bố cục); chỉ định trước ảnh quan trọng (LCP).
- **FR-E06**: Mục tiêu hiệu năng MUST: LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms (mobile); báo giá p95 ≤ 150ms; tạo đơn p95 ≤ 400ms.

### Key Entities

- **Tuyến đường (Route)**: định danh slug + tên + xuất phát/đến; 4 mức giá dạng số; bảng giá hiển thị; điểm đón/trả; vùng hoạt động; từ khóa khớp; slide/ảnh thẻ; câu hỏi thường gặp; tuyến liên quan; thứ tự + trạng thái + SEO.
- **Bài viết (Article)**: slug + tiêu đề + chuyên mục + trích dẫn + nội dung (đã làm sạch) + mục lục + tác giả + ảnh đại diện + tuyến liên quan + trạng thái + thời gian đăng + SEO.
- **Trang (Page)**: slug (kể cả đường dẫn nhiều cấp) + loại (hệ thống/chính sách) + tiêu đề + nội dung (chỉ loại chính sách) + trạng thái + SEO.
- **Đơn đặt xe (Booking)**: mã vé + token tra cứu + khách (tên/SĐT đã chuẩn hóa) + tuyến + dịch vụ + điểm đón/trả + hình thức + loại xe + số khách + giờ đón (+ quận/chiều/khoảng cách) + kết quả báo giá (kiểu giá, giá thấp/cao) + giá cuối + thanh toán + trạng thái + lý do hủy + ghi chú (khách/nội bộ) + tài xế + lịch sử trạng thái + cờ thông báo + dấu vân tay IP băm.
- **Tài xế (Driver)**: họ tên + SĐT + biển số + loại xe + đang hoạt động.
- **Ảnh (Media)**: tệp + alt bắt buộc + kích thước + MIME + đường dẫn.
- **Chuyển hướng (Redirect)**: từ đường dẫn (duy nhất) → tới đường dẫn + mã trạng thái + nguồn + đang bật.
- **Giá sân bay (Airport Pricing)**: 12 quận, 3 chiều, 3 loại xe (số).
- **Giá theo km (Distance Rate)**: dải khoảng cách + đơn giá 3 loại xe, không chồng lấn.
- **Người dùng (User)**: tài khoản quản trị với 3 vai trò.
- **Cấu hình công ty (Company Settings — toàn cục)**: định danh/liên hệ/địa điểm/nội dung chung/thương hiệu SEO/nội dung động.
- **Cấu hình giá (Pricing Settings — toàn cục)**: hằng số và chính sách giá.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Bộ 20 trường hợp báo giá mẫu (Phụ lục A) trả đúng kết quả — chạy tự động, 100% pass.
- **SC-002**: Đơn đặt xe hợp lệ được lưu và thông báo tới tổng đài ≤ 5 giây; tắt kênh thông báo vẫn tạo được đơn (tỷ lệ đơn mất = 0).
- **SC-003**: Mọi trường validation (SĐT sai, giờ quá sớm, honeypot, rate limit) bị chặn đúng mã lỗi theo hợp đồng; thử dò 20 mã vé liên tiếp bị chặn trong ngày.
- **SC-004**: Chuyển trạng thái sai luôn bị từ chối `409`; `assigned` không có tài xế và `cancelled` không có lý do không thể lưu.
- **SC-005**: 100% trang (tuyến, bài, 6 trang hệ thống, 3 trang chính sách) có title/description/canonical/ảnh chia sẻ đúng quy tắc; tổng title hiển thị ≤ 70 ký tự.
- **SC-006**: Bật/tắt noindex phản ánh đúng trên trang **và** sitemap; sitemap đủ URL hợp lệ với `lastmod` chính xác, không chứa URL cấm.
- **SC-007**: Đổi slug một tuyến → URL cũ trả 301 tới URL mới trong ≤ 60 giây; không tồn tại chuỗi/vòng lặp chuyển hướng; 5 đường dẫn cũ vẫn 301 sau khi không còn cấu hình tĩnh.
- **SC-008**: Sửa giá một tuyến → trang tuyến, trang chủ, danh sách tuyến, sidebar tin tức, trang giới thiệu, header và form đặt xe phản ánh thay đổi ≤ 5 giây.
- **SC-009**: Sửa hotline → hiển thị ở mọi trang (header, footer, banner nổi, schema).
- **SC-010**: Webhook làm mới với sai bí mật → `401`; đúng bí mật → làm mới cả đường dẫn cũ và mới khi đổi slug.
- **SC-011**: Seed đủ 9 tuyến + 12 quận sân bay + 4 dải km + 9 trang + 5 chuyển hướng; `priceFrom` của cả 9 tuyến khớp mức giá ghép 1.
- **SC-012**: Người dùng biên tập không xem được SĐT khách; người điều hành xem được.
- **SC-013**: Core Web Vitals mobile: LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms trên trang chủ, trang tuyến, trang bài viết.
- **SC-014**: `POST /pricing/estimate` p95 ≤ 150ms; `POST /bookings` p95 ≤ 400ms (không tính mạng).
- **SC-015**: Trang thành công hiển thị đúng dữ liệu đơn tra được từ API; không còn dữ liệu mẫu cứng trong query string.
- **SC-016**: Kết quả schema đạt kiểm tra của công cụ kiểm tra kết quả phong phú (TaxiService, Service/Offer, Article).

## Assumptions

### Quyết định phạm vi của người dùng (2026-10-09)

- Mức độ phức tạp: **Thorough**; quy trình: Spec-Kit.
- Hai ứng dụng tách bạch: nền tảng quản trị + API công khai tại `cms/backend`; website công khai tại `cms/frontend`.
- Cơ sở dữ liệu quan hệ cho nền tảng quản trị (phát triển trên môi trường cục bộ có container).
- Dự án `TestSEO/` hiện có chỉ dùng làm **nguồn dữ liệu seed** và **chuẩn thiết kế**; không phải sản phẩm cần sửa trong dự án này.
- (Chi tiết lựa chọn công nghệ được ghi ở `plan.md` — ngoài phạm vi tài liệu sản phẩm này.)

### Mặc định nghiệp vụ từ spec v1.1 (mục 8) — người dùng có thể phủ quyết

- **D1**: Giá theo km tính cả quãng theo dải, không phí tối thiểu (ảnh hưởng bộ test A15–A17).
- **D2**: Miễn phí hủy trước 30 phút so với giờ đón.
- **D3**: Bao xe không bắt buộc đặt cọc (`depositAmount = null`).
- **D4**: Đi ghép 2 khách thiếu giá riêng → tự gấp đôi giá ghép 1.
- **D5**: Đi ghép ≥ 3 khách → tự tính giá bao xe 4/5 chỗ.
- **D6**: Phụ phí lễ/tết chỉ hiển thị thông báo, không tự áp dụng.
- **D7**: "Giảm 10% khách cũ" chỉ hiển thị, không tự áp dụng.
- **D8**: Tuyến tự nhập không tính khoảng cách tự động → yêu cầu báo giá (Phase 2 mới tính km).
- **D9**: Thông báo chỉ Telegram + email dự phòng (không Zalo OA/SMS).
- **D10**: Khu quản trị cùng tên miền ở đường dẫn `/admin`.
- **D11**: Hậu tố thương hiệu trong tiêu đề mặc định bật, tắt được.
- **D12**: Cảnh báo ngày hiệu lực giá khi còn dưới 30 ngày.

### Phạm vi & giả định khác

- **Phase 1** theo spec: tuyến, bài viết, trang, cài đặt, giá sân bay/theo km, đặt xe + engine báo giá, chuyển hướng, SEO toàn trang, trang chính sách từ CMS.
- **Nội dung** các trang chủ/giới thiệu/liên hệ vẫn nằm trong code; CMS chỉ quản lý **SEO** của chúng (Phase 2 mới block-based).
- Website hiện tại đã có bộ trang/thiết kế; dự án mới phải tái hiện giao diện và nội dung tương đương.
- Môi trường phát triển có Docker để chạy PostgreSQL; không cần môi trường staging trong phạm vi này.
- Dữ liệu cá nhân được xử lý theo trang chính sách bảo mật của chính website (ẩn danh sau 24 tháng).
