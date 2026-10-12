# Spec: Quản Trị Cấu Hình Gửi Thông Báo Tự Động (Notification Configuration)

- **Feature Name**: `004-notification-config`
- **Scope**: Backend CMS (`backend/`) & Admin CMS Frontend (`admin/`).
- **Target Users**: Quản trị viên hệ thống (Admin).
- **Constitution Alignment**: Tuân thủ `.specify/memory/constitution.md` (Thẩm quyền máy chủ §2.2, An toàn & Bảo mật §2.3, Kiểm thử TDD §2.4, Hiệu năng §2.5, Trải nghiệm người dùng §2.6).

---

## 1. Mục tiêu & Vấn đề giải quyết (Why)

Hiện tại, hệ thống gửi thông báo đơn đặt xe mới tới đội ngũ điều hành qua Telegram Bot và Email Fallback đang phụ thuộc hoàn toàn vào các biến môi trường tĩnh trên máy chủ (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `NOTIFY_EMAIL_WEBHOOK`, `NOTIFY_EMAIL_TO`). Điều này gây ra các bất cập trong vận hành thực tế:
1. **Thiếu tính linh hoạt**: Khi quản trị viên cần đổi nhóm chat Telegram, đổi token bot, hoặc thay đổi email nhận tin khẩn cấp, họ phải nhờ nhân sự kỹ thuật sửa đổi file cấu hình và khởi động lại tiến trình server.
2. **Khó kiểm tra & xác thực**: Quản trị viên không có cách nào kiểm tra nhanh xem cấu hình bot và chat ID có hoạt động thông suốt hay không trước khi có đơn khách đặt thật.
3. **Thiếu khả năng bật/tắt tạm thời**: Không thể chủ động tạm dừng gửi thông báo hoặc ngắt kênh email mà không can thiệp hạ tầng máy chủ.

**Giải pháp**:
Xây dựng phân hệ quản trị cấu hình gửi thông báo động (Notification Configuration) tích hợp trực tiếp vào màn hình Cấu hình Hệ thống (Admin Settings), cho phép quản trị viên xem, cập nhật, bật/tắt các kênh thông báo (Telegram, Email Fallback), đồng thời gửi tin nhắn thử nghiệm (Test Notify) trực tiếp từ giao diện với phản hồi kết quả tức thì.

---

## 2. User Stories & Tiêu chí chấp nhận (What)

### US1: Quản trị cấu hình thông báo Telegram Bot
Là một Quản trị viên (Admin), tôi muốn thiết lập và quản lý thông tin Telegram Bot trên giao diện quản trị để hệ thống tự động bắn đơn đặt xe mới về đúng nhóm trực điều hành.

#### Acceptance Scenarios:
- **AC1.1 - Cấu hình thông số Telegram**:
  - **Given** Quản trị viên mở trang Cấu hình Thông báo,
  - **When** nhập Bot Token, Chat ID và bật trạng thái kích hoạt Telegram,
  - **Then** hệ thống lưu trữ thành công và áp dụng cho các lượt gửi thông báo tiếp theo.
- **AC1.2 - Bật/Tắt gửi Telegram**:
  - **Given** kênh Telegram đang tắt (disabled),
  - **When** có đơn đặt xe mới phát sinh,
  - **Then** tiến trình gửi thông báo không thực hiện gửi Telegram và không ghi nhận lỗi thất bại cho đơn hàng.
- **AC1.3 - Bảo mật thông tin Bot Token**:
  - **Given** trường Bot Token trên giao diện,
  - **Then** giá trị mặc định được che ký tự (mask) với tùy chọn ẩn/hiện để tránh lộ thông tin nhạy cảm khi trình chiếu hoặc thao tác công cộng.
- **AC1.4 - Dự phòng giá trị môi trường**:
  - **Given** cấu hình trên cơ sở dữ liệu chưa được nhập hoặc để trống trường thông số,
  - **When** tiến trình thông báo hoạt động,
  - **Then** hệ thống tự động sử dụng giá trị từ biến môi trường máy chủ (nếu có) để đảm bảo không gián đoạn dịch vụ.

---

### US2: Quản trị cấu hình Email Fallback
Là một Quản trị viên (Admin), tôi muốn thiết lập kênh Email dự phòng khi Telegram gặp sự cố liên tiếp để đội ngũ không bị sót đơn đặt xe của khách hàng.

#### Acceptance Scenarios:
- **AC2.1 - Cấu hình Webhook & Email người nhận**:
  - **Given** Quản trị viên mở trang Cấu hình Thông báo,
  - **When** nhập URL Webhook gửi email, địa chỉ Email người nhận và bật kênh Email,
  - **Then** hệ thống lưu trữ hợp lệ và áp dụng khi kích hoạt cơ chế dự phòng.
- **AC2.2 - Cơ chế kích hoạt dự phòng**:
  - **Given** một đơn đặt xe gửi Telegram thất bại đủ 3 lần theo chu kỳ quy định và kênh Email đang được bật,
  - **Then** hệ thống tự động kích hoạt gửi cảnh báo đơn hàng tới kênh Email đã cấu hình.
- **AC2.3 - Tắt kênh dự phòng Email**:
  - **Given** kênh Email đang bị tắt (disabled),
  - **When** đơn đặt xe vượt quá số lần thử Telegram,
  - **Then** hệ thống không kích hoạt gửi Email và chỉ ghi nhận trạng thái lỗi của Telegram.

---

### US3: Thử nghiệm gửi thông báo trực tiếp (Test Connection)
Là một Quản trị viên (Admin), tôi muốn có chức năng bấm gửi tin nhắn test trực tiếp trên giao diện để kiểm tra tính chính xác của cấu hình ngay sau khi nhập.

#### Acceptance Scenarios:
- **AC3.1 - Gửi thử nghiệm Telegram**:
  - **Given** Quản trị viên đã nhập hoặc lưu thông tin Bot Token và Chat ID,
  - **When** nhấn nút "Gửi thử nghiệm Telegram",
  - **Then** hệ thống gửi một tin nhắn mẫu kiểm tra tới Telegram với nội dung xác nhận thời gian hệ thống.
  - **Then** giao diện hiển thị thông báo thành công nếu Telegram phản hồi hợp lệ, hoặc hiển thị chi tiết lý do lỗi nếu gửi thất bại.
- **AC3.2 - Gửi thử nghiệm Email**:
  - **Given** Quản trị viên đã cấu hình Webhook URL và Email người nhận,
  - **When** nhấn nút "Gửi thử nghiệm Email",
  - **Then** hệ thống gửi yêu cầu kiểm tra tới Webhook và phản hồi trạng thái kết nối thành công/thất bại trên giao diện.
- **AC3.3 - Ngăn chặn thao tác khi thiếu thông tin**:
  - **Given** chưa nhập Bot Token hoặc Chat ID,
  - **When** người dùng cố gắng nhấn gửi thử nghiệm,
  - **Then** hệ thống cảnh báo yêu cầu điền đầy đủ thông tin trước khi thực hiện.

---

### US4: Phân quyền & Bảo mật truy cập
Là một Chuyên viên bảo mật hệ thống, tôi muốn đảm bảo chỉ tài khoản Quản trị viên tối cao (Admin) mới có quyền xem và thay đổi cấu hình thông báo.

#### Acceptance Scenarios:
- **AC4.1 - Phân quyền truy cập API**:
  - **Given** người dùng chưa đăng nhập hoặc có vai trò không phải Admin (như Editor, Dispatcher),
  - **When** gửi yêu cầu đọc hoặc cập nhật cấu hình thông báo hoặc gọi API gửi test,
  - **Then** hệ thống từ chối với mã lỗi không có quyền truy cập.
- **AC4.2 - Phân quyền trên giao diện Admin**:
  - **Given** người dùng không có vai trò Admin,
  - **Then** tab "Cấu hình Thông báo" không hiển thị trong menu điều hướng và không thể truy cập.

---

## 3. Tiêu chí thành công & Đo lường (Success Criteria)

1. **Khả năng tự phục vụ 100%**: Quản trị viên có thể đổi kênh nhận tin Telegram và Email hoàn toàn qua giao diện mà không cần can thiệp file cấu hình hay deploy lại mã nguồn.
2. **Thời gian phản hồi test ≤ 2 giây**: Thao tác bấm nút gửi kiểm tra trả về kết quả trạng thái thành công/thất bại trong vòng không quá 2 giây.
3. **Không ảnh hưởng đơn đặt xe**: Mọi thao tác cấu hình thông báo hoặc lỗi kết nối bên thứ ba (Telegram/Email) không làm gián đoạn hoặc làm chậm luồng đặt xe của khách hàng (§2.5).
4. **Bảo toàn kiểm thử**: Toàn bộ các kịch bản kiểm thử mới về cấu hình, phân quyền, gửi test và worker đạt tỷ lệ vượt qua 100% không gây lỗi hồi quy.
