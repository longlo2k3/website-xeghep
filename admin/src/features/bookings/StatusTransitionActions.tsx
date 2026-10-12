import { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Play,
  CheckCheck,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { apiClient, getApiErrorMessage } from '@/lib/api-client';
import {
  TRANSITIONS,
  isTerminalStatus,
  CANCEL_REASONS,
  type CancelReason,
} from '@/lib/stateMachine';
import type { BookingDoc, PaymentMethod } from '@/types/bookings';

export interface StatusTransitionActionsProps {
  booking: BookingDoc;
  onStatusUpdated?: (updatedBooking: BookingDoc) => void;
  disabled?: boolean;
}

const CANCEL_REASON_OPTIONS: { value: CancelReason; label: string }[] = [
  { value: 'customer_cancel', label: 'Khách yêu cầu hủy' },
  { value: 'unreachable', label: 'Không liên lạc được khách' },
  { value: 'other', label: 'Lý do khác' },
];

export function StatusTransitionActions({
  booking,
  onStatusUpdated,
  disabled = false,
}: StatusTransitionActionsProps) {
  const currentStatus = booking.status;
  const allowedTransitions = TRANSITIONS[currentStatus] || [];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Modal: Hủy đơn
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState<CancelReason>('customer_cancel');
  const [cancelNote, setCancelNote] = useState('');
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Modal: Hoàn thành chuyến đi
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [finalPrice, setFinalPrice] = useState<string>(
    booking.finalPrice
      ? String(booking.finalPrice)
      : booking.estimatedPrice
      ? String(booking.estimatedPrice)
      : '',
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    booking.paymentMethod || 'cash',
  );
  const [completeNote, setCompleteNote] = useState('');
  const [completeError, setCompleteError] = useState<string | null>(null);

  // Helper thực hiện gọi PATCH chuyển trạng thái
  const executeTransition = async (
    targetStatus: string,
    extraPayload: Record<string, unknown> = {},
  ) => {
    try {
      setIsSubmitting(true);
      setActionError(null);

      const payload = {
        status: targetStatus,
        ...extraPayload,
      };

      const res = await apiClient.patch<{ doc: BookingDoc } | BookingDoc>(
        `/bookings/${booking.id}`,
        payload,
      );

      const updatedDoc =
        res.data && 'doc' in res.data ? (res.data as any).doc : (res.data as BookingDoc);

      if (onStatusUpdated) {
        onStatusUpdated(updatedDoc);
      }
      return true;
    } catch (err) {
      const msg = getApiErrorMessage(err);
      setActionError(msg);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Xác nhận đơn (pending -> confirmed)
  const handleConfirmBooking = async () => {
    await executeTransition('confirmed');
  };

  // 2. Bắt đầu chuyến đi (confirmed -> in_progress)
  const handleStartTrip = async () => {
    await executeTransition('in_progress');
  };

  // 3. Hoàn thành chuyến đi (in_progress -> completed)
  const handleConfirmComplete = async () => {
    setCompleteError(null);
    const priceNum = Number(finalPrice);
    if (!finalPrice || isNaN(priceNum) || priceNum <= 0) {
      setCompleteError('Cần nhập giá cuối cùng lớn hơn 0.');
      return;
    }

    const ok = await executeTransition('completed', {
      finalPrice: priceNum,
      paymentMethod,
      note: completeNote.trim() || undefined,
    });

    if (ok) {
      setIsCompleteModalOpen(false);
      setCompleteNote('');
    }
  };

  // 4. Hủy chuyến (* -> cancelled)
  const handleConfirmCancel = async () => {
    setCancelError(null);
    if (!CANCEL_REASONS.includes(cancelReason)) {
      setCancelError('Cần chọn lý do hủy.');
      return;
    }

    const ok = await executeTransition('cancelled', {
      cancelReason,
      note: cancelNote.trim() || undefined,
    });

    if (ok) {
      setIsCancelModalOpen(false);
      setCancelNote('');
    }
  };

  // Nếu trạng thái đã là terminal (completed / cancelled)
  if (isTerminalStatus(currentStatus)) {
    return (
      <div
        data-testid="terminal-status-notice"
        className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-center gap-2"
      >
        <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
        <span>Chuyến đi đã kết thúc</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {actionError && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {/* Pending: Xác nhận đơn */}
        {currentStatus === 'pending' && allowedTransitions.includes('confirmed') && (
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleConfirmBooking}
            disabled={disabled || isSubmitting}
            isLoading={isSubmitting}
            data-testid="action-confirm-booking"
            className="bg-blue-600 hover:bg-blue-500"
          >
            <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
            Xác nhận đơn
          </Button>
        )}

        {/* Confirmed: Bắt đầu chuyến đi */}
        {currentStatus === 'confirmed' && allowedTransitions.includes('in_progress') && (
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleStartTrip}
            disabled={disabled || isSubmitting}
            isLoading={isSubmitting}
            data-testid="action-start-trip"
            className="bg-indigo-600 hover:bg-indigo-500"
          >
            <Play className="w-3.5 h-3.5 mr-1.5" />
            Bắt đầu chạy
          </Button>
        )}

        {/* In Progress: Hoàn thành chuyến đi */}
        {currentStatus === 'in_progress' && allowedTransitions.includes('completed') && (
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => setIsCompleteModalOpen(true)}
            disabled={disabled || isSubmitting}
            data-testid="action-complete-trip"
            className="bg-emerald-600 hover:bg-emerald-500"
          >
            <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
            Hoàn thành
          </Button>
        )}

        {/* Mọi trạng thái chưa kết thúc: Cho phép hủy đơn */}
        {allowedTransitions.includes('cancelled') && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsCancelModalOpen(true)}
            disabled={disabled || isSubmitting}
            data-testid="action-cancel-booking"
            className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border-rose-500/30"
          >
            <XCircle className="w-3.5 h-3.5 mr-1.5" />
            Hủy đơn
          </Button>
        )}
      </div>

      {/* Modal: Hủy chuyến */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Hủy đơn đặt xe"
        description={`Xác nhận hủy đơn ${booking.bookingCode || '#' + booking.id}. Hành động này không thể hoàn tác.`}
        size="md"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCancelModalOpen(false)}
              disabled={isSubmitting}
            >
              Quay lại
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleConfirmCancel}
              disabled={isSubmitting}
              isLoading={isSubmitting}
              data-testid="confirm-cancel-btn"
            >
              Xác nhận hủy đơn
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {cancelError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {cancelError}
            </div>
          )}

          <Select
            label="Lý do hủy đơn"
            required
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value as CancelReason)}
            data-testid="cancel-reason-select"
            options={CANCEL_REASON_OPTIONS}
          />

          <Textarea
            label="Ghi chú bổ sung"
            placeholder="Chi tiết lý do hủy đơn nếu có..."
            value={cancelNote}
            onChange={(e) => setCancelNote(e.target.value)}
            rows={3}
            data-testid="cancel-note-input"
          />
        </div>
      </Modal>

      {/* Modal: Hoàn thành chuyến đi */}
      <Modal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        title="Hoàn thành chuyến đi"
        description="Xác nhận số tiền thực tế thu của khách và hình thức thanh toán."
        size="md"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCompleteModalOpen(false)}
              disabled={isSubmitting}
            >
              Quay lại
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleConfirmComplete}
              disabled={isSubmitting}
              isLoading={isSubmitting}
              data-testid="confirm-complete-btn"
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              Xác nhận hoàn thành
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {completeError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {completeError}
            </div>
          )}

          <Input
            label="Số tiền thu thực tế (VND)"
            required
            type="number"
            min={1}
            step={1000}
            placeholder="Ví dụ: 450000"
            value={finalPrice}
            onChange={(e) => setFinalPrice(e.target.value)}
            data-testid="final-price-input"
          />

          <Select
            label="Hình thức thanh toán"
            required
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            data-testid="payment-method-select"
            options={[
              { value: 'cash', label: 'Tiền mặt' },
              { value: 'transfer', label: 'Chuyển khoản ngân hàng' },
            ]}
          />

          <Textarea
            label="Ghi chú hoàn thành"
            placeholder="Ghi chú về việc thu tiền hoặc chuyến đi nếu có..."
            value={completeNote}
            onChange={(e) => setCompleteNote(e.target.value)}
            rows={2}
            data-testid="complete-note-input"
          />
        </div>
      </Modal>
    </div>
  );
}
