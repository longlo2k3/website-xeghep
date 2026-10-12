# Spec: Frontend Admin CMS Cho Hệ Thống Quản Trị Nội Dung & Vận Hành

- **Feature Name**: `002-admin-cms-frontend`
- **Scope**: Giao diện Quản trị web (Admin CMS) cho nền tảng Xe Ghép Liên Tỉnh (`xegheplientinh.vn`).
- **Target Users**: Quản trị viên (Admin), Biên tập viên nội dung (Editor), Điều phối viên đặt xe (Dispatcher).
- **Constitution Alignment**: Tuân thủ các nguyên tắc tại `.specify/memory/constitution.md` (Bảo toàn SEO §2.1, Thẩm quyền dữ liệu từ máy chủ §2.2, An toàn & Quyền riêng tư §2.3, Trải nghiệm người dùng §2.6).

---

## 1. Mục tiêu & Vấn đề giải quyết (Why)

Hệ thống backend đã cung cấp cơ sở dữ liệu và các API quản lý nội dung, đơn đặt xe và cấu hình hệ thống. Để phục vụ công tác vận hành hàng ngày của đội ngũ biên tập và điều phối xe, dự án cần một giao diện Admin CMS độc lập, thân thiện, trực quan, hỗ trợ tiếng Việt và tương thích hoàn toàn với các ràng buộc nghiệp vụ của hệ thống:
1. Cho phép **Biên tập viên (Editor)** tạo, chỉnh sửa, đăng tải bài viết, trang chính sách, quản lý hình ảnh và cấu hình SEO một cách dễ dàng mà không cần can thiệp kỹ thuật.
2. Cho phép **Điều phối viên (Dispatcher)** theo dõi đơn đặt xe theo thời gian thực, duyệt đơn, gán tài xế và chuyển trạng thái đơn hàng theo đúng quy trình máy trạng thái được chuẩn hóa.
3. Cho phép **Quản trị viên (Admin)** toàn quyền quản lý cấu hình doanh nghiệp, bảng giá tuyến, quy tắc tính giá sân bay/đường dài, quản lý chuyển hướng 301 và phân quyền người dùng.

---

## 2. User Stories & Tiêu chí chấp nhận (What)

### US1: Xác thực & Phân quyền theo vai trò (Auth & RBAC)
Là một người dùng quản trị, tôi muốn đăng nhập an toàn bằng tài khoản được cấp và chỉ truy cập các tính năng phù hợp với vai trò của mình.

#### Acceptance Scenarios:
- **AC1.1 - Đăng nhập hợp lệ**:
  - **Given** người dùng ở màn hình đăng nhập,
  - **When** nhập đúng email và mật khẩu hợp lệ,
  - **Then** đăng nhập thành công, hệ thống chuyển hướng đến trang Dashboard tổng quan và hiển thị tên/vai trò trên thanh điều hướng.
- **AC1.2 - Đăng nhập thất bại**:
  - **Given** người dùng nhập sai thông tin đăng nhập hoặc tài khoản không tồn tại,
  - **When** bấm nút Đăng nhập,
  - **Then** hiển thị thông báo lỗi rõ ràng, giữ lại trường email và xóa trường mật khẩu.
- **AC1.3 - Phân quyền hiển thị (RBAC Navigation)**:
  - **Given** người dùng đăng nhập với vai trò `editor`,
  - **Then** menu điều hướng chỉ hiển thị các mục: Tuyến đường, Bài viết, Trang nội dung, Media. Ẩn các mục Đơn đặt xe, Tài xế, Cấu hình giá, Quản lý tài khoản.
  - **Given** người dùng đăng nhập với vai trò `dispatcher`,
  - **Then** menu điều hướng chỉ hiển thị: Bảng điều khiển, Đơn đặt xe, Tài xế, Tra cứu giá. Ẩn các mục Soạn bài viết, Trang, Cấu hình hệ thống.
  - **Given** người dùng đăng nhập với vai trò `admin`,
  - **Then** menu điều hướng hiển thị đầy đủ 100% các phân hệ.
- **AC1.4 - Bảo vệ tuyến đường (Route Guard)**:
  - **Given** người dùng cố tình truy cập trực tiếp URL của phân hệ không thuộc thẩm quyền của mình,
  - **Then** hệ thống chặn truy cập và chuyển hướng về Dashboard kèm thông báo từ chối quyền.
- **AC1.5 - Đăng xuất & Hết hạn phiên**:
  - **Given** người dùng chọn Đăng xuất hoặc phiên làm việc hết hạn,
  - **Then** hệ thống thu hồi phiên, xóa phiên làm việc và chuyển hướng về màn hình đăng nhập.

---

### US2: Quản trị Tuyến đường & Bảng giá cước (Routes Management)
Là một Biên tập viên hoặc Admin, tôi muốn quản lý thông tin các tuyến đường liên tỉnh và cấu hình bảng giá từng phân khúc.

#### Acceptance Scenarios:
- **AC2.1 - Danh sách tuyến đường**:
  - **Given** người dùng vào mục Quản lý tuyến đường,
  - **Then** hiển thị danh sách các tuyến đường kèm các thông tin: Tên tuyến, Điểm đi, Điểm đến, Khoảng cách, Thời gian, Giá từ, Trạng thái (Hoạt động / Bản nháp / Lưu trữ), Đánh dấu Banner Top.
- **AC2.2 - Thêm mới & Cập nhật tuyến**:
  - **Given** người dùng tạo mới hoặc chỉnh sửa tuyến đường,
  - **When** nhập tên tuyến,
  - **Then** hệ thống tự động sinh `slug` chuẩn SEO (không dấu, gạch nối) nếu để trống.
  - **When** nhập thông tin giá cho các hạng vé (`tierShare1`, `tierShare2`, `tierCharter4to5`, `tierCharter7`),
  - **Then** giao diện cho phép chọn loại giá (`fixed`, `range`, `from`, `negotiable`) và tự động kiểm tra tính hợp lệ của số tiền.
- **AC2.3 - Bảo toàn SEO khi đổi Slug Tuyến**:
  - **Given** người dùng thay đổi `slug` của một tuyến đường đã được xuất bản,
  - **Then** hệ thống hiển thị cảnh báo việc đổi URL sẽ tự động kích hoạt tạo bản ghi chuyển hướng 301 từ slug cũ sang slug mới.
- **AC2.4 - Quản lý nội dung chi tiết & FAQs**:
  - **Given** người dùng chỉnh sửa tuyến đường,
  - **Then** có thể thêm/sửa/xóa danh sách các điểm đón trả (pickups, dropoffs) và các câu hỏi thường gặp (FAQs) cho tuyến.

---

### US3: Quản trị Bài viết Tin tức & Cẩm nang (Articles Management)
Là một Biên tập viên, tôi muốn soạn thảo, định dạng nội dung và xuất bản các bài viết tin tức, cẩm nang du lịch và thông báo giá vé.

#### Acceptance Scenarios:
- **AC3.1 - Danh sách bài viết & Bộ lọc**:
  - **Given** người dùng vào mục Quản lý bài viết,
  - **Then** hiển thị danh sách bài viết phân trang, hỗ trợ tìm kiếm theo tiêu đề, lọc theo Danh mục (`kinh-nghiem`, `tin-tuyen`, `khuyen-mai`) và Trạng thái (`draft`, `published`).
- **AC3.2 - Soạn thảo bài viết trực quan**:
  - **Given** người dùng soạn thảo bài viết,
  - **Then** có trình soạn thảo trực quan hỗ trợ định dạng tiêu đề (H2, H3), in đậm/nghiêng, danh sách, chèn liên kết ngoài có thuộc tính an toàn, và chèn hình ảnh từ thư viện Media.
  - **Then** cấu trúc các thẻ H2 được tự động trích xuất để tạo mục lục bài viết (Table of Contents).
- **AC3.3 - Quản lý thông tin SEO & Xem trước Google Snippet**:
  - **Given** người dùng nhập Tiêu đề SEO và Mô tả SEO,
  - **Then** hệ thống hiển thị thanh đo độ dài chuẩn (Title ≤ 70 ký tự, Description ≤ 160 ký tự) và khung xem trước (SERP Snippet Preview) mô phỏng kết quả hiển thị trên Google.

---

### US4: Quản trị Trang Nội dung & Trang Chính sách (Pages Management)
Là một Biên tập viên, tôi muốn quản trị các trang tĩnh và trang chính sách của hệ thống.

#### Acceptance Scenarios:
- **AC4.1 - Danh mục trang hệ thống & trang nội dung**:
  - **Given** người dùng vào mục Quản lý trang,
  - **Then** hiển thị danh sách các trang được phân loại rõ rệt giữa:
    - Trang hệ thống (`kind = system`, ví dụ: `home`, `gioi-thieu`): chỉ cho phép chỉnh sửa cấu hình SEO, không cho phép xóa.
    - Trang nội dung (`kind = content`, ví dụ: `chinh-sach/bao-mat`): cho phép chỉnh sửa nội dung bài viết và cấu hình SEO.
- **AC4.2 - Ngăn chặn xóa trang hệ thống**:
  - **Given** người dùng xem một trang có `kind = system`,
  - **Then** nút Xóa bị vô hiệu hóa hoặc ẩn đi kèm giải thích đây là trang cốt lõi của hệ thống.

---

### US5: Quản lý Thư viện Media & Tải lên tập tin (Media Management)
Là một người dùng quản trị, tôi muốn tải lên, quản lý hình ảnh và sử dụng trực tiếp ảnh trong các bài viết và tuyến xe.

#### Acceptance Scenarios:
- **AC5.1 - Tải lên & Kéo thả hình ảnh**:
  - **Given** người dùng ở mục Thư viện Media hoặc modal chọn ảnh,
  - **When** tải lên tập tin ảnh (jpg, png, webp, avif),
  - **Then** hệ thống yêu cầu nhập văn bản thay thế (Alt text) bắt buộc phục vụ chuẩn SEO và trợ năng tiếp cận (Accessibility).
- **AC5.2 - Xem trước & Tái sử dụng ảnh**:
  - **Given** người dùng đang ở form sửa Tuyến hoặc Bài viết,
  - **When** bấm nút Chọn ảnh đại diện / Banner,
  - **Then** modal Thư viện Media mở ra, cho phép tìm kiếm theo tên/alt text và chọn ảnh đã có mà không cần tải lên lại từ máy tính.

---

### US6: Tiếp nhận & Điều phối Đơn đặt xe (Booking & Dispatch)
Là một Điều phối viên hoặc Admin, tôi muốn xem xét các đơn đặt xe phát sinh từ khách hàng, phân công tài xế và cập nhật trạng thái đơn theo quy trình.

#### Acceptance Scenarios:
- **AC6.1 - Danh sách đơn & Bộ lọc trạng thái**:
  - **Given** người dùng vào mục Quản lý đơn đặt xe,
  - **Then** danh sách đơn hiển thị rõ mã đặt xe (`bookingCode`), tên khách, số điện thoại, tuyến đường, thời gian đón, loại xe, giá dự tính và trạng thái hiện tại.
  - **Then** có thể lọc nhanh theo trạng thái (`pending`, `confirmed`, `assigned`, `in_progress`, `completed`, `cancelled`).
- **AC6.2 - Bảo mật thông tin khách hàng**:
  - **Given** người dùng có vai trò `editor` xem danh sách đơn,
  - **Then** số điện thoại khách hàng được tự động ẩn bớt (che 3 số giữa) theo quy định bảo mật thông tin cá nhân.
- **AC6.3 - Chuyển trạng thái tuân thủ State Machine**:
  - **Given** một đơn đang ở trạng thái `pending`,
  - **Then** giao diện chỉ hiển thị 2 hành động hợp lệ: "Xác nhận đơn" (chuyển sang `confirmed`) hoặc "Hủy đơn" (chuyển sang `cancelled`). Các nút không hợp lệ bị ẩn.
  - **Given** một đơn ở trạng thái `confirmed`,
  - **Then** cho phép gán tài xế từ danh sách tài xế đang hoạt động (`active`) để chuyển sang trạng thái `assigned`.
  - **Given** một đơn đã hoàn thành (`completed`) hoặc đã hủy (`cancelled`),
  - **Then** trạng thái là trạng thái kết thúc (terminal), không cho phép chuyển đổi tiếp.

---

### US7: Cấu hình Doanh nghiệp, Bảng giá chung & Bảng giá Sân bay / Đường dài (Settings & Pricing)
Là một Admin, tôi muốn cập nhật thông tin liên hệ công ty, cam kết dịch vụ và các bảng tính giá cước đặc thù.

#### Acceptance Scenarios:
- **AC7.1 - Cấu hình thông tin công ty**:
  - **Given** Admin vào mục Cấu hình Doanh nghiệp,
  - **Then** có thể xem và cập nhật: Tên thương hiệu, Hotline, Zalo, Số điện thoại hỗ trợ, Địa chỉ, Danh sách cam kết dịch vụ, Phương thức thanh toán, Đánh giá của khách hàng.
- **AC7.2 - Cấu hình giá chung**:
  - **Given** Admin vào mục Cấu hình giá chung,
  - **Then** có thể cập nhật: Thời gian đặt trước tối thiểu (`minLeadTimeMinutes`), Phụ phí đêm/lễ, và trường bắt buộc hạn sử dụng giá (`priceValidUntil`).
- **AC7.3 - Bảng giá sân bay & Bảng giá đường dài**:
  - **Given** Admin vào mục Bảng giá sân bay,
  - **Then** có thể cập nhật ma trận giá cho 12 quận/huyện Hà Nội đi sân bay Nội Bài (chiều đi, chiều về, khứ hồi) theo từng loại xe.

---

### US8: Quản lý Chuyển hướng 301 & Giám sát Sitemap (SEO Tools)
Là một Admin hoặc Editor, tôi muốn quản lý danh sách chuyển hướng URL để bảo toàn thứ hạng tìm kiếm và kiểm tra tính toàn vẹn của Sitemap.

#### Acceptance Scenarios:
- **AC8.1 - Quản lý Redirects**:
  - **Given** người dùng vào mục Chuyển hướng URL,
  - **Then** hiển thị danh sách các đường dẫn chuyển hướng (`from` -> `to`), mã HTTP (`301` hoặc `302`), nguồn (`manual` hoặc `auto_slug_change`).
  - **When** thêm mới một chuyển hướng,
  - **Then** hệ thống cảnh báo nếu URL đích và URL nguồn trùng nhau hoặc tạo thành vòng lặp.
- **AC8.2 - Giám sát Sitemap**:
  - **Given** người dùng xem trang tổng quan SEO,
  - **Then** hiển thị thống kê tổng số URL đang được index trong Sitemap, danh sách các trang bị đánh dấu `noindex`.

---

## 3. Ràng buộc phi chức năng (Non-Functional Requirements)

1. **Hiệu năng & Tốc độ**: Khởi tạo và nạp trang ban đầu dưới 1.5s trên mạng văn phòng chuẩn; phản hồi các thao tác bảng và bộ lọc tức thì.
2. **Ngôn ngữ & Trợ năng**: Toàn bộ giao diện hiển thị bằng tiếng Việt chuẩn ngữ cảnh vận tải hành khách liên tỉnh; các trường nhập liệu số tiền có định dạng phân cách hàng nghìn (VND).
3. **Bảo mật**: Mã token xác thực được lưu trữ an toàn; tự động xử lý khi hết hạn token (401) để tránh người dùng bị kẹt màn hình; mọi yêu cầu API đều mang thông tin định danh hợp lệ.
4. **Độ tin cậy & Xử lý lỗi**: Mọi thông báo lỗi từ máy chủ (lỗi xác thực dữ liệu 422, lỗi chuyển trạng thái 409, lỗi quyền 403) phải được phân tích và hiển thị thành câu thông báo thân thiện với người dùng, chỉ rõ trường bị lỗi.

---

## 4. Tiêu chí thành công (Success Criteria)

- [ ] Toàn bộ 8 User Stories trên được triển khai với giao diện trực quan, nhất quán và thân thiện.
- [ ] Tích hợp 100% với các endpoint REST API sẵn có của backend Payload CMS 3 (`backend/`).
- [ ] Phân quyền chính xác 3 vai trò: `admin`, `editor`, `dispatcher`.
- [ ] Tuân thủ triệt để State Machine của Đơn đặt xe, ngăn ngừa mọi xung đột trạng thái dữ liệu.
- [ ] Chạy độc lập trên cổng phát triển riêng biệt (`admin/`), có proxy chuyển tiếp API mượt mà.
