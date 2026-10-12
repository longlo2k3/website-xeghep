import { describe, it, expect } from 'vitest';
import {
  TRANSITIONS,
  STATUS_LABELS,
  STATUS_COLORS,
  CANCEL_REASONS,
  getAllowedTransitions,
  isTerminalStatus,
  statusLabelOf,
  evaluateTransition,
  type BookingStatus,
} from '@/lib/stateMachine';

describe('Booking State Machine (admin/src/lib/stateMachine.ts)', () => {
  describe('TRANSITIONS & getAllowedTransitions', () => {
    it('khai báo đầy đủ các bước chuyển trong TRANSITIONS map (không có driver/assigned)', () => {
      expect(TRANSITIONS.pending).toEqual(['confirmed', 'cancelled']);
      expect(TRANSITIONS.confirmed).toEqual(['in_progress', 'cancelled']);
      expect(TRANSITIONS.in_progress).toEqual(['completed', 'cancelled']);
      expect(TRANSITIONS.completed).toEqual([]);
      expect(TRANSITIONS.cancelled).toEqual([]);
    });

    it('cho phép pending chuyển sang confirmed hoặc cancelled', () => {
      expect(getAllowedTransitions('pending')).toEqual(['confirmed', 'cancelled']);
    });

    it('cho phép confirmed chuyển sang in_progress hoặc cancelled', () => {
      expect(getAllowedTransitions('confirmed')).toEqual(['in_progress', 'cancelled']);
    });

    it('cho phép in_progress chuyển sang completed hoặc cancelled', () => {
      expect(getAllowedTransitions('in_progress')).toEqual(['completed', 'cancelled']);
    });

    it('completed là terminal state không cho phép chuyển tiếp', () => {
      expect(getAllowedTransitions('completed')).toEqual([]);
    });

    it('cancelled là terminal state không cho phép chuyển tiếp', () => {
      expect(getAllowedTransitions('cancelled')).toEqual([]);
    });
  });

  describe('isTerminalStatus', () => {
    it('nhận diện đúng các terminal states', () => {
      expect(isTerminalStatus('completed')).toBe(true);
      expect(isTerminalStatus('cancelled')).toBe(true);
      expect(isTerminalStatus('pending')).toBe(false);
      expect(isTerminalStatus('confirmed')).toBe(false);
      expect(isTerminalStatus('in_progress')).toBe(false);
    });
  });

  describe('STATUS_LABELS & statusLabelOf', () => {
    it('trả về đúng nhãn tiếng Việt cho tất cả các trạng thái', () => {
      expect(STATUS_LABELS.pending).toBe('Chờ xác nhận');
      expect(STATUS_LABELS.confirmed).toBe('Đã xác nhận');
      expect(STATUS_LABELS.in_progress).toBe('Đang chạy');
      expect(STATUS_LABELS.completed).toBe('Hoàn thành');
      expect(STATUS_LABELS.cancelled).toBe('Đã hủy');
    });

    it('statusLabelOf trả về nhãn hoặc "Không xác định"', () => {
      expect(statusLabelOf('pending')).toBe('Chờ xác nhận');
      expect(statusLabelOf('unknown' as BookingStatus)).toBe('Không xác định');
      expect(statusLabelOf('assigned' as BookingStatus)).toBe('Không xác định');
      expect(statusLabelOf(null)).toBe('Không xác định');
      expect(statusLabelOf(undefined)).toBe('Không xác định');
    });
  });

  describe('STATUS_COLORS', () => {
    it('đầy đủ màu badge cho cả 5 trạng thái', () => {
      const statuses: BookingStatus[] = [
        'pending',
        'confirmed',
        'in_progress',
        'completed',
        'cancelled',
      ];
      for (const st of statuses) {
        expect(STATUS_COLORS[st]).toBeDefined();
        expect(typeof STATUS_COLORS[st]).toBe('string');
        expect(STATUS_COLORS[st].length).toBeGreaterThan(0);
      }
    });
  });

  describe('evaluateTransition', () => {
    it('trả về noop khi trạng thái đích giống trạng thái gốc', () => {
      const res = evaluateTransition({ from: 'pending', to: 'pending' });
      expect(res).toEqual({ ok: true, noop: true });
    });

    describe('Kiểm tra các bước chuyển không hợp lệ (INVALID_TRANSITION)', () => {
      it('chặn nhảy cóc từ pending sang in_progress hoặc completed', () => {
        const res1 = evaluateTransition({ from: 'pending', to: 'in_progress' });
        expect(res1.ok).toBe(false);
        if (!res1.ok) {
          expect(res1.code).toBe('INVALID_TRANSITION');
        }

        const res2 = evaluateTransition({ from: 'pending', to: 'completed' });
        expect(res2.ok).toBe(false);
        if (!res2.ok) {
          expect(res2.code).toBe('INVALID_TRANSITION');
        }
      });

      it('chặn chuyển từ completed sang bất kỳ trạng thái nào khác', () => {
        const res = evaluateTransition({ from: 'completed', to: 'pending' });
        expect(res.ok).toBe(false);
        if (!res.ok) {
          expect(res.code).toBe('INVALID_TRANSITION');
        }
      });

      it('chặn chuyển từ cancelled sang bất kỳ trạng thái nào khác', () => {
        const res = evaluateTransition({ from: 'cancelled', to: 'confirmed' });
        expect(res.ok).toBe(false);
        if (!res.ok) {
          expect(res.code).toBe('INVALID_TRANSITION');
        }
      });

      it('chặn trạng thái không hợp lệ', () => {
        const res = evaluateTransition({ from: 'invalid_status', to: 'confirmed' });
        expect(res.ok).toBe(false);
        if (!res.ok) {
          expect(res.code).toBe('INVALID_TRANSITION');
        }
      });
    });

    describe('Chuyển sang confirmed', () => {
      it('cho phép chuyển từ pending sang confirmed', () => {
        const res = evaluateTransition({ from: 'pending', to: 'confirmed' });
        expect(res).toEqual({ ok: true });
      });
    });

    describe('Chuyển sang in_progress', () => {
      it('cho phép chuyển từ confirmed sang in_progress không cần driver', () => {
        const res = evaluateTransition({
          from: 'confirmed',
          to: 'in_progress',
          doc: {},
        });
        expect(res).toEqual({ ok: true });
      });
    });

    describe('Chuyển sang completed', () => {
      it('báo lỗi VALIDATION_ERROR nếu thiếu finalPrice hoặc finalPrice <= 0', () => {
        const resMissingPrice = evaluateTransition({
          from: 'in_progress',
          to: 'completed',
          doc: { paymentMethod: 'cash' },
        });
        expect(resMissingPrice.ok).toBe(false);
        if (!resMissingPrice.ok) {
          expect(resMissingPrice.code).toBe('VALIDATION_ERROR');
          expect(resMissingPrice.fields?.some((f) => f.field === 'finalPrice')).toBe(true);
        }

        const resZeroPrice = evaluateTransition({
          from: 'in_progress',
          to: 'completed',
          doc: { finalPrice: 0, paymentMethod: 'cash' },
        });
        expect(resZeroPrice.ok).toBe(false);
        if (!resZeroPrice.ok) {
          expect(resZeroPrice.code).toBe('VALIDATION_ERROR');
          expect(resZeroPrice.fields?.some((f) => f.field === 'finalPrice')).toBe(true);
        }
      });

      it('báo lỗi VALIDATION_ERROR nếu thiếu hoặc sai paymentMethod', () => {
        const resMissingPayment = evaluateTransition({
          from: 'in_progress',
          to: 'completed',
          doc: { finalPrice: 500000 },
        });
        expect(resMissingPayment.ok).toBe(false);
        if (!resMissingPayment.ok) {
          expect(resMissingPayment.code).toBe('VALIDATION_ERROR');
          expect(resMissingPayment.fields?.some((f) => f.field === 'paymentMethod')).toBe(true);
        }

        const resInvalidPayment = evaluateTransition({
          from: 'in_progress',
          to: 'completed',
          doc: { finalPrice: 500000, paymentMethod: 'paypal' },
        });
        expect(resInvalidPayment.ok).toBe(false);
        if (!resInvalidPayment.ok) {
          expect(resInvalidPayment.code).toBe('VALIDATION_ERROR');
          expect(resInvalidPayment.fields?.some((f) => f.field === 'paymentMethod')).toBe(true);
        }
      });

      it('cho phép chuyển sang completed khi đủ finalPrice và paymentMethod', () => {
        const resCash = evaluateTransition({
          from: 'in_progress',
          to: 'completed',
          doc: { finalPrice: 450000, paymentMethod: 'cash' },
        });
        expect(resCash).toEqual({ ok: true });

        const resTransfer = evaluateTransition({
          from: 'in_progress',
          to: 'completed',
          doc: { finalPrice: 450000, paymentMethod: 'transfer' },
        });
        expect(resTransfer).toEqual({ ok: true });
      });
    });

    describe('Chuyển sang cancelled', () => {
      it('báo lỗi VALIDATION_ERROR nếu thiếu lý do hủy hoặc lý do không nằm trong CANCEL_REASONS', () => {
        const resMissing = evaluateTransition({
          from: 'pending',
          to: 'cancelled',
          doc: {},
        });
        expect(resMissing.ok).toBe(false);
        if (!resMissing.ok) {
          expect(resMissing.code).toBe('VALIDATION_ERROR');
          expect(resMissing.fields?.some((f) => f.field === 'cancelReason')).toBe(true);
        }

        const resInvalid = evaluateTransition({
          from: 'pending',
          to: 'cancelled',
          doc: { cancelReason: 'unsupported_reason' },
        });
        expect(resInvalid.ok).toBe(false);
        if (!resInvalid.ok) {
          expect(resInvalid.code).toBe('VALIDATION_ERROR');
          expect(resInvalid.fields?.some((f) => f.field === 'cancelReason')).toBe(true);
        }

        const resNoDriver = evaluateTransition({
          from: 'confirmed',
          to: 'cancelled',
          doc: { cancelReason: 'no_driver' },
        });
        expect(resNoDriver.ok).toBe(false);
        if (!resNoDriver.ok) {
          expect(resNoDriver.code).toBe('VALIDATION_ERROR');
          expect(resNoDriver.fields?.some((f) => f.field === 'cancelReason')).toBe(true);
        }
      });

      it('cho phép hủy khi có lý do hợp lệ từ các trạng thái non-terminal', () => {
        for (const reason of CANCEL_REASONS) {
          const res = evaluateTransition({
            from: 'pending',
            to: 'cancelled',
            doc: { cancelReason: reason },
          });
          expect(res).toEqual({ ok: true });
        }
      });
    });
  });
});
