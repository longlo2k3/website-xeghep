import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { StatusTransitionActions } from './StatusTransitionActions';
import { useAuth } from '@/context/AuthContext';
import { formatDateTime, formatVND, maskPhone } from '@/lib/utils';
import { statusLabelOf } from '@/lib/stateMachine';
import type { BookingDoc } from '@/types/bookings';
import {
  User,
  MapPin,
  FileText,
  CreditCard,
  ShieldCheck,
  History,
  Clock,
  ArrowRight,
} from 'lucide-react';

export interface BookingDetailModalProps {
  booking: BookingDoc | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated?: (updatedBooking: BookingDoc) => void;
}

export function BookingDetailModal({
  booking,
  isOpen,
  onClose,
  onStatusUpdated,
}: BookingDetailModalProps) {
  const { user } = useAuth();

  if (!booking) return null;

  const isEditor = user?.role === 'editor';
  const displayedPhone = isEditor
    ? maskPhone(booking.customerPhone)
    : booking.customerPhone;

  // Tên loại xe hiển thị
  const vehicleTypeMap: Record<string, string> = {
    '4cho': '4 chỗ',
    '5cho': '5 chỗ',
    '7cho': '7 chỗ',
    '16cho': '16 chỗ',
    guihang: 'Gửi hàng',
  };
  const vehicleLabel = vehicleTypeMap[booking.vehicleType] || booking.vehicleType;

  // Loại dịch vụ & hình thức
  const serviceLabel = booking.serviceType === 'parcel' ? 'Gửi hàng / Bưu phẩm' : 'Chở khách';
  const rideLabel =
    booking.rideType === 'ghep'
      ? 'Đi ghép (Tiết kiệm)'
      : booking.rideType === 'bao'
      ? 'Bao xe trọn gói'
      : 'Tiêu chuẩn';

  // Chiều sân bay
  const directionMap: Record<string, string> = {
    to_airport: 'Đi sân bay',
    from_airport: 'Đón tại sân bay',
    round_trip: 'Khứ hồi',
  };
  const directionLabel = booking.airportDirection
    ? directionMap[booking.airportDirection] || booking.airportDirection
    : null;


  // Lịch sử chuyển trạng thái
  const historyList = booking.statusHistory || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex flex-wrap items-center gap-3">
          <span>Chi tiết Đơn đặt xe #{booking.bookingCode || booking.id}</span>
          <StatusBadge status={booking.status} type="booking" />
        </div>
      }
      description={`Tạo lúc: ${formatDateTime(booking.createdAt)} • Cập nhật: ${formatDateTime(booking.updatedAt)}`}
      size="2xl"
      footer={
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          Đóng
        </Button>
      }
    >
      <div className="space-y-6 text-xs text-slate-700">
        {/* Khối Thao tác chuyển trạng thái */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Thao tác điều phối & Chuyển trạng thái</span>
          </div>
          <StatusTransitionActions
            booking={booking}
            onStatusUpdated={onStatusUpdated}
          />
        </div>

        {/* Khối Thông tin khách hàng & Chuyến đi (Grid 2 cột) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Thông tin khách hàng */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Thông tin Khách hàng</span>
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Họ và tên:</span>
                <span className="font-semibold text-slate-800">{booking.customerName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Số điện thoại:</span>
                <span
                  data-testid="detail-customer-phone"
                  className="font-mono font-medium text-emerald-600"
                >
                  {displayedPhone}
                </span>
              </div>
              <div className="pt-1">
                <span className="text-slate-500 block mb-1">Ghi chú của khách:</span>
                <p className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                  {booking.note || 'Không có ghi chú thêm từ khách hàng.'}
                </p>
              </div>
            </div>
          </div>

          {/* Thông tin chuyến đi */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Lộ trình & Chuyến đi</span>
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-start gap-2">
                <span className="text-slate-500 shrink-0">Điểm đón:</span>
                <span className="font-medium text-slate-800 text-right">
                  {booking.pickupLocation}
                </span>
              </div>
              <div className="flex justify-between items-start gap-2">
                <span className="text-slate-500 shrink-0">Điểm trả:</span>
                <span className="font-medium text-slate-800 text-right">
                  {booking.dropoffLocation}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Thời gian đón:</span>
                <span className="font-medium text-blue-600">
                  {formatDateTime(booking.pickupDatetime)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Loại xe / Dịch vụ:</span>
                <span className="text-slate-800">
                  {vehicleLabel} • {serviceLabel}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Hình thức / Số khách:</span>
                <span className="text-slate-800">
                  {rideLabel} {booking.passengerCount ? `(${booking.passengerCount} người)` : ''}
                </span>
              </div>
              {directionLabel && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Chiều sân bay:</span>
                  <span className="text-indigo-600">{directionLabel}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Khối Thanh toán & Điều phối (Grid 2 cột) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Thông tin thanh toán */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <CreditCard className="w-4 h-4 text-amber-600" />
              <span>Thông tin Thanh toán</span>
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Giá dự tính:</span>
                <span className="font-semibold text-slate-800">
                  {formatVND(booking.estimatedPrice)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Giá thực tế (final):</span>
                <span className="font-bold text-emerald-600 text-sm">
                  {booking.finalPrice ? formatVND(booking.finalPrice) : 'Chưa cập nhật'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Hình thức thanh toán:</span>
                <span className="text-slate-800">
                  {booking.paymentMethod === 'cash'
                    ? 'Tiền mặt'
                    : booking.paymentMethod === 'transfer'
                    ? 'Chuyển khoản'
                    : 'Chưa xác định'}
                </span>
              </div>
              {booking.depositAmount ? (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Đặt cọc trước:</span>
                  <span className="text-amber-600">{formatVND(booking.depositAmount)}</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Ghi chú điều phối & Lý do hủy */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <FileText className="w-4 h-4 text-purple-600" />
              <span>Ghi chú điều phối</span>
            </h4>
            <div className="space-y-2">
              <div>
                <span className="text-slate-500 block mb-1">Ghi chú điều phối (Dispatcher):</span>
                <p className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                  {booking.dispatcherNote || 'Không có ghi chú điều phối.'}
                </p>
              </div>
              {booking.cancelReason && (
                <div>
                  <span className="text-rose-600 font-semibold block mb-0.5">Lý do hủy đơn:</span>
                  <span className="text-rose-700">{booking.cancelReason}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Khối Lịch sử chuyển trạng thái (Status History Timeline) */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
          <h4 className="font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <History className="w-4 h-4 text-cyan-600" />
            <span>Lịch sử chuyển trạng thái ({historyList.length})</span>
          </h4>

          {historyList.length === 0 ? (
            <p className="text-slate-500 italic py-2">Chưa ghi nhận lịch sử chuyển trạng thái nào.</p>
          ) : (
            <div className="space-y-2.5 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200 pl-6 pt-1">
              {historyList.map((item, idx) => {
                const userBy =
                  item.by && typeof item.by === 'object'
                    ? item.by.fullName || item.by.email
                    : item.by
                    ? `Người dùng #${item.by}`
                    : 'Hệ thống';

                return (
                  <div key={item.id || idx} className="relative space-y-1">
                    <span className="absolute -left-[19px] top-1.5 w-2 h-2 rounded-full bg-blue-600 ring-4 ring-white" />
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="font-medium text-slate-600">
                        {statusLabelOf(item.from)}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="font-semibold text-slate-900">
                        {statusLabelOf(item.to)}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDateTime(item.at)}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500">Bởi: {userBy}</span>
                    </div>
                    {item.note && (
                      <p className="text-[11px] text-slate-600 italic bg-slate-50 p-1.5 rounded border border-slate-200">
                        {item.note}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default BookingDetailModal;
