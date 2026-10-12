import { createHash } from 'node:crypto';

import type { Payload } from 'payload';

import type {
  AirportPricingRow,
  Ctx,
  DistanceRate,
  PriceTier,
  PricingSettings,
  Route,
} from '../pricing/types';

export type ApiPricingSettings = PricingSettings & {
  priceValidUntil?: string | null;
  returningCustomerDiscountPercent?: number | null;
  roundTripDiscountText?: string | null;
  waitingTimeText?: string | null;
  waitingFreeMinutes?: number | null;
  waitingFeePerHour?: number | null;
  waitingMaxHours?: number | null;
  overnightNote?: string | null;
};

export type ApiCtx = Omit<Ctx, 'settings'> & { settings: ApiPricingSettings };

const CTX_TTL_MS = 60_000;

let cached: { ctx: ApiCtx; expiresAt: number } | null = null;
let payloadPromise: Promise<Payload> | null = null;

export async function getPayloadInstance(): Promise<Payload> {
  if (!payloadPromise) {
    payloadPromise = (async () => {
      const { getPayload } = await import('payload');
      const { default: config } = await import('../../payload.config');
      return getPayload({ config });
    })();
  }
  return payloadPromise;
}

export function invalidatePricingCtx(): void {
  cached = null;
}

export function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  return 'unknown';
}

export function hashIp(ip: string): string {
  return createHash('sha256')
    .update(ip + (process.env.IP_SALT ?? 'dev-ip-salt'))
    .digest('hex');
}

type TierGroup = {
  min?: number | null;
  max?: number | null;
  from?: boolean | null;
  negotiable?: boolean | null;
} | null;

function toTier(group: TierGroup | undefined): PriceTier {
  return {
    min: group?.min ?? null,
    max: group?.max ?? null,
    from: group?.from ?? false,
    negotiable: group?.negotiable ?? false,
  };
}

type RouteDoc = {
  tierShare1?: TierGroup;
  tierShare2?: TierGroup;
  tierCharter45?: TierGroup;
  tierCharter7?: TierGroup;
  originAliases?: { text: string }[] | null;
  destinationAliases?: { text: string }[] | null;
  status: string;
  slug: string;
  sortOrder: number;
};

function toPricingRoute(doc: RouteDoc): Route {
  return {
    slug: doc.slug,
    name: (doc as { name?: string }).name ?? doc.slug,
    status: doc.status as Route['status'],
    sortOrder: doc.sortOrder,
    tiers: {
      share1: toTier(doc.tierShare1),
      ...(doc.tierShare2 ? { share2: toTier(doc.tierShare2) } : {}),
      charter45: toTier(doc.tierCharter45),
      ...(doc.tierCharter7 ? { charter7: toTier(doc.tierCharter7) } : {}),
    },
    areas: {
      originAliases: (doc.originAliases ?? []).map((a) => a.text),
      destinationAliases: (doc.destinationAliases ?? []).map((a) => a.text),
    },
  };
}

export async function loadPricingCtx(force = false): Promise<ApiCtx> {
  if (!force && cached && cached.expiresAt > Date.now()) return cached.ctx;

  const payload = await getPayloadInstance();
  const [settingsDoc, routesRes, airportRes, ratesRes] = await Promise.all([
    payload.findGlobal({ slug: 'pricing_settings', overrideAccess: true }),
    payload.find({ collection: 'routes', limit: 100, depth: 0, sort: 'sortOrder', overrideAccess: true }),
    payload.find({
      collection: 'airport_pricing',
      limit: 100,
      depth: 0,
      sort: 'sortOrder',
      where: { isActive: { equals: true } },
      overrideAccess: true,
    }),
    payload.find({
      collection: 'distance_rates',
      limit: 100,
      depth: 0,
      sort: 'minKm',
      overrideAccess: true,
    }),
  ]);

  const settings: ApiPricingSettings = {
    parcelFromPrice: settingsDoc.parcelFromPrice ?? 150_000,
    parcelDeliveryText: settingsDoc.parcelDeliveryText ?? '2–4 giờ',
    tollsNote: settingsDoc.tollsNote ?? '',
    tollsNoteShort: settingsDoc.tollsNoteShort ?? '',
    holidayNote: settingsDoc.holidayNote ?? undefined,
    minLeadTimeMinutes: settingsDoc.minLeadTimeMinutes ?? 15,
    maxPassengersPerShareTrip: settingsDoc.maxPassengersPerShareTrip ?? 3,
    freeCancelMinutes: settingsDoc.freeCancelMinutes ?? 30,
    priceValidUntil: settingsDoc.priceValidUntil ?? null,
    returningCustomerDiscountPercent: settingsDoc.returningCustomerDiscountPercent ?? undefined,
    roundTripDiscountText: settingsDoc.roundTripDiscountText ?? undefined,
    waitingTimeText: settingsDoc.waitingTimeText ?? undefined,
    waitingFreeMinutes: settingsDoc.waitingFreeMinutes ?? undefined,
    waitingFeePerHour: settingsDoc.waitingFeePerHour ?? undefined,
    waitingMaxHours: settingsDoc.waitingMaxHours ?? undefined,
    overnightNote: settingsDoc.overnightNote ?? undefined,
  };

  const routes = routesRes.docs.map((doc) => toPricingRoute(doc as unknown as RouteDoc));
  const airport: AirportPricingRow[] = airportRes.docs.map((row) => ({
    slug: row.slug,
    district: row.district,
    fromHanoiToAirport: {
      sedan5Seats: row.fromHanoiToAirport.sedan5Seats,
      suv7Seats: row.fromHanoiToAirport.suv7Seats,
      van16Seats: row.fromHanoiToAirport.van16Seats,
    },
    fromAirportToHanoi: {
      sedan5Seats: row.fromAirportToHanoi.sedan5Seats,
      suv7Seats: row.fromAirportToHanoi.suv7Seats,
      van16Seats: row.fromAirportToHanoi.van16Seats,
    },
    roundTrip: {
      sedan5Seats: row.roundTrip.sedan5Seats,
      suv7Seats: row.roundTrip.suv7Seats,
      van16Seats: row.roundTrip.van16Seats,
    },
  }));
  const rates: DistanceRate[] = ratesRes.docs.map((row) => ({
    label: row.label,
    minKm: row.minKm,
    maxKm: row.maxKm ?? null,
    sedan5Seats: row.sedan5Seats,
    suv7Seats: row.suv7Seats,
    van16Seats: row.van16Seats,
  }));

  const ctx: ApiCtx = { settings, routes, airport, rates };
  cached = { ctx, expiresAt: Date.now() + CTX_TTL_MS };
  return ctx;
}
