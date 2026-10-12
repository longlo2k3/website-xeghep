import { describe, expect, it } from 'vitest';

import { escapeHtml } from '../src/lib/notify/escapeHtml';
import { buildBookingMessage } from '../src/lib/notify/message';
import { nextRetryDelayMs, shouldFallbackToEmail } from '../src/lib/notify/worker';

const baseBooking = {
  bookingCode: 'XG-261010-K7M2QX',
  customerName: 'Nguyễn Tuấn Anh',
  customerPhone: '0962298293',
  route: { name: 'Hải Phòng ⇄ Hà Nội ⇄ Nội Bài', slug: 'hai-phong-ha-noi-noi-bai' },
  serviceType: 'passenger',
  pickupLocation: 'Quán Toan, Hồng Bàng, Hải Phòng',
  dropoffLocation: 'Sảnh T1 Sân bay Nội Bài',
  rideType: 'ghep',
  vehicleType: '4cho',
  passengerCount: 1,
  pickupDatetime: '2026-10-10T01:30:00.000Z',
  priceType: 'fixed',
  estimatedPrice: 400000,
  estimatedPriceMax: null,
  note: 'Bay chuyến 11h20 trưa, có 1 vali kéo nhỏ',
};

describe('escapeHtml', () => {
  it('escape &, <, >, " của dữ liệu khách', () => {
    expect(escapeHtml('a & b < c > d " e')).toBe('a &amp; b &lt; c &gt; d &quot; e');
    expect(escapeHtml('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;',
    );
    expect(escapeHtml('&<>"')).toBe('&amp;&lt;&gt;&quot;');
  });

  it('giữ nguyên tiếng Việt có dấu', () => {
    expect(escapeHtml('Đà Nẵng – Nội Bài, 100% giá trị')).toBe(
      'Đà Nẵng – Nội Bài, 100% giá trị',
    );
    expect(escapeHtml('Nguyễn Tuấn Anh')).toBe('Nguyễn Tuấn Anh');
  });

  it('& được escape trước để không sinh entity sai', () => {
    expect(escapeHtml('&lt;')).toBe('&amp;lt;');
  });
});

describe('buildBookingMessage — mẫu mục 3.3', () => {
  it('đủ mẫu: mã, khách, SĐT, tuyến, điểm, giờ đón, hình thức, giá, ghi chú, link', () => {
    const text = buildBookingMessage(baseBooking, {});
    expect(text).toContain(
      '🚨 <b>CÓ ĐƠN ĐẶT XE MỚI — MÃ: XG-261010-K7M2QX</b>',
    );
    expect(text).toContain('👤 <b>Khách hàng:</b> Nguyễn Tuấn Anh');
    expect(text).toContain('📞 <b>SĐT:</b> 0962298293');
    expect(text).toContain('🛣 <b>Tuyến:</b> Hải Phòng ⇄ Hà Nội ⇄ Nội Bài');
    expect(text).toContain('📍 <b>Điểm đón:</b> Quán Toan, Hồng Bàng, Hải Phòng');
    expect(text).toContain('🏁 <b>Điểm đến:</b> Sảnh T1 Sân bay Nội Bài');
    expect(text).toContain('⏰ <b>Giờ đón:</b> 08:30 ngày 10/10/2026');
    expect(text).toContain('🚗 <b>Hình thức:</b> Đi ghép (1 khách) — Xe 4 chỗ');
    expect(text).toContain('💵 <b>Giá tạm tính:</b> 400.000đ');
    expect(text).toContain('📝 <b>Ghi chú:</b> Bay chuyến 11h20 trưa, có 1 vali kéo nhỏ');
    expect(text).toContain(
      '👉 Phân xe: https://xegheplientinh.vn/admin/collections/bookings/XG-261010-K7M2QX',
    );
  });

  it('giờ đón hiển thị theo Asia/Ho_Chi_Minh', () => {
    const text = buildBookingMessage(
      { ...baseBooking, pickupDatetime: '2026-10-09T17:45:00.000Z' },
      {},
    );
    expect(text).toContain('00:45 ngày 10/10/2026');
  });

  it('dùng siteUrl từ ctx cho link phân xe', () => {
    const text = buildBookingMessage(baseBooking, { siteUrl: 'https://staging.example.vn' });
    expect(text).toContain(
      'https://staging.example.vn/admin/collections/bookings/XG-261010-K7M2QX',
    );
    expect(text).not.toContain('https://xegheplientinh.vn/admin');
  });

  it('hình thức: bao xe và gửi hàng', () => {
    const bao = buildBookingMessage(
      { ...baseBooking, rideType: 'bao', vehicleType: '7cho', passengerCount: 3 },
      {},
    );
    expect(bao).toContain('🚗 <b>Hình thức:</b> Bao xe — Xe 7 chỗ');

    const parcel = buildBookingMessage(
      {
        ...baseBooking,
        serviceType: 'parcel',
        rideType: null,
        vehicleType: 'guihang',
        passengerCount: null,
      },
      {},
    );
    expect(parcel).toContain('🚗 <b>Hình thức:</b> Gửi hàng');
  });

  it('giá cố định kèm khoảng giá khi có estimatedPriceMax', () => {
    const text = buildBookingMessage(
      { ...baseBooking, priceType: 'range', estimatedPrice: 400000, estimatedPriceMax: 500000 },
      {},
    );
    expect(text).toContain('400.000đ (khoảng giá: 400.000đ – 500.000đ)');
  });

  it('priceType negotiable / quote_required → CẦN BÁO GIÁ', () => {
    for (const priceType of ['negotiable', 'quote_required']) {
      const text = buildBookingMessage(
        { ...baseBooking, priceType, estimatedPrice: null, estimatedPriceMax: null },
        {},
      );
      expect(text, priceType).toContain('💵 <b>Giá tạm tính:</b> CẦN BÁO GIÁ');
      expect(text, priceType).not.toContain('400.000đ');
    }
  });

  it('không có dòng ghi chú khi note rỗng', () => {
    const text = buildBookingMessage({ ...baseBooking, note: '' }, {});
    expect(text).not.toContain('📝 <b>Ghi chú:</b>');
    const nullNote = buildBookingMessage({ ...baseBooking, note: null }, {});
    expect(nullNote).not.toContain('📝 <b>Ghi chú:</b>');
  });

  it('escape toàn bộ dữ liệu do khách nhập', () => {
    const text = buildBookingMessage(
      {
        ...baseBooking,
        customerName: '<b>KH</b> & "test"',
        pickupLocation: '<img src=x onerror=alert(1)>',
        note: '<a href="http://spam">click</a>',
      },
      {},
    );
    expect(text).toContain('&lt;b&gt;KH&lt;/b&gt; &amp; &quot;test&quot;');
    expect(text).not.toContain('<b>KH</b>');
    expect(text).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(text).toContain('&lt;a href=&quot;http://spam&quot;&gt;click&lt;/a&gt;');
  });

  it('tuyến custom (route null) không làm hỏng thông báo', () => {
    const text = buildBookingMessage({ ...baseBooking, route: null }, {});
    expect(text).toContain('🛣 <b>Tuyến:</b> Tuyến khác');
    expect(text).toContain('🚨 <b>CÓ ĐƠN ĐẶT XE MỚI — MÃ: XG-261010-K7M2QX</b>');
  });
});

describe('lịch retry 5s / 30s / 2 phút (FR-B04)', () => {
  it('lần 1 → 5s, lần 2 → 30s, lần 3 → 2 phút', () => {
    expect(nextRetryDelayMs(1)).toBe(5000);
    expect(nextRetryDelayMs(2)).toBe(30_000);
    expect(nextRetryDelayMs(3)).toBe(120_000);
  });

  it('lần ≥ 4 → null (dừng retry)', () => {
    expect(nextRetryDelayMs(4)).toBeNull();
    expect(nextRetryDelayMs(10)).toBeNull();
  });

  it('email dự phòng khi đủ 3 lần lỗi và chưa thông báo', () => {
    expect(shouldFallbackToEmail(3, null)).toBe(true);
    expect(shouldFallbackToEmail(4, null)).toBe(true);
    expect(shouldFallbackToEmail(3, new Date())).toBe(false);
    expect(shouldFallbackToEmail(2, null)).toBe(false);
    expect(shouldFallbackToEmail(0, null)).toBe(false);
  });
});
