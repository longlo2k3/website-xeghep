# Tasks: Phân Rã Công Việc Loại Bỏ Nghiệp Vụ Tài Xế

- **Feature Name**: `003-remove-driver-logic`
- **Spec**: [.specify/specs/003-remove-driver-logic/spec.md](spec.md)
- **Plan**: [.specify/specs/003-remove-driver-logic/plan.md](plan.md)

---

## Danh Sách Nhiệm Vụ Chi Tiết (T201 – T212)

### Nhóm 1: Backend — Máy trạng thái & Kiểm thử TDD (T201 – T205)
- [x] **T201**: [Backend] Cập nhật Red tests `backend/tests/booking.stateMachine.test.ts` phản ánh luồng trạng thái mới: `confirmed` -> `in_progress`, từ chối `assigned`, từ chối `no_driver`, loại bỏ các bài test ràng buộc driver.
- [x] **T202**: [Backend] Cập nhật máy trạng thái `backend/src/lib/booking/stateMachine.ts`: Bỏ `assigned` khỏi `BookingStatus`, bỏ `no_driver` khỏi `CancelReason`, cấu hình `confirmed: ['in_progress', 'cancelled']`, loại bỏ kiểm tra tài xế trong `evaluateTransition`.
- [x] **T203**: [Backend] Cập nhật collection `backend/src/collections/Bookings/index.ts`: Bỏ hàm `driverIsActive`, bỏ kiểm tra driver ở hook `beforeChange`, gỡ options `assigned` và `no_driver`, xóa trường quan hệ `driver`.
- [x] **T204**: [Backend] Gỡ bỏ Collection `Drivers` (`backend/src/collections/Drivers/`), cập nhật `backend/src/payload.config.ts`, và làm sạch mô tả vai trò `dispatcher` trong `Users/index.ts` & `shared/access.ts`.
- [x] **T205**: [Backend] Chạy toàn bộ test suite của backend (`npm test`), xác thực 100% test files pass.

### Nhóm 2: Admin Frontend — Types & Máy trạng thái (T206 – T207)
- [x] **T206**: [Admin] Cập nhật Types (`admin/src/types/bookings.ts`, xóa `admin/src/types/drivers.ts`, sửa `admin/src/types/index.ts`) và cập nhật Red test `admin/src/tests/stateMachine.test.ts`.
- [x] **T207**: [Admin] Cập nhật máy trạng thái `admin/src/lib/stateMachine.ts`: Đồng bộ `BookingStatus`, `CancelReason`, `TRANSITIONS`, `STATUS_LABELS`, `STATUS_COLORS`, loại bỏ kiểm tra `driver`.

### Nhóm 3: Admin Frontend — UI, Navigation & Features (T208 – T211)
- [x] **T208**: [Admin] Xóa module `features/drivers/` (`DriverList.tsx`, `DriverFormModal.tsx`), gỡ route `/drivers` trong `admin/src/routes/index.tsx`, và xóa mục menu "Tài xế" khỏi `admin/src/layouts/DashboardLayout.tsx`.
- [x] **T209**: [Admin] Cập nhật các component đặt xe: Xóa `DriverAssignModal.tsx`, cập nhật `StatusTransitionActions.tsx` (nút chuyển sang `in_progress`, bỏ `no_driver`), cập nhật `BookingDetailModal.tsx` (bỏ khối tài xế) và `BookingList.tsx`.
- [x] **T210**: [Admin] Cập nhật bộ test admin: Xóa `admin/src/tests/drivers.test.tsx`, cập nhật `admin/src/tests/layout.test.tsx` và `admin/src/tests/bookings.test.tsx`.
- [x] **T211**: [Admin] Chạy toàn bộ test suite của admin (`npm test`), xác thực 100% test files pass.

### Nhóm 4: Verification Toàn Diện & Đóng Gói (T212)
- [x] **T212**: [Full Check] Chạy build kiểm tra (`npm run build`) cho cả hai phân hệ `backend` và `admin`, kiểm tra lint/typecheck và cập nhật tài liệu `task_plan.md`, `findings.md`, `progress.md`.
