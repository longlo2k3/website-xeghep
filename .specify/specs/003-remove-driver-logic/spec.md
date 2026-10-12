# Spec: Tinh Gọn Vận Hành Đơn Đặt Xe — Loại Bỏ Hoàn Toàn Nghiệp Vụ Tài Xế

- **Feature Name**: `003-remove-driver-logic`
- **Scope**: Backend (`backend/`) & Admin CMS Frontend (`admin/`).
- **Target Users**: Quản trị viên (Admin), Điều phối viên đơn (Dispatcher), Biên tập viên (Editor).
- **Constitution Alignment**: Tuân thủ `.specify/memory/constitution.md` (Thẩm quyền máy chủ §2.2, An toàn dữ liệu §2.3, TDD §2.4, Trải nghiệm người dùng §2.6).

---

## 1. Mục tiêu & Vấn đề giải quyết (Why)

Hệ thống đặt xe và quản trị hiện tại đang tích hợp quy trình gán tài xế vào luồng xử lý đơn hàng thông qua thực thể Tài xế (`Drivers`), trạng thái trung gian `assigned` (Đã gán tài xế) và trường liên kết `driver`.
Tuy nhiên, mô hình vận hành thực tế chuyển hướng sang quản trị đơn hàng trực tiếp và tinh gọn, không quản lý danh sách tài xế trực tiếp trên hệ thống CMS:
1. Đơn giản hóa vòng đời đơn hàng: Đơn sau khi được xác nhận (`confirmed`) sẽ chuyển thẳng sang đang thực hiện (`in_progress`) và hoàn thành (`completed`), giảm thiểu các thao tác thừa cho điều phối viên.
2. Tối ưu cơ sở dữ liệu và mã nguồn: Loại bỏ thực thể `Drivers` và quan hệ thừa trong đơn hàng giúp giản lược schema, giảm phụ thuộc và tăng hiệu năng truy vấn.
3. Tinh gọn giao diện Admin: Loại bỏ toàn bộ các màn hình, menu, modal gán tài xế, giúp đội ngũ vận hành tập trung xử lý thông tin khách hàng, lộ trình và doanh thu.

---

## 2. User Stories & Tiêu chí chấp nhận (What)

### US1: Tinh gọn vòng đời Đơn đặt xe (Booking State Machine)
Là một Điều phối viên (Dispatcher) hoặc Quản trị viên (Admin), tôi muốn luồng xử lý đơn hàng diễn ra liền mạch từ xác nhận đến đang chạy mà không bị bắt buộc phải gán tài xế.

#### Acceptance Scenarios:
- **AC1.1 - Chuỗi trạng thái hợp lệ**:
  - **Given** một đơn đặt xe ở trạng thái `pending`,
  - **When** người dùng chuyển trạng thái,
  - **Then** chỉ cho phép chuyển sang `confirmed` hoặc `cancelled`.
  - **Given** một đơn đặt xe ở trạng thái `confirmed`,
  - **When** người dùng chuyển trạng thái,
  - **Then** chỉ cho phép chuyển sang `in_progress` hoặc `cancelled` (hoàn toàn không còn trạng thái `assigned`).
  - **Given** một đơn đặt xe ở trạng thái `in_progress`,
  - **When** người dùng chuyển trạng thái,
  - **Then** chỉ cho phép chuyển sang `completed` hoặc `cancelled`.
  - **Given** một đơn đặt xe ở trạng thái kết thúc (`completed` hoặc `cancelled`),
  - **Then** không cho phép chuyển tiếp sang bất kỳ trạng thái nào khác.
- **AC1.2 - Chuyển sang `in_progress` không cần dữ liệu tài xế**:
  - **Given** đơn đặt xe đang ở trạng thái `confirmed`,
  - **When** người dùng thực hiện chuyển sang `in_progress`,
  - **Then** hệ thống chấp thuận mà không kiểm tra trường `driver` hay trạng thái hoạt động của tài xế.
- **AC1.3 - Danh mục lý do hủy đơn**:
  - **Given** người dùng chọn hủy đơn (`cancelled`),
  - **Then** danh mục lý do hủy chỉ gồm: `customer_cancel` (Khách hủy), `unreachable` (Không liên lạc được), `other` (Khác).
  - **Then** lý do `no_driver` (Không có tài xế) bị loại bỏ hoàn toàn; việc gửi `no_driver` sẽ bị từ chối với lỗi dữ liệu không hợp lệ.
- **AC1.4 - Điều kiện hoàn thành đơn**:
  - **Given** đơn chuyển sang `completed`,
  - **Then** hệ thống tiếp tục bắt buộc nhập `finalPrice` hợp lệ (> 0) và hình thức thanh toán `paymentMethod` (`cash` hoặc `transfer`).

---

### US2: Loại bỏ Thực thể Tài xế trong Backend (Backend Decommissioning)
Là một Nhà phát triển hệ thống và Quản trị viên, tôi muốn lược bỏ hoàn toàn collection `Drivers` và các liên kết trong backend để đảm bảo tính nhất quán dữ liệu.

#### Acceptance Scenarios:
- **AC2.1 - Loại bỏ Collection Drivers**:
  - **Given** hệ thống khởi động Payload CMS,
  - **Then** collection `Drivers` không còn được đăng ký trong cấu hình CMS.
  - **Then** các API liên quan đến `/api/drivers` không còn khả dụng hoặc không tồn tại.
- **AC2.2 - Loại bỏ trường Driver trong Bookings**:
  - **Given** schema của collection `Bookings`,
  - **Then** trường `driver` bị xóa bỏ hoàn toàn khỏi định nghĩa collection và kiểu dữ liệu.
  - **Then** hook `beforeChange` của `Bookings` không còn logic truy vấn `driverIsActive`.
- **AC2.3 - Điều chỉnh vai trò Dispatcher**:
  - **Given** người dùng thuộc vai trò `dispatcher`,
  - **Then** người dùng có quyền quản trị đơn đặt xe (`bookings`) mà không gắn với quyền quản lý tài xế.

---

### US3: Tinh gọn Giao diện Quản trị Admin CMS (Admin CMS UI)
Là một người dùng vận hành Admin CMS, tôi muốn giao diện hiển thị tinh gọn, không còn các thành phần liên quan đến tài xế.

#### Acceptance Scenarios:
- **AC3.1 - Thanh điều hướng Sidebar**:
  - **Given** bất kỳ người dùng đăng nhập nào (kể cả Admin và Dispatcher),
  - **Then** thanh menu Sidebar không hiển thị mục "Quản lý tài xế" hoặc "Tài xế".
- **AC3.2 - Điều hướng và Tuyến đường (Routing)**:
  - **Given** người dùng truy cập trực tiếp đường dẫn `/drivers`,
  - **Then** hệ thống điều hướng về trang Dashboard hoặc hiển thị thông báo không tìm thấy trang.
- **AC3.3 - Màn hình Chi tiết Đơn đặt xe (Booking Detail)**:
  - **Given** người dùng mở xem chi tiết một đơn đặt xe,
  - **Then** không hiển thị khu vực thông tin tài xế hay nút mở modal gán tài xế.
- **AC3.4 - Màn hình Danh sách Đơn & Hành động chuyển trạng thái**:
  - **Given** đơn đặt xe đang ở trạng thái `confirmed`,
  - **Then** nút thao tác hiển thị hành động "Bắt đầu chạy" (chuyển sang `in_progress`), không có nút "Gán tài xế".
  - **Given** người dùng mở hộp thoại Hủy đơn,
  - **Then** danh sách chọn lý do hủy không còn lựa chọn "Không có tài xế".

---

### US4: Kiểm thử Tự động & Bảo toàn Toàn vẹn Hệ thống (Test & Regression)
Là một Kỹ sư đảm bảo chất lượng, tôi muốn tất cả các kịch bản kiểm thử phản ánh chính xác nghiệp vụ mới và không xảy ra lỗi hồi quy.

#### Acceptance Scenarios:
- **AC4.1 - Kiểm thử Backend**:
  - **Given** bộ kiểm thử máy trạng thái và đơn đặt xe ở backend,
  - **Then** tất cả các test case kiểm tra chuyển trạng thái từ `confirmed` -> `in_progress` -> `completed` đều pass 100%.
  - **Then** các test case kiểm tra lỗi khi thiếu driver bị gỡ bỏ hoặc cập nhật theo luồng mới.
- **AC4.2 - Kiểm thử Frontend Admin**:
  - **Given** bộ kiểm thử giao diện và máy trạng thái ở `admin/`,
  - **Then** test case của `stateMachine.test.ts`, `bookings.test.tsx`, `layout.test.tsx` được cập nhật phù hợp và pass 100%.
  - **Then** file test `drivers.test.tsx` được gỡ bỏ cùng với module `drivers`.
  - **Then** quá trình build production (`npm run build`) của `admin` và `backend` thành công không có lỗi typecheck.

---

## 3. Tiêu chí Thành công & Đo lường (Success Criteria)
1. **Hoạt động liền mạch**: Đơn đặt xe có thể chuyển trạng thái hoàn tất từ `pending` đến `completed` qua giao diện admin mà không yêu cầu thông tin tài xế.
2. **Không mã chết (Dead code elimination)**: Toàn bộ mã nguồn liên quan đến tài xế (`types/drivers.ts`, `features/drivers`, `collections/Drivers`) được dọn dẹp sạch sẽ.
3. **Độ tin cậy kiểm thử**: 100% các bài kiểm thử unit & integration ở backend và admin đều xanh (exit code 0).
