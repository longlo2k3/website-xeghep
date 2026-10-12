import type { CollectionConfig } from "payload";
import { APIError } from "payload";

import {
  buildHistoryEntry,
  evaluateTransition,
  type BookingStatus,
} from "../../lib/booking/stateMachine";
import { isAuthenticated, isAdmin, isAdminOrDispatcher } from "../shared/access";

const STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "In progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];


export const Bookings: CollectionConfig = {
  slug: "bookings",
  access: {
    // Tạo đơn: user đã đăng nhập (admin panel). API công khai PHẢI dùng
    // overrideAccess: true (local API) — xem report T006/T011.
    create: ({ req }) => isAuthenticated({ req }),
    delete: ({ req }) => isAdmin({ req }),
    // Admin/dispatcher toàn trường; editor đọc được (customerPhone bị mask ở field-level)
    read: ({ req }) => isAuthenticated({ req }),
    // Chỉ admin + dispatcher sửa đơn
    update: ({ req }) => isAdminOrDispatcher({ req }),
  },
  admin: {
    useAsTitle: "bookingCode",
    defaultColumns: [
      "bookingCode",
      "customerName",
      "customerPhone",
      "status",
      "pickupDatetime",
      "createdAt",
    ],
    listSearchableFields: ["bookingCode", "customerName", "customerPhone"],
    description: "Đơn đặt xe (spec 4.2.4) — tạo đơn chỉ qua API công khai.",
  },
  hooks: {
    beforeChange: [
      // FR-B01/B02/B03: validate máy trạng thái + ghi lịch sử khi đổi trạng thái
      async ({ data, originalDoc, req }) => {
        if (!originalDoc || !data) return;
        const from = (originalDoc.status ?? "pending") as BookingStatus;
        const to = (data.status ?? from) as BookingStatus;
        if (to === from) return;

        const result = evaluateTransition({
          from,
          to,
          doc: { ...originalDoc, ...data },
        });

        if (!result.ok) {
          const details = result.fields?.length
            ? ` [${result.fields.map((f) => `${f.field}: ${f.message}`).join("; ")}]`
            : "";
          throw new APIError(
            `${result.code}: ${result.message}${details}`,
            result.code === "INVALID_TRANSITION" ? 409 : 422,
          );
        }

        const history = originalDoc.statusHistory ?? [];
        const entry = buildHistoryEntry({
          from,
          to,
          // cột `by` là FK số — không có người dùng thì lưu null (không ghi 'system')
          by: req?.user?.id ?? null,
          note: "",
        });
        data.statusHistory = [...history, { ...entry, at: entry.at.toISOString() }];
      },
    ],
  },
  fields: [
    {
      name: "bookingCode",
      type: "text",
      label: "Mã đơn",
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        description: "Tự sinh XG-{YYMMDD}-{6 ký tự} khi tạo qua API (T019–T022).",
      },
    },
    {
      name: "customerName",
      type: "text",
      label: "Tên khách hàng",
      required: true,
    },
    {
      name: "customerPhone",
      type: "text",
      label: "Số điện thoại",
      required: true,
      index: true,
      access: {
        // FR-B07: editor không đọc được số điện thoại
        read: ({ req }) => req?.user?.role !== "editor",
      },
      admin: { description: "Đã normalize về dạng 0xxxxxxxxx." },
    },
    {
      name: "route",
      type: "relationship",
      label: "Tuyến",
      relationTo: "routes",
      admin: { description: "Để trống với tuyến custom." },
    },
    {
      name: "serviceType",
      type: "select",
      label: "Loại dịch vụ",
      required: true,
      defaultValue: "passenger",
      options: [
        { label: "Chở khách", value: "passenger" },
        { label: "Gửi hàng", value: "parcel" },
      ],
    },
    {
      name: "pickupLocation",
      type: "text",
      label: "Điểm đón",
      required: true,
      minLength: 3,
      maxLength: 255,
    },
    {
      name: "dropoffLocation",
      type: "text",
      label: "Điểm trả",
      required: true,
      minLength: 3,
      maxLength: 255,
    },
    {
      name: "rideType",
      type: "select",
      label: "Hình thức đi",
      options: [
        { label: "Đi ghép", value: "ghep" },
        { label: "Bao xe", value: "bao" },
      ],
      admin: { description: "Bắt buộc khi passenger; null khi parcel." },
    },
    {
      name: "vehicleType",
      type: "select",
      label: "Loại xe",
      required: true,
      options: [
        { label: "4 chỗ", value: "4cho" },
        { label: "5 chỗ", value: "5cho" },
        { label: "7 chỗ", value: "7cho" },
        { label: "16 chỗ", value: "16cho" },
        { label: "Gửi hàng", value: "guihang" },
      ],
    },
    {
      name: "passengerCount",
      type: "number",
      label: "Số khách",
      defaultValue: 1,
      min: 1,
      max: 3,
      admin: { description: "Chỉ ý nghĩa khi rideType = ghep." },
    },
    {
      name: "pickupDatetime",
      type: "date",
      label: "Thời gian đón",
      required: true,
      admin: { description: "Lưu UTC, hiển thị Asia/Ho_Chi_Minh." },
    },
    {
      name: "airportDistrict",
      type: "text",
      label: "Quận sân bay",
      admin: { description: "Đầu vào Pricing Engine (PR-6)." },
    },
    {
      name: "airportDirection",
      type: "select",
      label: "Hướng sân bay",
      options: [
        { label: "Đi ra sân bay", value: "to_airport" },
        { label: "Đi từ sân bay", value: "from_airport" },
        { label: "Khứ hồi", value: "round_trip" },
      ],
    },
    {
      name: "distanceKm",
      type: "number",
      label: "Khoảng cách (km)",
      min: 0,
    },
    {
      name: "priceType",
      type: "select",
      label: "Kiểu giá",
      options: [
        { label: "Fixed", value: "fixed" },
        { label: "Range", value: "range" },
        { label: "From", value: "from" },
        { label: "Negotiable", value: "negotiable" },
        { label: "Quote required", value: "quote_required" },
      ],
    },
    {
      name: "estimatedPrice",
      type: "number",
      label: "Giá dự kiến (VND)",
    },
    {
      name: "estimatedPriceMax",
      type: "number",
      label: "Giá dự kiến tối đa (VND)",
    },
    {
      name: "finalPrice",
      type: "number",
      label: "Giá cuối cùng (VND)",
      admin: { description: "Điền khi hoàn tất đơn." },
    },
    {
      name: "paymentMethod",
      type: "select",
      label: "Hình thức thanh toán",
      options: [
        { label: "Tiền mặt", value: "cash" },
        { label: "Chuyển khoản", value: "transfer" },
      ],
    },
    {
      name: "depositAmount",
      type: "number",
      label: "Tiền cọc (VND)",
    },
    {
      name: "status",
      type: "select",
      label: "Trạng thái",
      required: true,
      defaultValue: "pending",
      index: true,
      options: STATUS_OPTIONS,
    },
    {
      name: "cancelReason",
      type: "select",
      label: "Lý do hủy",
      options: [
        { label: "Khách hủy", value: "customer_cancel" },
        { label: "Không liên lạc được", value: "unreachable" },
        { label: "Khác", value: "other" },
      ],
      validate: (value: unknown, { siblingData }: any) => {
        const status = siblingData?.status;
        if (status === "cancelled" && !value) {
          return "Bắt buộc chọn lý do hủy khi trạng thái là cancelled.";
        }
        return true;
      },
    },
    {
      name: "note",
      type: "text",
      label: "Ghi chú của khách",
      maxLength: 500,
    },
    {
      name: "dispatcherNote",
      type: "text",
      label: "Ghi chú nội bộ",
      admin: { description: "Không hiển thị ra trang công khai." },
    },
    {
      name: "statusHistory",
      label: "Lịch sử trạng thái",
      type: "array",
      admin: { readOnly: true, description: "Tự ghi khi chuyển trạng thái (FR-B03)." },
      fields: [
        {
          name: "from",
          type: "select",
          label: "Từ",
          options: STATUS_OPTIONS,
        },
        {
          name: "to",
          type: "select",
          label: "Đến",
          options: STATUS_OPTIONS,
        },
        {
          name: "by",
          type: "relationship",
          label: "Người thực hiện",
          relationTo: "users",
        },
        {
          name: "at",
          type: "date",
          label: "Thời điểm",
        },
        {
          name: "note",
          type: "text",
          label: "Ghi chú",
        },
      ],
    },
    {
      name: "sourceIpHash",
      type: "text",
      label: "IP hash",
      admin: { readOnly: true, description: "sha256(ip + IP_SALT) — không lưu IP thô." },
    },
    {
      name: "notifiedAt",
      type: "date",
      label: "Đã thông báo lúc",
      admin: { readOnly: true },
    },
    {
      name: "notifyAttempts",
      type: "number",
      label: "Số lần thử thông báo",
      defaultValue: 0,
      admin: { readOnly: true },
    },
    {
      name: "notifyError",
      type: "text",
      label: "Lỗi thông báo",
      admin: { readOnly: true },
    },
  ],
};
