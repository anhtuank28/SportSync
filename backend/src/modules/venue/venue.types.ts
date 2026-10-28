export type SlotStatus = 'AVAILABLE' | 'SELECTED' | 'HOLDING' | 'BOOKED';

export interface ScheduleSlotCell {
  courtId: string;
  courtName: string;
  surfaceName: string;
  timeSlot: string;
  price: number;
  isPeakHour: boolean;
  status: SlotStatus;
  holdExpiresAt?: string | null;
  ttlSecondsRemaining?: number;
  bookedByName?: string;
  paymentMethod?: string;
}

export interface CourtScheduleRow {
  courtId: string;
  courtName: string;
  surfaceType: string;
  surfaceName: string;
  sportType: string;
  courtNumber: number;
  slots: Record<string, ScheduleSlotCell>; // key: timeSlot label (e.g. "06:00", "17:00")
}

export interface VenueScheduleResponse {
  venue: {
    id: string;
    name: string;
    slug: string;
    address: string;
    latitude: number;
    longitude: number;
    openTime: string;
    closeTime: string;
    isBwfStandard: boolean;
    rating: number;
    ratingCount: number;
    amenities: Array<{ title: string; desc: string; icon: string }>;
  };
  date: string;
  availableDates: Array<{ date: string; label: string; isPeakDay: boolean; isToday: boolean }>;
  timeColumns: Array<{ time: string; label: string; isPeakHour: boolean }>;
  peakHourBanner: {
    title: string;
    standardPrice: number;
    peakPrice: number;
    peakRange: string;
  };
  courts: CourtScheduleRow[];
}

export interface NearbyVenueItem {
  id: string;
  name: string;
  slug: string;
  address: string;
  distanceKm: number;
  distanceFormatted: string;
  latitude: number;
  longitude: number;
  rating: number;
  availableSlotCount: number;
  minPrice: number;
  isCurrent: boolean;
}
