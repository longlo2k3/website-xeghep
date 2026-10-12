# Plan: Kế Hoạch Kỹ Thuật Loại Bỏ Nghiệp Vụ Tài Xế

- **Feature Name**: `003-remove-driver-logic`
- **Spec Reference**: [.specify/specs/003-remove-driver-logic/spec.md](spec.md)
- **Constitution Checkpoints**:
  - `[CP-§2.2]` Server Authority & Contract Fidelity (Máy trạng thái nhất quán, hợp đồng API chặt chẽ)
  - `[CP-§2.3]` Security & Privacy (RBAC cho Admin & Dispatcher không quyền thừa)
  - `[CP-§2.4]` Testing — TDD là bắt buộc (Bảo toàn 100% test xanh, thêm test luồng mới trước khi sửa code)
  - `[CP-§2.6]` User Experience (Loại bỏ thành phần giao diện không còn giá trị sử dụng)

---

## 1. Kiến Trúc & Phân Vùng Ảnh Hưởng (Architecture Mapping)

```
cms/
├── backend/
│   ├── src/
│   │   ├── payload.config.ts                   # [CP-§2.2] Gỡ Drivers khỏi danh sách collections
│   │   ├── collections/
│   │   │   ├── Drivers/                        # [CP-§2.2] Xóa bỏ collection Drivers
│   │   │   ├── Bookings/index.ts               # [CP-§2.2] Gỡ trường driver, xóa driverIsActive, bỏ status assigned & reason no_driver
│   │   │   └── Users/index.ts                  # [CP-§2.3] Cập nhật mô tả phân quyền Dispatcher
│   │   └── lib/booking/stateMachine.ts         # [CP-§2.2] Cập nhật BookingStatus, CancelReason, TRANSITIONS bỏ assigned & no_driver
│   └── tests/
│       └── booking.stateMachine.test.ts        # [CP-§2.4] Cập nhật test suite máy trạng thái (25 test cases)
├── admin/
│   ├── src/
│   │   ├── types/
│   │   │   ├── bookings.ts                     # [CP-§2.2] Xóa assigned, no_driver, driver field
│   │   │   ├── drivers.ts                      # [CP-§2.2] Xóa bỏ file types này
│   │   │   └── index.ts                        # [CP-§2.2] Gỡ export './drivers'
│   │   ├── lib/
│   │   │   └── stateMachine.ts                 # [CP-§2.2] Đồng bộ BookingStatus, TRANSITIONS, STATUS_LABELS/COLORS bỏ assigned
│   │   ├── layouts/
│   │   │   └── DashboardLayout.tsx             # [CP-§2.6] Bỏ menu 'Tài xế' (/drivers)
│   │   ├── routes/
│   │   │   └── index.tsx                       # [CP-§2.6] Gỡ route /drivers
│   │   ├── features/
│   │   │   ├── drivers/                        # [CP-§2.6] Xóa toàn bộ module drivers (DriverList, DriverFormModal)
│   │   │   └── bookings/
│   │   │       ├── DriverAssignModal.tsx       # [CP-§2.6] Xóa modal này
│   │   │       ├── StatusTransitionActions.tsx # [CP-§2.6] Sửa nút confirmed -> in_progress, bỏ no_driver
│   │   │       ├── BookingDetailModal.tsx      # [CP-§2.6] Bỏ khối thông tin tài xế
│   │   │       └── BookingList.tsx             # [CP-§2.6] Rà soát và gỡ nút gán tài xế
│   │   └── tests/
│   │       ├── drivers.test.tsx                # [CP-§2.4] Xóa file test này
│   │       ├── stateMachine.test.ts            # [CP-§2.4] Cập nhật test máy trạng thái frontend
│   │       ├── bookings.test.tsx               # [CP-§2.4] Cập nhật test thao tác đơn đặt xe
│   │       └── layout.test.tsx                 # [CP-§2.4] Cập nhật test menu navigation
```

---

## 2. Kế Hoạch Triển Khai Chi Tiết (Checkpoints)

### Giai đoạn 1: Backend — Máy trạng thái & Schema [CP-§2.2, CP-§2.4]
1. **Red Test Backend**: Cập nhật `backend/tests/booking.stateMachine.test.ts`:
   - Chuyển `confirmed` -> `in_progress` thành chuyển đổi hợp lệ.
   - Thử nghiệm chuyển sang `assigned` phải nhận về lỗi `INVALID_TRANSITION`.
   - Kiểm tra `cancelReason` với `no_driver` phải nhận về `VALIDATION_ERROR`.
   - Loại bỏ các test kiểm tra thiếu driver khi gán đơn.
2. **Triển khai Backend State Machine**:
   - Chỉnh sửa `backend/src/lib/booking/stateMachine.ts`:
     - Bỏ `'assigned'` khỏi `BookingStatus`.
     - Bỏ `'no_driver'` khỏi `CancelReason` và `CANCEL_REASONS`.
     - Cập nhật `TRANSITIONS`:
       - `confirmed: ['in_progress', 'cancelled']`
       - `in_progress: ['completed', 'cancelled']`
     - Bỏ logic kiểm tra `doc.driver` và `driverActive`.
3. **Triển khai Backend Bookings Collection**:
   - Chỉnh sửa `backend/src/collections/Bookings/index.ts`:
     - Bỏ hàm `driverIsActive`.
     - Xóa logic kiểm tra tài xế trong `beforeChange` hook.
     - Xóa tùy chọn `Assigned` trong `STATUS_OPTIONS`.
     - Xóa tùy chọn `no_driver` trong `cancelReason`.
     - Xóa field `driver`.
4. **Loại bỏ Collection Drivers & Cập nhật Payload Config**:
   - Xóa `backend/src/collections/Drivers/index.ts` và gỡ khỏi `backend/src/payload.config.ts`.
   - Cập nhật mô tả quyền của `dispatcher` trong `backend/src/collections/Users/index.ts` và `backend/src/collections/shared/access.ts`.
5. **Chạy Green Test Backend**: Chạy toàn bộ test suite của backend để xác nhận 100% tests pass.

### Giai đoạn 2: Admin Frontend — Types & State Machine [CP-§2.2, CP-§2.4]
1. **Red Test Admin State Machine**: Cập nhật `admin/src/tests/stateMachine.test.ts` theo luật chuyển đổi mới.
2. **Cập nhật Types & State Machine**:
   - `admin/src/types/bookings.ts`: Loại bỏ `assigned`, `no_driver`, trường `driver`.
   - Xóa `admin/src/types/drivers.ts` và gỡ export khỏi `admin/src/types/index.ts`.
   - `admin/src/lib/stateMachine.ts`: Cập nhật `BookingStatus`, `CancelReason`, `TRANSITIONS`, `STATUS_LABELS`, `STATUS_COLORS`.
3. **Chạy Green Test State Machine**: Chạy test để xác nhận `admin/src/tests/stateMachine.test.ts` pass.

### Giai đoạn 3: Admin Frontend — UI, Components & Navigation [CP-§2.6, CP-§2.4]
1. **Gỡ bỏ Module Drivers & Route**:
   - Xóa thư mục `admin/src/features/drivers/`.
   - Gỡ route `/drivers` trong `admin/src/routes/index.tsx`.
   - Cập nhật `admin/src/layouts/DashboardLayout.tsx` để bỏ mục "Tài xế" khỏi Sidebar menu.
2. **Cập nhật Bookings Feature**:
   - Xóa `admin/src/features/bookings/DriverAssignModal.tsx`.
   - Cập nhật `admin/src/features/bookings/StatusTransitionActions.tsx`:
     - Khi `status === 'confirmed'`: hiển thị nút "Bắt đầu chạy" (chuyển sang `in_progress`).
     - Bỏ nút "Gán tài xế".
     - Trong modal Hủy đơn: bỏ tùy chọn `no_driver`.
   - Cập nhật `admin/src/features/bookings/BookingDetailModal.tsx`:
     - Bỏ khối hiển thị thông tin tài xế và nút gán tài xế.
   - Cập nhật `admin/src/features/bookings/BookingList.tsx` nếu có liên quan.
3. **Cập nhật Bộ Test Admin**:
   - Xóa `admin/src/tests/drivers.test.tsx`.
   - Cập nhật `admin/src/tests/layout.test.tsx` (bỏ kỳ vọng menu Tài xế).
   - Cập nhật `admin/src/tests/bookings.test.tsx` (thay luồng gán tài xế bằng luồng chuyển thẳng sang `in_progress`).
4. **Chạy Green Test Admin**: Xác nhận 100% tests pass trong `admin/`.

### Giai đoạn 4: Đánh Giá Toàn Diện & Verification [CP-§2.4, Gate G4]
1. Chạy full test suite cho Backend (`npm test` in `backend/`).
2. Chạy full test suite cho Admin (`npm test` in `admin/`).
3. Chạy build kiểm tra cho cả hai phân hệ (`npm run build`).
4. Báo cáo kết quả và cập nhật `progress.md`.

---

## 3. Quản Lý Rủi Ro & Chiến Lược Rollback (Rollback Strategy)
- Nếu có dữ liệu booking cũ trong môi trường thử nghiệm đang ở trạng thái `assigned`: Payload CMS đọc dữ liệu cũ vẫn hiển thị dưới dạng raw string; khi điều phối viên thực hiện đổi trạng thái sẽ chuyển tiếp sang `in_progress` hoặc `cancelled`.
- Mọi thay đổi mã nguồn được commit theo từng phase rõ ràng, dễ dàng phục hồi qua Git nếu cần.
