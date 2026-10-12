import { z } from 'zod';

import { generateBookingCode } from '../../../../lib/booking/bookingCode';
import { getLookupSecret, makeLookupToken } from '../../../../lib/booking/lookupToken';
import { validatePhone, validateBooking } from '../../../../lib/booking/validate';
import { getClientIp, getPayloadInstance, hashIp, loadPricingCtx } from '../../../../lib/api/ctx';
import { jsonError, jsonOk, optionsCorsResponse, zodToFields, type ApiSuccess } from '../../../../lib/api/envelope';
import {
  createMemoryIdempotencyStore,
  UUID_RE,
  withIdempotency,
} from '../../../../lib/api/idempotency';
import { enforceRateLimit, RATE_RULES } from '../../../../lib/api/rateLimit';
import { formatStoredPrice, statusLabel, toVietnamIso } from '../../../../lib/api/serialize';
import { estimate } from '../../../../lib/pricing/estimate';

const SUCCESS_MESSAGE = 'Đặt xe thành công. Tổng đài viên sẽ gọi lại trong ít phút.';
const HONEYPOT_MESSAGE = 'Đặt xe thành công. Tổng đài viên sẽ gọi lại trong ít phút.';

const idempotencyStore = createMemoryIdempotencyStore();

const bookingSchema = z.object({
  customerName: z.string().trim().min(2, 'Họ tên phải từ 2 đến 100 ký tự.').max(100, 'Họ tên phải từ 2 đến 100 ký tự.'),
  customerPhone: z
    .string({ required_error: 'Số điện thoại không hợp lệ.' })
    .trim()
    .min(1, 'Số điện thoại không hợp lệ.')
    .refine((v) => validatePhone(v).ok, { message: 'Số điện thoại không hợp lệ.' }),
  routeSlug: z.string().trim().nullish(),
  pickupLocation: z.string().trim().min(3, 'Điểm đón phải từ 3 đến 255 ký tự.').max(255, 'Điểm đón phải từ 3 đến 255 ký tự.'),
  dropoffLocation: z.string().trim().min(3, 'Điểm đến phải từ 3 đến 255 ký tự.').max(255, 'Điểm đến phải từ 3 đến 255 ký tự.'),
  rideType: z.enum(['ghep', 'bao']).nullish(),
  vehicleType: z.enum(['4cho', '5cho', '7cho', '16cho', 'guihang']),
  passengerCount: z.number().int().min(1).max(3).optional(),
  pickupDateTime: z.string().trim().min(1, 'Thời gian đón là bắt buộc.'),
  note: z.string().nullish(),
  airportDistrict: z.string().trim().nullish(),
  airportDirection: z.enum(['to_airport', 'from_airport', 'round_trip']).nullish(),
  distanceKm: z.number().nullish(),
  website: z.string().nullish(),
});

class HandlerExit extends Error {
  constructor(public response: Response) {
    super('HANDLER_EXIT');
  }
}

async function readJson(req: Request): Promise<Record<string, unknown>> {
  try {
    const raw = await req.json();
    return raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export async function POST(req: Request): Promise<Response> {
  const body = await readJson(req);

  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return fakeSuccess(body);
  }

  const ip = getClientIp(req);
  const ipLimited = enforceRateLimit(`booking:ip:${ip}`, RATE_RULES.bookingPerIp[0], RATE_RULES.bookingPerIp[1]);
  if (ipLimited) return ipLimited;

  const rawPhone = typeof body.customerPhone === 'string' ? body.customerPhone : '';
  const phoneCheck = validatePhone(rawPhone);
  const phoneKey = phoneCheck.ok ? phoneCheck.phone : rawPhone.replace(/[\s.\-]/g, '');
  if (phoneKey) {
    const phoneLimited = enforceRateLimit(
      `booking:phone:${phoneKey}`,
      RATE_RULES.bookingPerPhonePerDay[0],
      RATE_RULES.bookingPerPhonePerDay[1],
    );
    if (phoneLimited) return phoneLimited;
  }

  const idemKey = req.headers.get('idempotency-key');
  if (idemKey && !UUID_RE.test(idemKey)) {
    return jsonError('VALIDATION_ERROR', undefined, {
      fields: [{ field: 'Idempotency-Key', message: 'Idempotency-Key phải là UUID hợp lệ.' }],
    });
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError('VALIDATION_ERROR', undefined, { fields: zodToFields(parsed.error) });
  }

  try {
    const stored = await withIdempotency(
      idempotencyStore,
      idemKey ?? undefined,
      async () => {
        const rawSlug = parsed.data.routeSlug ?? null;
        const requestedSlug = rawSlug && rawSlug !== 'custom' ? rawSlug : null;

        const validation = validateBooking({ ...parsed.data, routeSlug: null }, {
          settings: {
            minLeadTimeMinutes: process.env.MIN_LEAD_TIME_MINUTES
              ? Number(process.env.MIN_LEAD_TIME_MINUTES)
              : 15,
            maxPassengersPerShareTrip: 3,
          },
          nowMs: Date.now(),
        });
        if (!validation.ok) {
          throw new HandlerExit(
            jsonError(validation.code, validation.message, { fields: validation.fields }),
          );
        }
        if (validation.bot) {
          throw new HandlerExit(
            jsonError('VALIDATION_ERROR', undefined, {
              fields: [{ field: 'website', message: 'Yêu cầu không hợp lệ.' }],
            }),
          );
        }
        const data = validation.data;

        const payload = await getPayloadInstance();
        const ctx = await loadPricingCtx();

        let routeDoc: { id: number; slug: string; name: string } | null = null;
        if (requestedSlug) {
          const routeRes = await payload.find({
            collection: 'routes',
            limit: 1,
            depth: 0,
            where: { slug: { equals: requestedSlug }, status: { equals: 'active' } },
            overrideAccess: true,
          });
          const found = routeRes.docs[0];
          if (!found) {
            throw new HandlerExit(
              jsonError('VALIDATION_ERROR', undefined, {
                fields: [{ field: 'routeSlug', message: 'Tuyến không tồn tại hoặc không hoạt động' }],
              }),
            );
          }
          routeDoc = { id: Number(found.id), slug: found.slug, name: found.name };
        }

        const est = estimate(
          {
            pickup: data.pickupLocation,
            dropoff: data.dropoffLocation,
            routeSlug: requestedSlug,
            rideType: data.rideType ?? undefined,
            vehicleType: data.vehicleType,
            passengerCount: data.passengerCount,
            airportDistrict: data.airportDistrict,
            airportDirection: data.airportDirection,
            distanceKm: data.distanceKm,
          },
          ctx,
        );

        const now = new Date();
        const yy = String(now.getFullYear() % 100).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const existingRes = await payload.find({
          collection: 'bookings',
          limit: 100,
          depth: 0,
          where: { bookingCode: { like: `XG-${yy}${mm}${dd}-` } },
          overrideAccess: true,
        });
        const usedCodes = new Set(
          existingRes.docs.map((d) => String(d.bookingCode ?? '')).filter(Boolean),
        );
        const bookingCode = generateBookingCode(now, (c) => usedCodes.has(c));
        const lookupToken = makeLookupToken(bookingCode, getLookupSecret());

        const isParcel = data.vehicleType === 'guihang';
        const created = await payload.create({
          collection: 'bookings',
          overrideAccess: true,
          data: {
            bookingCode,
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            route: routeDoc ? routeDoc.id : null,
            serviceType: isParcel ? 'parcel' : 'passenger',
            pickupLocation: data.pickupLocation,
            dropoffLocation: data.dropoffLocation,
            rideType: isParcel ? null : data.rideType,
            vehicleType: data.vehicleType,
            passengerCount: isParcel ? 1 : data.passengerCount,
            pickupDatetime: data.pickupDateTime,
            airportDistrict: data.airportDistrict ?? null,
            airportDirection: data.airportDirection ?? null,
            distanceKm: data.distanceKm ?? null,
            priceType: est.priceType,
            estimatedPrice: est.estimatedMin,
            estimatedPriceMax: est.estimatedMax,
            paymentMethod: 'cash',
            status: 'pending',
            note: data.note ?? null,
            sourceIpHash: hashIp(ip),
            notifyAttempts: 0,
          },
        });

        const noPrice = est.priceType === 'negotiable' || est.priceType === 'quote_required';
        const payloadData = {
          bookingCode,
          lookupToken,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          route: routeDoc ? { slug: routeDoc.slug, name: routeDoc.name } : null,
          pickupLocation: data.pickupLocation,
          dropoffLocation: data.dropoffLocation,
          rideType: isParcel ? null : data.rideType,
          vehicleType: data.vehicleType,
          passengerCount: isParcel ? 1 : data.passengerCount,
          pickupDateTime: toVietnamIso(new Date(data.pickupDateTime)),
          priceType: est.priceType,
          estimatedPrice: est.estimatedMin,
          estimatedPriceMax: est.estimatedMax,
          estimatedPriceFormatted: noPrice ? 'Liên hệ báo giá' : est.displayPrice,
          unit: est.unit,
          priceNote: est.note,
          paymentMethod: 'cash',
          status: 'pending',
          statusLabel: statusLabel('pending'),
          createdAt: toVietnamIso(created ? new Date(created.createdAt) : now),
        };
        const envelope = {
          statusCode: 201,
          message: SUCCESS_MESSAGE,
          data: payloadData,
        };
        return envelope;
      },
    );
    return jsonOk(stored.data, { statusCode: stored.statusCode, message: stored.message });
  } catch (err) {
    if (err instanceof HandlerExit) return err.response;
    if (err instanceof Error && err.message === 'INVALID_IDEMPOTENCY_KEY') {
      return jsonError('VALIDATION_ERROR', undefined, {
        fields: [{ field: 'Idempotency-Key', message: 'Idempotency-Key phải là UUID hợp lệ.' }],
      });
    }
    console.error('[bookings/create]', err);
    return jsonError('INTERNAL_ERROR');
  }
}

function fakeSuccess(body: Record<string, unknown>): Response {
  const now = new Date();
  let code: string;
  try {
    code = generateBookingCode(now, () => false);
  } catch {
    code = `XG-000000-F2F2F2`;
  }
  const token = makeLookupToken(code, getLookupSecret());
  const name = typeof body.customerName === 'string' && body.customerName.trim() ? body.customerName.trim() : 'Khách hàng';
  const rawFakePhone = typeof body.customerPhone === 'string' ? body.customerPhone : '';
  const fakePhoneCheck = validatePhone(rawFakePhone);
  const phone = fakePhoneCheck.ok ? fakePhoneCheck.phone : rawFakePhone.replace(/[\s.\-]/g, '');
  const vehicleType = typeof body.vehicleType === 'string' && ['4cho', '5cho', '7cho', '16cho', 'guihang'].includes(body.vehicleType) ? body.vehicleType : '4cho';
  const rideType = body.rideType === 'bao' || body.rideType === 'ghep' ? body.rideType : null;
  const passengerCount = typeof body.passengerCount === 'number' && Number.isInteger(body.passengerCount) && body.passengerCount >= 1 && body.passengerCount <= 3 ? body.passengerCount : 1;
  const pickupRaw = typeof body.pickupDateTime === 'string' ? body.pickupDateTime : '';
  const pickupDate = pickupRaw ? new Date(pickupRaw) : now;
  const data = {
    bookingCode: code,
    lookupToken: token,
    customerName: name,
    customerPhone: phone,
    route: null,
    pickupLocation: typeof body.pickupLocation === 'string' ? body.pickupLocation : '',
    dropoffLocation: typeof body.dropoffLocation === 'string' ? body.dropoffLocation : '',
    rideType,
    vehicleType,
    passengerCount,
    pickupDateTime: toVietnamIso(Number.isNaN(pickupDate.getTime()) ? now : pickupDate),
    priceType: 'fixed',
    estimatedPrice: 400000,
    estimatedPriceMax: null,
    estimatedPriceFormatted: '400.000đ',
    unit: '/ khách',
    priceNote: '',
    paymentMethod: 'cash',
    status: 'pending',
    statusLabel: statusLabel('pending'),
    createdAt: toVietnamIso(now),
  };
  return jsonOk(data, {
    statusCode: 201,
    message: HONEYPOT_MESSAGE,
  });
}

export async function OPTIONS() {
  return optionsCorsResponse();
}
