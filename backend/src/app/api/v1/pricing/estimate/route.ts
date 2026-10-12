import { z } from 'zod';

import { jsonError, jsonOk, optionsCorsResponse, zodToFields } from '../../../../../lib/api/envelope';
import { getClientIp, loadPricingCtx } from '../../../../../lib/api/ctx';
import { enforceRateLimit, RATE_RULES } from '../../../../../lib/api/rateLimit';
import { estimate } from '../../../../../lib/pricing/estimate';

const estimateSchema = z.object({
  pickup: z.string().trim().min(2, 'Điểm đón phải có ít nhất 2 ký tự.'),
  dropoff: z.string().trim().min(2, 'Điểm đến phải có ít nhất 2 ký tự.'),
  routeSlug: z.string().trim().nullish(),
  rideType: z.enum(['ghep', 'bao']).optional(),
  vehicleType: z.enum(['4cho', '5cho', '7cho', '16cho', 'guihang']),
  passengerCount: z.number().int().min(1, 'Số khách phải từ 1 đến 3.').max(3, 'Số khách phải từ 1 đến 3.').optional(),
  airportDistrict: z.string().trim().nullish(),
  airportDirection: z.enum(['to_airport', 'from_airport', 'round_trip']).nullish(),
  distanceKm: z.number().min(0).nullish(),
});

export async function POST(req: Request): Promise<Response> {
  const ip = getClientIp(req);
  const limited = enforceRateLimit(`estimate:${ip}`, RATE_RULES.estimate[0], RATE_RULES.estimate[1]);
  if (limited) return limited;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    raw = null;
  }

  const parsed = estimateSchema.safeParse(raw);
  if (!parsed.success) {
    return jsonError('VALIDATION_ERROR', undefined, { fields: zodToFields(parsed.error) });
  }

  try {
    const ctx = await loadPricingCtx();
    const result = estimate(
      {
        ...parsed.data,
        airportDistrict: parsed.data.airportDistrict ?? undefined,
        airportDirection: parsed.data.airportDirection ?? undefined,
        distanceKm: parsed.data.distanceKm ?? undefined,
        routeSlug: parsed.data.routeSlug ?? undefined,
        rideType: parsed.data.rideType ?? undefined,
        passengerCount: parsed.data.passengerCount ?? undefined,
      },
      ctx,
    );
    return jsonOk(
      { rateHint: result.rateHint ?? null, ...result },
      { message: 'Tính giá cước thành công' },
    );
  } catch (err) {
    console.error('[pricing/estimate]', err);
    return jsonError('INTERNAL_ERROR');
  }
}

export async function OPTIONS() {
  return optionsCorsResponse();
}
