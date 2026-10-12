import { describe, expect, it } from 'vitest';
import { estimate, scale } from '../src/lib/pricing/estimate';
import { matchRoute, norm } from '../src/lib/pricing/matchRoute';
import type { Ctx, EstimateInput } from '../src/lib/pricing/types';
import { activeRoutes, airportFixtures, defaultSettings, rateFixtures, routeFixtures } from './fixtures';

const ctx: Ctx = {
  settings: defaultSettings,
  routes: routeFixtures,
  airport: airportFixtures,
  rates: rateFixtures,
};

const CUSTOM_PLACE: Pick<EstimateInput, 'pickup' | 'dropoff'> = {
  pickup: 'Địa điểm tự nhập A',
  dropoff: 'Địa điểm tự nhập B',
};

type GoldenCase = {
  id: string;
  input: EstimateInput;
  pricingMode: string;
  priceType: string;
  estimatedMin: number | null;
  estimatedMax: number | null;
  displayPrice: string;
  unit?: string;
  routeSlug?: string | null;
};

const CASES: GoldenCase[] = [
  {
    id: 'A1',
    input: { pickup: 'Hải Phòng', dropoff: 'Hà Nội', routeSlug: 'hai-phong-ha-noi-noi-bai', rideType: 'ghep', vehicleType: '4cho', passengerCount: 1 },
    pricingMode: 'route',
    priceType: 'fixed',
    estimatedMin: 400000,
    estimatedMax: null,
    displayPrice: '400.000đ',
    unit: '/ khách',
    routeSlug: 'hai-phong-ha-noi-noi-bai',
  },
  {
    id: 'A2',
    input: { pickup: 'Hải Phòng', dropoff: 'Hà Nội', routeSlug: 'hai-phong-ha-noi-noi-bai', rideType: 'ghep', vehicleType: '4cho', passengerCount: 2 },
    pricingMode: 'route',
    priceType: 'fixed',
    estimatedMin: 700000,
    estimatedMax: null,
    displayPrice: '700.000đ',
    unit: '/ 2 khách',
    routeSlug: 'hai-phong-ha-noi-noi-bai',
  },
  {
    id: 'A3',
    input: { pickup: 'Hải Phòng', dropoff: 'Hà Nội', routeSlug: 'hai-phong-ha-noi-noi-bai', rideType: 'ghep', vehicleType: '4cho', passengerCount: 3 },
    pricingMode: 'route',
    priceType: 'from',
    estimatedMin: 899000,
    estimatedMax: null,
    displayPrice: 'từ 899.000đ',
    routeSlug: 'hai-phong-ha-noi-noi-bai',
  },
  {
    id: 'A4',
    input: { pickup: 'Hải Phòng', dropoff: 'Hà Nội', routeSlug: 'hai-phong-ha-noi-noi-bai', rideType: 'bao', vehicleType: '7cho' },
    pricingMode: 'route',
    priceType: 'from',
    estimatedMin: 999000,
    estimatedMax: null,
    displayPrice: 'từ 999.000đ',
    routeSlug: 'hai-phong-ha-noi-noi-bai',
  },
  {
    id: 'A5',
    input: { pickup: 'Hải Phòng', dropoff: 'Hạ Long', routeSlug: 'hai-phong-ha-long', rideType: 'ghep', vehicleType: '4cho', passengerCount: 1 },
    pricingMode: 'route',
    priceType: 'range',
    estimatedMin: 250000,
    estimatedMax: 300000,
    displayPrice: '250.000đ – 300.000đ',
    routeSlug: 'hai-phong-ha-long',
  },
  {
    id: 'A6',
    input: { pickup: 'Hải Phòng', dropoff: 'Hạ Long', routeSlug: 'hai-phong-ha-long', rideType: 'bao', vehicleType: '4cho' },
    pricingMode: 'route',
    priceType: 'range',
    estimatedMin: 400000,
    estimatedMax: 500000,
    displayPrice: '400.000đ – 500.000đ',
    routeSlug: 'hai-phong-ha-long',
  },
  {
    id: 'A7',
    input: { pickup: 'Hải Phòng', dropoff: 'Hải Dương', routeSlug: 'hai-phong-hai-duong', rideType: 'bao', vehicleType: '7cho' },
    pricingMode: 'route',
    priceType: 'negotiable',
    estimatedMin: null,
    estimatedMax: null,
    displayPrice: 'Liên hệ thỏa thuận',
    routeSlug: 'hai-phong-hai-duong',
  },
  {
    id: 'A8',
    input: { pickup: 'Hải Phòng', dropoff: 'Thái Nguyên', routeSlug: 'hai-phong-thai-nguyen', rideType: 'bao', vehicleType: '5cho' },
    pricingMode: 'route',
    priceType: 'fixed',
    estimatedMin: 1400000,
    estimatedMax: null,
    displayPrice: '1.400.000đ',
    routeSlug: 'hai-phong-thai-nguyen',
  },
  {
    id: 'A9',
    input: { pickup: 'Hà Nội', dropoff: 'Móng Cái', routeSlug: 'ha-noi-mong-cai', rideType: 'bao', vehicleType: '4cho' },
    pricingMode: 'route',
    priceType: 'range',
    estimatedMin: 2200000,
    estimatedMax: 2400000,
    displayPrice: '2.200.000đ – 2.400.000đ',
    routeSlug: 'ha-noi-mong-cai',
  },
  {
    id: 'A10',
    input: { pickup: 'Móng Cái', dropoff: 'Hải Phòng', rideType: 'ghep', vehicleType: '4cho', passengerCount: 1 },
    pricingMode: 'route',
    priceType: 'range',
    estimatedMin: 500000,
    estimatedMax: 600000,
    displayPrice: '500.000đ – 600.000đ',
    routeSlug: 'hai-phong-mong-cai',
  },
  {
    id: 'A11',
    input: { pickup: 'Hải Phòng', dropoff: 'Hà Nội', routeSlug: 'hai-phong-ha-noi-noi-bai', vehicleType: 'guihang' },
    pricingMode: 'parcel',
    priceType: 'from',
    estimatedMin: 150000,
    estimatedMax: null,
    displayPrice: 'từ 150.000đ',
    unit: '/ kiện hàng',
    routeSlug: null,
  },
  {
    id: 'A12',
    input: {
      pickup: 'Quận Cầu Giấy',
      dropoff: 'Sân bay Nội Bài',
      vehicleType: '4cho',
      airportDistrict: 'quan-cau-giay',
      airportDirection: 'to_airport',
    },
    pricingMode: 'airport',
    priceType: 'fixed',
    estimatedMin: 190000,
    estimatedMax: null,
    displayPrice: '190.000đ',
    routeSlug: null,
  },
  {
    id: 'A13',
    input: {
      pickup: 'Sân bay Nội Bài',
      dropoff: 'Quận Hà Đông',
      vehicleType: '7cho',
      airportDistrict: 'quan-ha-dong',
      airportDirection: 'from_airport',
    },
    pricingMode: 'airport',
    priceType: 'fixed',
    estimatedMin: 330000,
    estimatedMax: null,
    displayPrice: '330.000đ',
    routeSlug: null,
  },
  {
    id: 'A14',
    input: {
      pickup: 'Hà Nội',
      dropoff: 'Sân bay Nội Bài',
      vehicleType: '16cho',
      airportDistrict: 'quan-ha-dong',
      airportDirection: 'round_trip',
    },
    pricingMode: 'airport',
    priceType: 'fixed',
    estimatedMin: 1000000,
    estimatedMax: null,
    displayPrice: '1.000.000đ',
    routeSlug: null,
  },
  {
    id: 'A15',
    input: { ...CUSTOM_PLACE, routeSlug: 'custom', vehicleType: '4cho', distanceKm: 25 },
    pricingMode: 'distance',
    priceType: 'fixed',
    estimatedMin: 275000,
    estimatedMax: null,
    displayPrice: '275.000đ',
    unit: '/ 25 km',
    routeSlug: null,
  },
  {
    id: 'A16',
    input: { ...CUSTOM_PLACE, routeSlug: 'custom', vehicleType: '4cho', distanceKm: 80 },
    pricingMode: 'distance',
    priceType: 'fixed',
    estimatedMin: 760000,
    estimatedMax: null,
    displayPrice: '760.000đ',
    routeSlug: null,
  },
  {
    id: 'A17',
    input: { ...CUSTOM_PLACE, routeSlug: 'custom', vehicleType: '7cho', distanceKm: 250 },
    pricingMode: 'distance',
    priceType: 'fixed',
    estimatedMin: 2375000,
    estimatedMax: null,
    displayPrice: '2.375.000đ',
    routeSlug: null,
  },
];

describe('golden cases A1–A17 (Phụ lục A)', () => {
  it.each(CASES.map((c) => [c.id, c] as const))('%s matches expected estimate', (_id, c) => {
    const r = estimate(c.input, ctx);
    expect(r.pricingMode).toBe(c.pricingMode);
    expect(r.priceType).toBe(c.priceType);
    expect(r.estimatedMin).toBe(c.estimatedMin);
    expect(r.estimatedMax).toBe(c.estimatedMax);
    expect(r.estimatedPrice).toBe(c.estimatedMin);
    expect(r.displayPrice).toBe(c.displayPrice);
    if (c.unit !== undefined) expect(r.unit).toBe(c.unit);
    if (c.routeSlug !== undefined) expect(r.matchedRoute?.slug ?? null).toBe(c.routeSlug);
  });
});

describe('golden case A18 — quote_required with rateHint', () => {
  it('returns quote_required with km rate hint', () => {
    const r = estimate({ ...CUSTOM_PLACE, routeSlug: 'custom', vehicleType: '4cho' }, ctx);
    expect(r.pricingMode).toBe('quote_required');
    expect(r.priceType).toBe('quote_required');
    expect(r.estimatedMin).toBeNull();
    expect(r.estimatedMax).toBeNull();
    expect(r.estimatedPrice).toBeNull();
    expect(r.displayPrice).toBe('Chỉ từ 8.000đ – 11.000đ');
    expect(r.unit).toBe('/ km');
    expect(r.rateHint).toEqual({ minPerKm: 8000, maxPerKm: 11000 });
  });
});

describe('golden case A19 — bao 16cho on fixed route → quote_required', () => {
  it('returns quote_required keeping matched route', () => {
    const r = estimate(
      { pickup: 'Hải Phòng', dropoff: 'Hà Nội', routeSlug: 'hai-phong-ha-noi-noi-bai', rideType: 'bao', vehicleType: '16cho' },
      ctx,
    );
    expect(r.pricingMode).toBe('route');
    expect(r.priceType).toBe('quote_required');
    expect(r.estimatedPrice).toBeNull();
    expect(r.matchedRoute?.slug).toBe('hai-phong-ha-noi-noi-bai');
  });
});

describe('golden case A20 — inactive routeSlug is never used', () => {
  it('falls back to area match of an active route', () => {
    const r = estimate(
      { pickup: 'Móng Cái', dropoff: 'Hải Phòng', routeSlug: 'hai-phong-sa-pa-nghi', rideType: 'ghep', vehicleType: '4cho', passengerCount: 1 },
      ctx,
    );
    expect(r.matchedRoute?.slug).toBe('hai-phong-mong-cai');
    expect(r.estimatedMin).toBe(500000);
  });

  it('falls back to quote_required when nothing matches', () => {
    const r = estimate(
      { ...CUSTOM_PLACE, routeSlug: 'hai-phong-sa-pa-nghi', vehicleType: '4cho' },
      ctx,
    );
    expect(r.matchedRoute).toBeNull();
    expect(r.pricingMode).toBe('quote_required');
  });
});

describe('PR rules', () => {
  it('PR-3: share 2 passengers is the TOTAL price with unit / 2 khách', () => {
    const r = estimate(
      { pickup: 'Hải Phòng', dropoff: 'Hà Nội', routeSlug: 'hai-phong-ha-noi-noi-bai', rideType: 'ghep', vehicleType: '4cho', passengerCount: 2 },
      ctx,
    );
    expect(r.estimatedMin).toBe(700000);
    expect(r.unit).toBe('/ 2 khách');
  });

  it('PR-3: 3+ passengers recommends charter with badge/note about bao xe', () => {
    const r = estimate(
      { pickup: 'Hải Phòng', dropoff: 'Hà Nội', routeSlug: 'hai-phong-ha-noi-noi-bai', rideType: 'ghep', vehicleType: '4cho', passengerCount: 3 },
      ctx,
    );
    expect(r.priceType).toBe('from');
    expect(r.estimatedMin).toBe(899000);
    expect(r.badge).toBe('Tiết kiệm nhất khi bao xe');
    expect(r.note).toContain('bao');
  });

  it('PR-4: negotiable tier does not block booking (price null but result ok)', () => {
    const r = estimate(
      { pickup: 'Hải Phòng', dropoff: 'Hải Dương', routeSlug: 'hai-phong-hai-duong', rideType: 'bao', vehicleType: '7cho' },
      ctx,
    );
    expect(r.priceType).toBe('negotiable');
    expect(r.estimatedPrice).toBeNull();
    expect(r.displayPrice).toBe('Liên hệ thỏa thuận');
  });

  it('PR-9: guihang ignores route and uses parcel floor price', () => {
    const r = estimate(
      { pickup: 'Móng Cái', dropoff: 'Hải Phòng', routeSlug: 'hai-phong-mong-cai', vehicleType: 'guihang' },
      ctx,
    );
    expect(r.pricingMode).toBe('parcel');
    expect(r.estimatedMin).toBe(150000);
    expect(r.displayPrice).toBe('từ 150.000đ');
    expect(r.unit).toBe('/ kiện hàng');
  });
});

describe('scale (share2 fallback)', () => {
  it('multiplies min and max by factor', () => {
    expect(scale({ min: 250000, max: 300000, from: false, negotiable: false }, 2)).toEqual({
      min: 500000,
      max: 600000,
      from: false,
      negotiable: false,
    });
  });

  it('keeps null max and from flag', () => {
    expect(scale({ min: 400000, max: null, from: true, negotiable: false }, 2)).toEqual({
      min: 800000,
      max: null,
      from: true,
      negotiable: false,
    });
  });

  it('estimate uses share1 × 2 when route has no share2', () => {
    const noShare2 = routeFixtures.map((r) =>
      r.slug === 'hai-phong-ha-noi-noi-bai' ? { ...r, tiers: { ...r.tiers, share2: undefined } } : r,
    );
    const r = estimate(
      { pickup: 'Hải Phòng', dropoff: 'Hà Nội', routeSlug: 'hai-phong-ha-noi-noi-bai', rideType: 'ghep', vehicleType: '4cho', passengerCount: 2 },
      { ...ctx, routes: noShare2 },
    );
    expect(r.estimatedMin).toBe(800000);
    expect(r.unit).toBe('/ 2 khách');
  });
});

describe('matchRoute', () => {
  it('norm strips diacritics, đ, parentheses and collapses whitespace', () => {
    expect(norm('Quận Cầu Giấy (Hà Nội)')).toBe('quan cau giay');
    expect(norm('Đà Nẵng')).toBe('da nang');
  });

  it('matches by longest alias across both directions', () => {
    const hit = matchRoute(activeRoutes, { pickup: 'Móng Cái', dropoff: 'Hải Phòng', vehicleType: '4cho' });
    expect(hit?.slug).toBe('hai-phong-mong-cai');
  });

  it('ignores inactive routes', () => {
    const hit = matchRoute(activeRoutes, { pickup: 'Sa Pa', dropoff: 'Hải Phòng', vehicleType: '4cho' });
    expect(hit).toBeNull();
  });

  it('uses routeSlug when valid and active', () => {
    const hit = matchRoute(activeRoutes, {
      pickup: 'Somewhere',
      dropoff: 'Elsewhere',
      routeSlug: 'hai-phong-thai-nguyen',
      vehicleType: '4cho',
    });
    expect(hit?.slug).toBe('hai-phong-thai-nguyen');
  });
});
