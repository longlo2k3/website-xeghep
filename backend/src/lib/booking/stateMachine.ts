import { STATUS_LABELS } from '../api/serialize';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type CancelReason = 'customer_cancel' | 'unreachable' | 'other';

export type TransitionFieldError = { field: string; message: string };

export type TransitionDoc = {
  finalPrice?: number | null;
  paymentMethod?: string | null;
  cancelReason?: string | null;
};

export type TransitionResult =
  | { ok: true; noop?: boolean }
  | {
      ok: false;
      code: 'INVALID_TRANSITION' | 'VALIDATION_ERROR';
      message: string;
      fields?: TransitionFieldError[];
    };

export const TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export const CANCEL_REASONS: readonly CancelReason[] = [
  'customer_cancel',
  'unreachable',
  'other',
];

export function isBookingStatus(value: unknown): value is BookingStatus {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(TRANSITIONS, value);
}

export type EvaluateTransitionInput = {
  from: BookingStatus | string;
  to: BookingStatus | string;
  doc?: TransitionDoc;
};

/**
 * cùng trạng thái → noop (admin sửa trường khác không được 409);
 * ngoài bảng chuyển → INVALID_TRANSITION 409;
 * thiếu điều kiện của trạng thái đích → VALIDATION_ERROR 422.
 */
export function evaluateTransition({
  from,
  to,
  doc = {},
}: EvaluateTransitionInput): TransitionResult {
  if (to === from) return { ok: true, noop: true };

  const allowed = isBookingStatus(from) ? TRANSITIONS[from] : [];
  if (!isBookingStatus(to) || !allowed.includes(to)) {
    return {
      ok: false,
      code: 'INVALID_TRANSITION',
      message: `Không thể chuyển trạng thái từ "${from}" sang "${to}"`,
    };
  }

  const fields: TransitionFieldError[] = [];

  if (to === 'completed') {
    const price = doc.finalPrice;
    if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) {
      fields.push({ field: 'finalPrice', message: 'Cần nhập giá cuối cùng lớn hơn 0.' });
    }
    if (doc.paymentMethod !== 'cash' && doc.paymentMethod !== 'transfer') {
      fields.push({
        field: 'paymentMethod',
        message: 'Cần chọn hình thức thanh toán (tiền mặt hoặc chuyển khoản).',
      });
    }
  }

  if (to === 'cancelled') {
    if (!CANCEL_REASONS.includes(doc.cancelReason as CancelReason)) {
      fields.push({ field: 'cancelReason', message: 'Cần chọn lý do hủy.' });
    }
  }

  if (fields.length > 0) {
    return { ok: false, code: 'VALIDATION_ERROR', message: 'Dữ liệu chuyển trạng thái không hợp lệ.', fields };
  }
  return { ok: true };
}

export function statusLabelOf(status: string | null | undefined): string {
  return (status && STATUS_LABELS[status]) || 'Không xác định';
}

export type StatusHistoryEntry = {
  from: BookingStatus | string;
  to: BookingStatus | string;
  by: number | string | null;
  at: Date;
  note: string;
};

export function buildHistoryEntry({
  from,
  to,
  by,
  note,
  at,
}: {
  from: BookingStatus | string;
  to: BookingStatus | string;
  by?: number | string | null;
  note?: string | null;
  at?: Date;
}): StatusHistoryEntry {
  return {
    from,
    to,
    by: by ?? null,
    at: at ?? new Date(),
    note: note ?? '',
  };
}
