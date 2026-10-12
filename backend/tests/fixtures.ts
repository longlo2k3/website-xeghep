import { slugify } from '../src/lib/seo/slugify';
import type {
  AirportPricingRow,
  DistanceRate,
  PriceTier,
  PricingSettings,
  Route,
} from '../src/lib/pricing/types';

function parseVndText(raw: string): PriceTier {
  const t = raw.trim().toLowerCase();
  if (/liên hệ|lien he|thỏa thuận|thoa thuan/.test(t)) {
    return { min: null, max: null, from: false, negotiable: true };
  }
  const nums = [...t.matchAll(/(\d[\d.]*)\s*k/g)].map(
    (m) => Number(m[1].replace(/\./g, '')) * 1000,
  );
  const from = t.startsWith('từ ') || t.startsWith('tu ');
  if (nums.length >= 2) {
    return { min: Math.min(...nums), max: Math.max(...nums), from: false, negotiable: false };
  }
  return { min: nums[0], max: null, from, negotiable: false };
}

type RawRoute = {
  slug: string;
  name: string;
  share1: string;
  share2?: string;
  charter45: string;
  charter7?: string;
  originAliases: string[];
  destinationAliases: string[];
};

const RAW_ROUTES: RawRoute[] = [
  {
    slug: 'hai-phong-bac-ninh-bac-giang',
    name: 'Hải Phòng ⇄ Bắc Ninh ⇄ Bắc Giang',
    share1: '400k – 500k',
    share2: 'từ 700k',
    charter45: 'từ 900k',
    charter7: 'từ 1.000k',
    originAliases: ['Hải Phòng', 'Quán Toan', 'Hồng Bàng', 'Lê Chân', 'Ngô Quyền', 'Thủy Nguyên', 'An Dương'],
    destinationAliases: ['Bắc Ninh', 'Bắc Giang', 'TP. Bắc Ninh', 'TP. Bắc Giang', 'KCN Quế Võ', 'KCN Yên Phong', 'KCN Quang Châu', 'KCN Đình Trám'],
  },
  {
    slug: 'hai-phong-ha-noi-noi-bai',
    name: 'Hải Phòng ⇄ Hà Nội ⇄ Nội Bài',
    share1: '400k',
    share2: '700k',
    charter45: 'từ 899k',
    charter7: 'từ 999k',
    originAliases: ['Hải Phòng', 'Quán Toan', 'Hồng Bàng', 'Lê Chân', 'Ngô Quyền', 'Hải An', 'Kiến An', 'Thủy Nguyên'],
    destinationAliases: ['Hà Nội', 'Nội Bài', 'Sân bay Nội Bài', 'Các quận nội thành Hà Nội', 'Các bệnh viện trung ương'],
  },
  {
    slug: 'hai-phong-ha-long',
    name: 'Hải Phòng ⇄ Hạ Long',
    share1: '250k – 300k',
    share2: '400k',
    charter45: '400k – 500k',
    charter7: '500k – 600k',
    originAliases: ['Hải Phòng', 'Quán Toan', 'Thủy Nguyên'],
    destinationAliases: ['Hạ Long', 'TP. Hạ Long', 'Bãi Cháy', 'Hòn Gai', 'Tuần Châu', 'Hùng Thắng'],
  },
  {
    slug: 'hai-phong-mong-cai',
    name: 'Hải Phòng ⇄ Móng Cái',
    share1: '500k – 600k',
    share2: 'từ 800k',
    charter45: '1.500k – 1.600k',
    charter7: '1.600k – 1.700k',
    originAliases: ['Hải Phòng', 'Quán Toan', 'Thủy Nguyên', 'An Dương'],
    destinationAliases: ['Móng Cái', 'TP. Móng Cái', 'Cửa khẩu quốc tế Móng Cái', 'Trà Cổ', 'Hải Hà'],
  },
  {
    slug: 'ha-long-bac-ninh-bac-giang',
    name: 'Hạ Long ⇄ Bắc Ninh ⇄ Bắc Giang',
    share1: '450k – 550k',
    share2: 'từ 700k',
    charter45: 'từ 900k',
    charter7: 'từ 1.000k',
    originAliases: ['Hạ Long', 'TP. Hạ Long', 'Bãi Cháy', 'Hòn Gai', 'Tuần Châu'],
    destinationAliases: ['Bắc Ninh', 'Bắc Giang', 'TP. Bắc Ninh', 'TP. Bắc Giang', 'Việt Yên', 'Yên Dũng', 'Tiên Du'],
  },
  {
    slug: 'ha-noi-mong-cai',
    name: 'Hà Nội ⇄ Móng Cái',
    share1: '600k – 800k',
    share2: 'từ 1.200k',
    charter45: '2.200k – 2.400k',
    charter7: '2.300k – 2.500k',
    originAliases: ['Hà Nội', 'Các quận nội thành Hà Nội', 'Sân bay Nội Bài'],
    destinationAliases: ['Móng Cái', 'TP. Móng Cái', 'Cửa khẩu quốc tế Móng Cái', 'Khu du lịch Trà Cổ'],
  },
  {
    slug: 'ha-noi-ha-long',
    name: 'Hà Nội ⇄ Hạ Long',
    share1: '450k – 550k',
    share2: 'từ 800k',
    charter45: '1.100k – 1.200k',
    charter7: '1.200k – 1.300k',
    originAliases: ['Hà Nội', 'Các quận nội thành Hà Nội', 'Sân bay Nội Bài'],
    destinationAliases: ['Hạ Long', 'TP. Hạ Long', 'Bãi Cháy', 'Hòn Gai', 'Cảng tàu khách Tuần Châu'],
  },
  {
    slug: 'hai-phong-hai-duong',
    name: 'Hải Phòng ⇄ Hải Dương',
    share1: '250k',
    share2: '400k',
    charter45: '500k',
    charter7: 'Liên hệ thỏa thuận',
    originAliases: ['Hải Phòng', 'Quán Toan', 'An Dương'],
    destinationAliases: ['Hải Dương', 'TP. Hải Dương', 'Kim Thành', 'Cẩm Giàng', 'KCN Nam Sách'],
  },
  {
    slug: 'hai-phong-thai-nguyen',
    name: 'Hải Phòng ⇄ Thái Nguyên',
    share1: '600k',
    share2: '900k',
    charter45: '1.400k',
    charter7: 'Liên hệ thỏa thuận',
    originAliases: ['Hải Phòng', 'Quán Toan'],
    destinationAliases: ['Thái Nguyên', 'TP. Thái Nguyên', 'TP. Sông Công', 'TP. Phổ Yên', 'KCN Samsung Phổ Yên'],
  },
];

export const routeFixtures: Route[] = [
  ...RAW_ROUTES.map((r, i) => ({
    slug: r.slug,
    name: r.name,
    status: 'active' as const,
    sortOrder: i + 1,
    tiers: {
      share1: parseVndText(r.share1),
      share2: r.share2 ? parseVndText(r.share2) : undefined,
      charter45: parseVndText(r.charter45),
      charter7: r.charter7 ? parseVndText(r.charter7) : undefined,
    },
    areas: {
      originAliases: r.originAliases,
      destinationAliases: r.destinationAliases,
    },
  })),
  {
    slug: 'hai-phong-sa-pa-nghi',
    name: 'Hải Phòng ⇄ Sa Pa (ngừng hoạt động)',
    status: 'inactive',
    sortOrder: 10,
    tiers: {
      share1: { min: 900000, max: null, from: false, negotiable: false },
      charter45: { min: 2500000, max: null, from: true, negotiable: false },
    },
    areas: {
      originAliases: ['Hải Phòng'],
      destinationAliases: ['Sa Pa', 'Lào Cai'],
    },
  },
];

const AIRPORT_PRICES: Array<{
  district: string;
  fromHanoiToAirport: [number, number, number];
  fromAirportToHanoi: [number, number, number];
  roundTrip: [number, number, number];
}> = [
  { district: 'Quận Cầu Giấy', fromHanoiToAirport: [190000, 230000, 450000], fromAirportToHanoi: [240000, 280000, 500000], roundTrip: [390000, 480000, 850000] },
  { district: 'Quận Ba Đình', fromHanoiToAirport: [190000, 230000, 450000], fromAirportToHanoi: [240000, 280000, 500000], roundTrip: [390000, 480000, 850000] },
  { district: 'Quận Tây Hồ', fromHanoiToAirport: [180000, 220000, 430000], fromAirportToHanoi: [230000, 270000, 480000], roundTrip: [380000, 460000, 800000] },
  { district: 'Quận Đống Đa', fromHanoiToAirport: [200000, 240000, 470000], fromAirportToHanoi: [250000, 290000, 520000], roundTrip: [410000, 500000, 900000] },
  { district: 'Quận Hoàn Kiếm', fromHanoiToAirport: [200000, 240000, 470000], fromAirportToHanoi: [250000, 290000, 520000], roundTrip: [410000, 500000, 900000] },
  { district: 'Quận Hai Bà Trưng', fromHanoiToAirport: [210000, 250000, 480000], fromAirportToHanoi: [260000, 300000, 530000], roundTrip: [430000, 520000, 920000] },
  { district: 'Quận Thanh Xuân', fromHanoiToAirport: [210000, 250000, 480000], fromAirportToHanoi: [260000, 300000, 530000], roundTrip: [430000, 520000, 920000] },
  { district: 'Quận Nam Từ Liêm', fromHanoiToAirport: [200000, 240000, 470000], fromAirportToHanoi: [250000, 290000, 520000], roundTrip: [410000, 500000, 900000] },
  { district: 'Quận Bắc Từ Liêm', fromHanoiToAirport: [190000, 230000, 450000], fromAirportToHanoi: [240000, 280000, 500000], roundTrip: [390000, 480000, 850000] },
  { district: 'Quận Hà Đông', fromHanoiToAirport: [230000, 270000, 520000], fromAirportToHanoi: [280000, 330000, 580000], roundTrip: [470000, 560000, 1000000] },
  { district: 'Quận Hoàng Mai', fromHanoiToAirport: [220000, 260000, 500000], fromAirportToHanoi: [270000, 320000, 560000], roundTrip: [450000, 540000, 960000] },
  { district: 'Quận Long Biên', fromHanoiToAirport: [200000, 240000, 470000], fromAirportToHanoi: [250000, 290000, 520000], roundTrip: [410000, 500000, 900000] },
];

export const airportFixtures: AirportPricingRow[] = AIRPORT_PRICES.map((r) => ({
  slug: slugify(r.district),
  district: r.district,
  fromHanoiToAirport: { sedan5Seats: r.fromHanoiToAirport[0], suv7Seats: r.fromHanoiToAirport[1], van16Seats: r.fromHanoiToAirport[2] },
  fromAirportToHanoi: { sedan5Seats: r.fromAirportToHanoi[0], suv7Seats: r.fromAirportToHanoi[1], van16Seats: r.fromAirportToHanoi[2] },
  roundTrip: { sedan5Seats: r.roundTrip[0], suv7Seats: r.roundTrip[1], van16Seats: r.roundTrip[2] },
}));

export const rateFixtures: DistanceRate[] = [
  { label: 'Dưới 30 km (tối thiểu)', minKm: 0, maxKm: 30, sedan5Seats: 11000, suv7Seats: 13000, van16Seats: 18000 },
  { label: 'Từ 31 km - 100 km', minKm: 31, maxKm: 100, sedan5Seats: 9500, suv7Seats: 11500, van16Seats: 16000 },
  { label: 'Từ 101 km - 200 km', minKm: 101, maxKm: 200, sedan5Seats: 8500, suv7Seats: 10500, van16Seats: 14500 },
  { label: 'Trên 200 km', minKm: 201, maxKm: null, sedan5Seats: 8000, suv7Seats: 9500, van16Seats: 13500 },
];

export const defaultSettings: PricingSettings = {
  parcelFromPrice: 150000,
  parcelDeliveryText: '2–4 giờ',
  tollsNote:
    'Giá cước tính theo km chưa bao gồm phí cầu đường, cao tốc và vé phà (nếu có). Quý khách thanh toán trực tiếp theo hóa đơn BOT.',
  tollsNoteShort: 'Giá chưa bao gồm phí cầu đường, cao tốc và vé phà (nếu có).',
  holidayNote: 'Giá có thể thay đổi dịp lễ, tết.',
  minLeadTimeMinutes: 15,
  maxPassengersPerShareTrip: 3,
  freeCancelMinutes: 30,
};

export const activeRoutes = routeFixtures.filter((r) => r.status === 'active');
