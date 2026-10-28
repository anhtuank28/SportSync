export interface OwnerKpiData {
  todayRevenue: number;
  yesterdayRevenue: number;
  revenueComparisonPercent: number;
  occupancyRate: number;
  completedSlots: number;
  totalSlots: number;
  redisLocksCount: number;
  redisLocksDetail: Array<{
    courtName: string;
    timeSlot: string;
    customerName: string;
    ttlFormatted: string; // "08:12"
    secondsRemaining: number;
  }>;
}

export type SlotStatus = 'EMPTY' | 'CONFIRMED' | 'HOLDING' | 'MAINTENANCE';

export interface MatrixSlotItem {
  courtId: string;
  courtName: string;
  timeSlot: string;
  status: SlotStatus;
  customerName?: string;
  paymentLabel?: string; // "Đã TT • VietQR" | "Đã TT • 120k" | "Tiền mặt • Quầy" | "Chờ QR (08:12)"
  price: number;
  isPeakHour: boolean;
  ttlSecondsRemaining?: number;
  bookingCode?: string;
  bookingId?: string;
}

export interface CourtMatrixRow {
  id: string;
  name: string;
  surfaceName: string;
  courtNumber: number;
  slots: Record<string, MatrixSlotItem>; // key: timeSlot e.g. "16:00 - 17:00"
}

export interface OwnerRecentTransaction {
  id: string;
  bookingCode: string;
  customerName: string;
  customerPhoneMasked: string; // "0912***456"
  courtAndTime: string; // "Sân 2 • 18:00 - 20:00"
  amount: number;
  statusText: string; // "Đã thanh toán VietQR" | "Đã thu tiền mặt" | "Đang giữ chỗ Redis" | "Chờ thanh toán"
  statusCode: 'CONFIRMED_VIETQR' | 'CASH_PAID' | 'HOLDING_REDIS' | 'PENDING_PAYMENT';
  paymentMethod: 'VIETQR_AUTO' | 'CASH_AT_COUNTER';
  createdAt: string;
}

export interface OwnerDashboardResponse {
  venue: {
    id: string;
    name: string;
    slug: string;
    address: string;
    openTime: string;
    closeTime: string;
    isBwfStandard: boolean;
    totalCourts: number;
  };
  selectedDate: string;
  kpis: OwnerKpiData;
  timeSlots: string[];
  courts: CourtMatrixRow[];
  recentTransactions: OwnerRecentTransaction[];
  transactionCounts: {
    all: number;
    vietqr: number;
    cash: number;
  };
}

export interface CreateCounterBookingInput {
  venueSlug: string;
  courtId: string;
  date: string;
  timeSlot: string;
  customerName: string;
  customerPhone: string;
  price?: number;
  notes?: string;
}
