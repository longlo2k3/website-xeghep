import { formatTier, vnd } from './formatTier';
import { matchRoute, norm } from './matchRoute';
import type { Ctx, Estimate, EstimateInput, PriceTier, Route } from './types';

export const NOTE_SHARE =
  'Đón trả tận nhà 2 chiều • Ghép tối đa 1–3 người trên xe, không nhồi nhét.';
const NOTE_CHARTER =
  'Xe riêng đón tận nhà, chủ động giờ đi, tài xế thân thiện, đã bao gồm chi phí đường bộ cơ bản.';
const NOTE_QUOTE =
  'Tổng đài sẽ gọi báo giá trọn gói ưu đãi nhất theo đúng lộ trình của bạn.';
const NEGOTIABLE_TIER: PriceTier = { min: null, max: null, from: false, negotiable: true };

type FromTierOpts = {
  pricingMode: Estimate['pricingMode'];
  unit: string;
  badge?: string;
  note: string;
  matchedRoute?: Route | null;
};

export function fromTier(t: PriceTier, opts: FromTierOpts): Estimate {
  const noPrice = t.negotiable || t.min == null;
  const priceType: Estimate['priceType'] = noPrice
    ? 'negotiable'
    : t.max != null
      ? 'range'
      : t.from
        ? 'from'
        : 'fixed';
  return {
    pricingMode: opts.pricingMode,
    priceType,
    matchedRoute: opts.matchedRoute
      ? { slug: opts.matchedRoute.slug, name: opts.matchedRoute.name }
      : null,
    estimatedMin: noPrice ? null : t.min,
    estimatedMax: noPrice ? null : t.max,
    estimatedPrice: noPrice ? null : t.min,
    displayPrice: formatTier(t, 'full'),
    unit: opts.unit,
    ...(opts.badge !== undefined ? { badge: opts.badge } : {}),
    note: opts.note,
  };
}

export function scale(t: PriceTier, factor: number): PriceTier {
  return {
    min: t.min == null ? null : t.min * factor,
    max: t.max == null ? null : t.max * factor,
    from: t.from,
    negotiable: t.negotiable,
  };
}

function quote(pricingMode: 'route', route: Route): Estimate {
  return {
    pricingMode,
    priceType: 'quote_required',
    matchedRoute: { slug: route.slug, name: route.name },
    estimatedMin: null,
    estimatedMax: null,
    estimatedPrice: null,
    displayPrice: 'Liên hệ báo giá',
    unit: '/ trọn chuyến (Xe 16 chỗ)',
    badge: 'Bao xe 16 chỗ',
    note: NOTE_QUOTE,
  };
}

export function estimate(i: EstimateInput, ctx: Ctx): Estimate {
  const { settings, routes, airport, rates } = ctx;

  if (i.vehicleType === 'guihang') {
    return fromTier(
      { min: settings.parcelFromPrice, max: null, from: true, negotiable: false },
      {
        pricingMode: 'parcel',
        unit: '/ kiện hàng',
        badge: 'Hỏa tốc trong ngày',
        note: `Giao nhận tận tay 2 đầu, phát hàng nhanh trong ${settings.parcelDeliveryText}.`,
      },
    );
  }

  const route = matchRoute(routes, i);
  if (route) {
    const n = i.passengerCount ?? 1;
    if (i.rideType !== 'bao') {
      if (n >= 3) {
        return fromTier(route.tiers.charter45, {
          pricingMode: 'route',
          matchedRoute: route,
          unit: '/ 3 khách (Khuyên bao xe)',
          badge: 'Tiết kiệm nhất khi bao xe',
          note: 'Từ 3 khách trở lên, bao trọn gói xe riêng để chủ động thời gian và tối ưu chi phí!',
        });
      }
      if (n === 2) {
        const t = route.tiers.share2 ?? scale(route.tiers.share1, 2);
        return fromTier(t, {
          pricingMode: 'route',
          matchedRoute: route,
          unit: '/ 2 khách',
          badge: 'Ưu đãi đi 2 người',
          note: NOTE_SHARE,
        });
      }
      return fromTier(route.tiers.share1, {
        pricingMode: 'route',
        matchedRoute: route,
        unit: '/ khách',
        badge: 'Ghép 1–3 khách/xe',
        note: NOTE_SHARE,
      });
    }
    if (i.vehicleType === '16cho') return quote('route', route);
    const t = i.vehicleType === '7cho' ? (route.tiers.charter7 ?? NEGOTIABLE_TIER) : route.tiers.charter45;
    return fromTier(t, {
      pricingMode: 'route',
      matchedRoute: route,
      unit: `/ trọn chuyến (Xe ${i.vehicleType.replace('cho', '')} chỗ)`,
      badge: i.vehicleType === '7cho' ? 'Bao xe 7 chỗ riêng' : 'Bao xe riêng đời mới',
      note: NOTE_CHARTER,
    });
  }

  if (/noi bai/.test(norm(`${i.pickup} ${i.dropoff}`)) && i.airportDistrict && i.airportDirection) {
    const col = (
      { '4cho': 'sedan5Seats', '5cho': 'sedan5Seats', '7cho': 'suv7Seats', '16cho': 'van16Seats' } as const
    )[i.vehicleType];
    const dir = (
      { to_airport: 'fromHanoiToAirport', from_airport: 'fromAirportToHanoi', round_trip: 'roundTrip' } as const
    )[i.airportDirection];
    const v = airport.find((a) => a.slug === i.airportDistrict)?.[dir]?.[col];
    if (v) {
      return fromTier(
        { min: v, max: null, from: false, negotiable: false },
        {
          pricingMode: 'airport',
          unit: '/ chuyến',
          badge: 'Đón tiễn sân bay Nội Bài',
          note: settings.tollsNoteShort,
        },
      );
    }
  }

  if (i.distanceKm && i.distanceKm > 0) {
    const km = i.distanceKm;
    const band = rates.find((r) => km >= r.minKm && (r.maxKm == null || km <= r.maxKm));
    if (band) {
      const col = i.vehicleType === '7cho' ? 'suv7Seats' : i.vehicleType === '16cho' ? 'van16Seats' : 'sedan5Seats';
      return fromTier(
        { min: Math.round(km * band[col]), max: null, from: false, negotiable: false },
        {
          pricingMode: 'distance',
          unit: `/ ${km} km`,
          badge: 'Tính theo km thực tế',
          note: settings.tollsNote,
        },
      );
    }
  }

  const sedanRates = rates.map((r) => r.sedan5Seats);
  const minPerKm = Math.min(...sedanRates);
  const maxPerKm = Math.max(...sedanRates);
  return {
    pricingMode: 'quote_required',
    priceType: 'quote_required',
    matchedRoute: null,
    estimatedMin: null,
    estimatedMax: null,
    estimatedPrice: null,
    displayPrice: `Chỉ từ ${vnd(minPerKm)} – ${vnd(maxPerKm)}`,
    unit: '/ km',
    badge: 'Tính theo km thực tế',
    note: NOTE_QUOTE,
    rateHint: { minPerKm, maxPerKm },
  };
}
