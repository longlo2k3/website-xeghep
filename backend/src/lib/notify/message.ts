import { vnd } from '../pricing/formatTier';
import { toVietnamIso } from '../api/serialize';
import { escapeHtml } from './escapeHtml';

export const DEFAULT_SITE_URL = 'https://xegheplientinh.vn';

export type MessageRoute = { name?: string | null; slug?: string | null } | number | null | undefined;

export type MessageBooking = {
  bookingCode?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  route?: MessageRoute;
  serviceType?: string | null;
  pickupLocation?: string | null;
  dropoffLocation?: string | null;
  rideType?: string | null;
  vehicleType?: string | null;
  passengerCount?: number | null;
  pickupDatetime?: string | Date | null;
  priceType?: string | null;
  estimatedPrice?: number | null;
  estimatedPriceMax?: number | null;
  note?: string | null;
};

export type MessageCtx = { siteUrl?: string };

const VEHICLE_LABELS: Record<string, string> = {
  '4cho': 'Xe 4 chỗ',
  '5cho': 'Xe 5 chỗ',
  '7cho': 'Xe 7 chỗ',
  '16cho': 'Xe 16 chỗ',
  guihang: 'Gửi hàng',
};

const SEPARATOR = '━━━━━━━━━━━━━━━━━━━━';

function routeName(route: MessageRoute): string {
  if (route && typeof route === 'object') return route.name || route.slug || 'Tuyến khác';
  return 'Tuyến khác';
}

export function formatPickupVietnam(value: string | Date | null | undefined): string {
  if (value == null || value === '') return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const iso = toVietnamIso(date);
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(iso);
  if (!m) return iso;
  const [, year, month, day, hour, minute] = m;
  return `${hour}:${minute} ngày ${day}/${month}/${year}`;
}

export function formatFormLine(b: MessageBooking): string {
  const vehicle = VEHICLE_LABELS[String(b.vehicleType ?? '')] ?? 'Xe';
  if (b.serviceType === 'parcel' || b.vehicleType === 'guihang') return 'Gửi hàng';
  if (b.rideType === 'bao') return `Bao xe — ${vehicle}`;
  const count = Number.isFinite(Number(b.passengerCount)) ? Number(b.passengerCount) : 1;
  return `Đi ghép (${count} khách) — ${vehicle}`;
}

export function formatPriceLine(b: MessageBooking): string {
  const noPrice = b.priceType === 'negotiable' || b.priceType === 'quote_required';
  if (noPrice || b.estimatedPrice == null) return 'CẦN BÁO GIÁ';
  const base = vnd(Number(b.estimatedPrice));
  if (b.estimatedPriceMax != null) {
    return `${base} (khoảng giá: ${base} – ${vnd(Number(b.estimatedPriceMax))})`;
  }
  return base;
}

export function buildBookingMessage(booking: MessageBooking, ctx: MessageCtx = {}): string {
  const siteUrl = (ctx.siteUrl || DEFAULT_SITE_URL).replace(/\/+$/, '');
  const code = escapeHtml(booking.bookingCode ?? '');
  const lines = [
    `🚨 <b>CÓ ĐƠN ĐẶT XE MỚI — MÃ: ${code}</b>`,
    SEPARATOR,
    `👤 <b>Khách hàng:</b> ${escapeHtml(booking.customerName ?? '')}`,
    `📞 <b>SĐT:</b> ${escapeHtml(booking.customerPhone ?? '')}`,
    `🛣 <b>Tuyến:</b> ${escapeHtml(routeName(booking.route))}`,
    `📍 <b>Điểm đón:</b> ${escapeHtml(booking.pickupLocation ?? '')}`,
    `🏁 <b>Điểm đến:</b> ${escapeHtml(booking.dropoffLocation ?? '')}`,
    `⏰ <b>Giờ đón:</b> ${escapeHtml(formatPickupVietnam(booking.pickupDatetime))}`,
    `🚗 <b>Hình thức:</b> ${escapeHtml(formatFormLine(booking))}`,
    `💵 <b>Giá tạm tính:</b> ${escapeHtml(formatPriceLine(booking))}`,
  ];
  const note = String(booking.note ?? '').trim();
  if (note) lines.push(`📝 <b>Ghi chú:</b> ${escapeHtml(note)}`);
  lines.push(SEPARATOR, `👉 Phân xe: ${siteUrl}/admin/collections/bookings/${code}`);
  return lines.join('\n');
}
