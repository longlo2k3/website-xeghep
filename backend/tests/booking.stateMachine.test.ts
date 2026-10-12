import { describe, expect, it } from 'vitest';

import type { BookingStatus, TransitionDoc } from '../src/lib/booking/stateMachine';
import {
  TRANSITIONS,
  buildHistoryEntry,
  evaluateTransition,
  statusLabelOf,
} from '../src/lib/booking/stateMachine';

const ALL_STATUSES: BookingStatus[] = [
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
];

const docFor = (to: BookingStatus): TransitionDoc => ({
  finalPrice: to === 'completed' ? 400000 : null,
  paymentMethod: to === 'completed' ? 'cash' : null,
  cancelReason: to === 'cancelled' ? 'customer_cancel' : null,
});

describe('bảng chuyển trạng thái (spec §3.1 — không có driver/assigned)', () => {
  it('đúng bảng chuyển của đặc tả', () => {
    expect(TRANSITIONS).toEqual({
      pending: ['confirmed', 'cancelled'],
      confirmed: ['in_progress', 'cancelled'],
      in_progress: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
    });
  });

  it('mọi chuyển được phép đều ok', () => {
    for (const from of ALL_STATUSES) {
      for (const to of TRANSITIONS[from]) {
        const result = evaluateTransition({
          from,
          to,
          doc: docFor(to),
        });
        expect(result.ok, `${from} → ${to} phải hợp lệ`).toBe(true);
      }
    }
  });

  it('pending → confirmed không cần điều kiện gì thêm', () => {
    const result = evaluateTransition({ from: 'pending', to: 'confirmed', doc: {} });
    expect(result).toEqual({ ok: true });
  });

  it('confirmed → in_progress không cần điều kiện tài xế', () => {
    const result = evaluateTransition({ from: 'confirmed', to: 'in_progress', doc: {} });
    expect(result).toEqual({ ok: true });
  });
});

describe('chuyển trạng thái không hợp lệ → INVALID_TRANSITION', () => {
  const invalidPairs: [string, string][] = [
    ['pending', 'assigned'],
    ['pending', 'in_progress'],
    ['pending', 'completed'],
    ['confirmed', 'pending'],
    ['confirmed', 'assigned'],
    ['confirmed', 'completed'],
    ['in_progress', 'confirmed'],
    ['in_progress', 'pending'],
    ['completed', 'pending'],
    ['completed', 'cancelled'],
    ['cancelled', 'pending'],
    ['cancelled', 'confirmed'],
  ];

  it('từ chối các cặp không nằm trong bảng', () => {
    for (const [from, to] of invalidPairs) {
      const result = evaluateTransition({ from, to, doc: docFor(to as BookingStatus) });
      expect(result.ok, `${from} → ${to} phải bị từ chối`).toBe(false);
      if (!result.ok) {
        expect(result.code).toBe('INVALID_TRANSITION');
        expect(result.message).toBe(`Không thể chuyển trạng thái từ "${from}" sang "${to}"`);
      }
    }
  });

  it('in_progress → cancelled được phép (mọi trạng thái chưa kết thúc → cancelled)', () => {
    const result = evaluateTransition({
      from: 'in_progress',
      to: 'cancelled',
      doc: { cancelReason: 'customer_cancel' },
    });
    expect(result.ok).toBe(true);
  });
});

describe('completed yêu cầu finalPrice + paymentMethod (FR-B02)', () => {
  it('thiếu finalPrice → field finalPrice', () => {
    const result = evaluateTransition({
      from: 'in_progress',
      to: 'completed',
      doc: { paymentMethod: 'cash' },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('VALIDATION_ERROR');
      expect(result.fields?.[0]?.field).toBe('finalPrice');
    }
  });

  it('finalPrice <= 0 hoặc không phải số → lỗi', () => {
    for (const finalPrice of [0, -1000, NaN, null, undefined] as any[]) {
      const result = evaluateTransition({
        from: 'in_progress',
        to: 'completed',
        doc: { finalPrice, paymentMethod: 'cash' },
      });
      expect(result.ok).toBe(false);
    }
  });

  it('thiếu paymentMethod hoặc không hợp lệ → field paymentMethod', () => {
    const missing = evaluateTransition({
      from: 'in_progress',
      to: 'completed',
      doc: { finalPrice: 400000 },
    });
    expect(missing.ok).toBe(false);
    if (!missing.ok) expect(missing.fields?.[0]?.field).toBe('paymentMethod');

    const invalid = evaluateTransition({
      from: 'in_progress',
      to: 'completed',
      doc: { finalPrice: 400000, paymentMethod: 'credit_card' },
    });
    expect(invalid.ok).toBe(false);
    if (!invalid.ok) expect(invalid.fields?.[0]?.field).toBe('paymentMethod');
  });

  it('đủ điều kiện (cash hoặc transfer) → ok', () => {
    for (const paymentMethod of ['cash', 'transfer'] as const) {
      const result = evaluateTransition({
        from: 'in_progress',
        to: 'completed',
        doc: { finalPrice: 450000, paymentMethod },
      });
      expect(result.ok).toBe(true);
    }
  });
});

describe('cancelled yêu cầu lý do (FR-B02)', () => {
  it('thiếu cancelReason → field cancelReason', () => {
    const result = evaluateTransition({ from: 'pending', to: 'cancelled', doc: {} });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('VALIDATION_ERROR');
      expect(result.fields?.[0]).toEqual({ field: 'cancelReason', message: 'Cần chọn lý do hủy.' });
    }
  });

  it('mỗi lý do trong bộ lý do đều hợp lệ (customer_cancel, unreachable, other)', () => {
    for (const cancelReason of ['customer_cancel', 'unreachable', 'other'] as const) {
      const result = evaluateTransition({ from: 'confirmed', to: 'cancelled', doc: { cancelReason } });
      expect(result.ok, cancelReason).toBe(true);
    }
  });

  it('lý do no_driver đã bị loại bỏ → từ chối với VALIDATION_ERROR', () => {
    const result = evaluateTransition({
      from: 'confirmed',
      to: 'cancelled',
      doc: { cancelReason: 'no_driver' },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('VALIDATION_ERROR');
      expect(result.fields?.[0]?.field).toBe('cancelReason');
    }
  });

  it('lý do ngoài bộ lý do → từ chối', () => {
    const result = evaluateTransition({
      from: 'confirmed',
      to: 'cancelled',
      doc: { cancelReason: 'changed_my_mind' },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fields?.[0]?.field).toBe('cancelReason');
  });
});

describe('noop cùng trạng thái', () => {
  it('pending → pending ok với cờ noop', () => {
    const result = evaluateTransition({ from: 'pending', to: 'pending', doc: {} });
    expect(result).toEqual({ ok: true, noop: true });
  });

  it('in_progress → in_progress không kiểm tra điều kiện (admin sửa trường khác)', () => {
    const result = evaluateTransition({ from: 'in_progress', to: 'in_progress', doc: {} });
    expect(result.ok).toBe(true);
  });

  it('completed → completed vẫn ok', () => {
    const result = evaluateTransition({ from: 'completed', to: 'completed', doc: {} });
    expect(result.ok).toBe(true);
  });
});

describe('statusLabelOf', () => {
  it('trả nhãn tiếng Việt đúng (dùng chung STATUS_LABELS)', () => {
    expect(statusLabelOf('pending')).toBe('Chờ xác nhận');
    expect(statusLabelOf('confirmed')).toBe('Đã xác nhận');
    expect(statusLabelOf('in_progress')).toBe('Đang trên đường');
    expect(statusLabelOf('completed')).toBe('Hoàn thành');
    expect(statusLabelOf('cancelled')).toBe('Đã hủy');
  });

  it('trạng thái lạ hoặc assigned cũ → Không xác định', () => {
    expect(statusLabelOf('assigned')).toBe('Không xác định');
    expect(statusLabelOf('unknown')).toBe('Không xác định');
    expect(statusLabelOf(null)).toBe('Không xác định');
  });
});

describe('buildHistoryEntry (FR-B03)', () => {
  it('có đủ from/to/by/at/note, at mặc định là now', () => {
    const before = Date.now();
    const entry = buildHistoryEntry({ from: 'pending', to: 'confirmed', by: 7, note: 'Gọi xác nhận' });
    const after = Date.now();
    expect(entry.from).toBe('pending');
    expect(entry.to).toBe('confirmed');
    expect(entry.by).toBe(7);
    expect(entry.note).toBe('Gọi xác nhận');
    expect(entry.at).toBeInstanceOf(Date);
    expect(entry.at.getTime()).toBeGreaterThanOrEqual(before);
    expect(entry.at.getTime()).toBeLessThanOrEqual(after);
  });

  it('at được truyền vào thì giữ nguyên; thiếu thì rỗng', () => {
    const at = new Date('2026-10-10T08:30:00+07:00');
    const entry = buildHistoryEntry({ from: 'confirmed', to: 'cancelled', at });
    expect(entry.at).toBe(at);
    expect(entry.note).toBe('');
    expect(entry.by).toBeNull();
  });
});
