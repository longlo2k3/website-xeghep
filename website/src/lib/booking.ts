import type { BookingInput, EstimateInput } from "./api";

const VN_PHONE_RE = /^(03|05|07|08|09)\d{8}$/;
const OFFSET_RE = /(Z|[+-]\d{2}:?\d{2})$/i;
const VN_OFFSET = "+07:00";

/** Chuẩn hóa số điện thoại về đúng dạng backend validate: bắt đầu bằng 0 (VD: 0962298293). */
export function normalizePhone(raw: string): string {
  let p = String(raw ?? "").replace(/[\s.\-()]/g, "");
  if (p.startsWith("+84")) p = `0${p.slice(3)}`;
  else if (p.startsWith("84")) p = `0${p.slice(2)}`;
  return p;
}

/** Hợp lệ sau khi normalize (khớp regex của backend validate.ts). */
export function isValidVietnamPhone(raw: string): boolean {
  return VN_PHONE_RE.test(normalizePhone(raw));
}

/**
 * datetime-local ("YYYY-MM-DDTHH:mm") → ISO có offset +07:00.
 * Giữ nguyên giá trị đã có offset/Z (backend cũng hiểu không-offset là UTC+7).
 */
export function toVietnamIso(localValue: string): string {
  const value = String(localValue ?? "").trim();
  if (!value) return "";
  if (OFFSET_RE.test(value)) return value;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(value)) return `${value}${VN_OFFSET}`;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return `${value}:00${VN_OFFSET}`;
  return value;
}

function clampPassengerCount(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(3, Math.max(1, Math.trunc(value)));
}

export type EstimateFormValues = {
  pickup: string;
  dropoff: string;
  routeSlug?: string | null;
  vehicleType: string;
  rideType: "ghep" | "bao";
  passengerCount: number;
};

/** Ghép giá trị form → EstimateInput; trả null khi thiếu dữ liệu (không gọi API). */
export function buildEstimateInput(values: EstimateFormValues): EstimateInput | null {
  const pickup = values.pickup.trim();
  const dropoff = values.dropoff.trim();
  if (pickup.length < 2 || dropoff.length < 2) return null;

  const vehicleType = values.vehicleType as EstimateInput["vehicleType"];
  const input: EstimateInput = { pickup, dropoff, vehicleType };
  if (values.routeSlug && values.routeSlug !== "custom") input.routeSlug = values.routeSlug;

  // Chế độ gửi hàng: không gửi rideType/passengerCount (per backend validate).
  if (vehicleType !== "guihang") {
    input.rideType = values.rideType;
    if (values.rideType === "ghep") input.passengerCount = clampPassengerCount(values.passengerCount);
  }
  return input;
}

export type BookingFormValues = {
  customerName: string;
  customerPhone: string;
  pickup: string;
  dropoff: string;
  routeSlug?: string | null;
  vehicleType: string;
  rideType: "ghep" | "bao";
  passengerCount: number;
  pickupDateTime: string;
  /** Honeypot theo hợp đồng backend: có giá trị → 201 giả, không lưu. */
  website?: string;
};

/** Ghép giá trị form → body POST /api/v1/bookings (kèm honeypot `website`). */
export function buildBookingPayload(values: BookingFormValues): BookingInput {
  const vehicleType = values.vehicleType as BookingInput["vehicleType"];
  const body: BookingInput = {
    customerName: values.customerName.trim(),
    customerPhone: normalizePhone(values.customerPhone),
    pickupLocation: values.pickup.trim(),
    dropoffLocation: values.dropoff.trim(),
    vehicleType,
    pickupDateTime: toVietnamIso(values.pickupDateTime),
    website: values.website ?? "",
  };

  if (values.routeSlug && values.routeSlug !== "custom") body.routeSlug = values.routeSlug;

  if (vehicleType !== "guihang") {
    body.rideType = values.rideType;
    if (values.rideType === "ghep") body.passengerCount = clampPassengerCount(values.passengerCount);
  }

  return body;
}

/** Sinh UUID v4 cho Idempotency-Key (fallback khi crypto.randomUUID không có). */
export function createIdempotencyKey(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    const v = ch === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
