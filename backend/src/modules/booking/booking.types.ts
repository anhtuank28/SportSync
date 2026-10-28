import { VietQRPaymentData } from '../payment/vietqr.service';

export interface BookingSlotItemInput {
  courtId: string;
  courtName?: string;
  date: string; // "YYYY-MM-DD"
  timeSlot: string; // "18:00 - 19:00"
  price: number;
  isPeakHour: boolean;
}

export interface HoldBookingInput {
  venueId: string;
  customerName: string;
  customerPhone: string;
  slots: BookingSlotItemInput[];
  voucherCode?: string;
  isMatchmakingEnabled?: boolean;
  matchmakingLevel?: string;
  neededPlayers?: number;
}

export interface HoldBookingResponse {
  bookingId: string;
  bookingCode: string;
  customerName: string;
  customerPhone: string;
  finalAmount: number;
  discountAmount: number;
  totalStandardAmount: number;
  totalPeakAmount: number;
  holdExpiresAt: string;
  ttlSecondsRemaining: number;
  payment: VietQRPaymentData;
}
