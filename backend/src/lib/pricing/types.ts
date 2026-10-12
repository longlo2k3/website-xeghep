export type PriceTier = {
  min: number | null;
  max: number | null;
  from: boolean;
  negotiable: boolean;
};

export type RouteStatus = 'draft' | 'active' | 'inactive';

export type Route = {
  slug: string;
  name: string;
  status: RouteStatus;
  sortOrder: number;
  tiers: {
    share1: PriceTier;
    share2?: PriceTier;
    charter45: PriceTier;
    charter7?: PriceTier;
  };
  areas: {
    originAliases: string[];
    destinationAliases: string[];
  };
};

export type VehicleType = '4cho' | '5cho' | '7cho' | '16cho' | 'guihang';
export type RideType = 'ghep' | 'bao';
export type AirportDirection = 'to_airport' | 'from_airport' | 'round_trip';

export type EstimateInput = {
  pickup: string;
  dropoff: string;
  routeSlug?: string | null;
  rideType?: RideType;
  vehicleType: VehicleType;
  passengerCount?: number;
  airportDistrict?: string;
  airportDirection?: AirportDirection;
  distanceKm?: number;
};

export type Estimate = {
  pricingMode: 'route' | 'airport' | 'distance' | 'parcel' | 'quote_required';
  priceType: 'fixed' | 'range' | 'from' | 'negotiable' | 'quote_required';
  matchedRoute: { slug: string; name: string } | null;
  estimatedMin: number | null;
  estimatedMax: number | null;
  estimatedPrice: number | null;
  displayPrice: string;
  unit: string;
  badge?: string;
  note: string;
  rateHint?: { minPerKm: number; maxPerKm: number };
};

export type VehicleClassPrices = {
  sedan5Seats: number;
  suv7Seats: number;
  van16Seats: number;
};

export type AirportPricingRow = {
  slug: string;
  district: string;
  fromHanoiToAirport: VehicleClassPrices;
  fromAirportToHanoi: VehicleClassPrices;
  roundTrip: VehicleClassPrices;
};

export type DistanceRate = {
  label: string;
  minKm: number;
  maxKm: number | null;
  sedan5Seats: number;
  suv7Seats: number;
  van16Seats: number;
};

export type PricingSettings = {
  parcelFromPrice: number;
  parcelDeliveryText: string;
  tollsNote: string;
  tollsNoteShort: string;
  holidayNote?: string;
  minLeadTimeMinutes?: number;
  maxPassengersPerShareTrip?: number;
  freeCancelMinutes?: number;
};

export type Ctx = {
  settings: PricingSettings;
  routes: Route[];
  airport: AirportPricingRow[];
  rates: DistanceRate[];
};
