import type { BookingStatus, CancelReason } from '../types/bookings';

export type { BookingStatus, CancelReason };

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

export const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  in_progress: 'Đang chạy',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

export const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
  in_progress: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
};

export function isBookingStatus(value: unknown): value is BookingStatus {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(TRANSITIONS, value);
}

export function getAllowedTransitions(status: BookingStatus): BookingStatus[] {
  return TRANSITIONS[status] || [];
}

export function isTerminalStatus(status: BookingStatus): boolean {
  return status === 'completed' || status === 'cancelled';
}

export function statusLabelOf(status: BookingStatus | string | null | undefined): string {
  if (!status) return 'Không xác định';
  return (STATUS_LABELS as Record<string, string>)[status] || 'Không xác định';
}

export type EvaluateTransitionInput = {
  from: BookingStatus | string;
  to: BookingStatus | string;
  doc?: TransitionDoc;
};

/**
 * Đánh giá tính hợp lệ khi chuyển trạng thái đơn đặt xe:
 * - Cùng trạng thái -> noop ({ ok: true, noop: true })
 * - Ngoài bảng chuyển hoặc từ terminal -> INVALID_TRANSITION
 * - Thiếu điều kiện trạng thái đích -> VALIDATION_ERROR kèm fields
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
    return {
      ok: false,
      code: 'VALIDATION_ERROR',
      message: 'Dữ liệu chuyển trạng thái không hợp lệ.',
      fields,
    };
  }

  return { ok: true };
}
