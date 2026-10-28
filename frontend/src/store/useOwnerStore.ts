import { create } from 'zustand';

export type SlotStatus = 'EMPTY' | 'CONFIRMED' | 'HOLDING' | 'MAINTENANCE';

export interface MatrixSlotItem {
  courtId: string;
  courtName: string;
  timeSlot: string;
  status: SlotStatus;
  customerName?: string;
  paymentLabel?: string;
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
  slots: Record<string, MatrixSlotItem>;
}

export interface OwnerRecentTransaction {
  id: string;
  bookingCode: string;
  customerName: string;
  customerPhoneMasked: string;
  courtAndTime: string;
  amount: number;
  statusText: string;
  statusCode: 'CONFIRMED_VIETQR' | 'CASH_PAID' | 'HOLDING_REDIS' | 'PENDING_PAYMENT';
  paymentMethod: 'VIETQR_AUTO' | 'CASH_AT_COUNTER';
  createdAt: string;
}

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
    ttlFormatted: string;
    secondsRemaining: number;
  }>;
}

interface OwnerState {
  venueSlug: string;
  selectedDate: string;
  activeShift: string;
  transactionTab: 'all' | 'vietqr' | 'cash';

  kpis: OwnerKpiData;
  timeSlots: string[];
  courts: CourtMatrixRow[];
  recentTransactions: OwnerRecentTransaction[];

  isLoading: boolean;
  isCounterModalOpen: boolean;
  selectedSlotForBooking: { courtId: string; courtName: string; timeSlot: string } | null;

  // Actions
  setSelectedDate: (date: string) => void;
  setActiveShift: (shift: string) => void;
  setTransactionTab: (tab: 'all' | 'vietqr' | 'cash') => void;
  setIsCounterModalOpen: (open: boolean) => void;
  openCounterModalWithSlot: (courtId: string, courtName: string, timeSlot: string) => void;
  setDashboardData: (data: {
    kpis: OwnerKpiData;
    timeSlots: string[];
    courts: CourtMatrixRow[];
    recentTransactions: OwnerRecentTransaction[];
  }) => void;
  addCounterBooking: (booking: {
    courtId: string;
    courtName: string;
    timeSlot: string;
    customerName: string;
    customerPhone: string;
    amount: number;
    bookingCode: string;
  }) => void;
  decrementTtl: () => void;
}

// Initial default state khớp 100% Mockup 3
const initialKpis: OwnerKpiData = {
  todayRevenue: 4850000,
  yesterdayRevenue: 4330000,
  revenueComparisonPercent: 12,
  occupancyRate: 78,
  completedSlots: 28,
  totalSlots: 36,
  redisLocksCount: 2,
  redisLocksDetail: [
    {
      courtName: 'Sân 2',
      timeSlot: '20:00 - 21:00',
      customerName: 'Nguyễn Đức Anh',
      ttlFormatted: '08:12',
      secondsRemaining: 492,
    },
    {
      courtName: 'Sân 4',
      timeSlot: '17:00 - 18:00',
      customerName: 'Phạm Thùy Chi',
      ttlFormatted: '04:35',
      secondsRemaining: 275,
    },
  ],
};

const initialTimeSlots = [
  '16:00 - 17:00',
  '17:00 - 18:00',
  '18:00 - 19:00',
  '19:00 - 20:00',
  '20:00 - 21:00',
  '21:00 - 22:00',
];

const initialCourts: CourtMatrixRow[] = [
  {
    id: 'court-1',
    name: 'Sân 1',
    surfaceName: 'Yonex Pro',
    courtNumber: 1,
    slots: {
      '16:00 - 17:00': { courtId: 'court-1', courtName: 'Sân 1', timeSlot: '16:00 - 17:00', status: 'CONFIRMED', customerName: 'Nguyễn Tuấn', paymentLabel: 'Đã TT • VietQR', price: 120000, isPeakHour: true },
      '17:00 - 18:00': { courtId: 'court-1', courtName: 'Sân 1', timeSlot: '17:00 - 18:00', status: 'CONFIRMED', customerName: 'Trần Hữu Nam', paymentLabel: 'Đã TT • 120k', price: 120000, isPeakHour: true },
      '18:00 - 19:00': { courtId: 'court-1', courtName: 'Sân 1', timeSlot: '18:00 - 19:00', status: 'CONFIRMED', customerName: 'Trần Hữu Nam', paymentLabel: 'Đã TT • 120k', price: 120000, isPeakHour: true },
      '19:00 - 20:00': { courtId: 'court-1', courtName: 'Sân 1', timeSlot: '19:00 - 20:00', status: 'EMPTY', price: 120000, isPeakHour: true },
      '20:00 - 21:00': { courtId: 'court-1', courtName: 'Sân 1', timeSlot: '20:00 - 21:00', status: 'CONFIRMED', customerName: 'Lê Minh Khôi', paymentLabel: 'Tiền mặt • Quầy', price: 120000, isPeakHour: true },
      '21:00 - 22:00': { courtId: 'court-1', courtName: 'Sân 1', timeSlot: '21:00 - 22:00', status: 'EMPTY', price: 120000, isPeakHour: true },
    },
  },
  {
    id: 'court-2',
    name: 'Sân 2',
    surfaceName: 'Yonex Pro',
    courtNumber: 2,
    slots: {
      '16:00 - 17:00': { courtId: 'court-2', courtName: 'Sân 2', timeSlot: '16:00 - 17:00', status: 'EMPTY', price: 120000, isPeakHour: true },
      '17:00 - 18:00': { courtId: 'court-2', courtName: 'Sân 2', timeSlot: '17:00 - 18:00', status: 'CONFIRMED', customerName: 'Lê Hoàng Long', paymentLabel: 'Đã TT • VietQR', price: 120000, isPeakHour: true },
      '18:00 - 19:00': { courtId: 'court-2', courtName: 'Sân 2', timeSlot: '18:00 - 19:00', status: 'CONFIRMED', customerName: 'Nguyễn Tuấn', paymentLabel: 'Đã TT • 120k', price: 120000, isPeakHour: true },
      '19:00 - 20:00': { courtId: 'court-2', courtName: 'Sân 2', timeSlot: '19:00 - 20:00', status: 'CONFIRMED', customerName: 'Nguyễn Tuấn', paymentLabel: 'Đã TT • 120k', price: 120000, isPeakHour: true },
      '20:00 - 21:00': { courtId: 'court-2', courtName: 'Sân 2', timeSlot: '20:00 - 21:00', status: 'HOLDING', customerName: 'Nguyễn Đức Anh', paymentLabel: 'Chờ QR (08:12)', price: 120000, isPeakHour: true, ttlSecondsRemaining: 492 },
      '21:00 - 22:00': { courtId: 'court-2', courtName: 'Sân 2', timeSlot: '21:00 - 22:00', status: 'CONFIRMED', customerName: 'Võ Gia Huy', paymentLabel: 'Đã TT • VietQR', price: 120000, isPeakHour: true },
    },
  },
  {
    id: 'court-3',
    name: 'Sân 3',
    surfaceName: 'Taraflex',
    courtNumber: 3,
    slots: {
      '16:00 - 17:00': { courtId: 'court-3', courtName: 'Sân 3', timeSlot: '16:00 - 17:00', status: 'CONFIRMED', customerName: 'CLB Dịch Vọng', paymentLabel: 'Đã TT • 120k', price: 120000, isPeakHour: true },
      '17:00 - 18:00': { courtId: 'court-3', courtName: 'Sân 3', timeSlot: '17:00 - 18:00', status: 'CONFIRMED', customerName: 'CLB Dịch Vọng', paymentLabel: 'Đã TT • 120k', price: 120000, isPeakHour: true },
      '18:00 - 19:00': { courtId: 'court-3', courtName: 'Sân 3', timeSlot: '18:00 - 19:00', status: 'EMPTY', price: 120000, isPeakHour: true },
      '19:00 - 20:00': { courtId: 'court-3', courtName: 'Sân 3', timeSlot: '19:00 - 20:00', status: 'CONFIRMED', customerName: 'Phạm Minh', paymentLabel: 'Đã TT • VietQR', price: 120000, isPeakHour: true },
      '20:00 - 21:00': { courtId: 'court-3', courtName: 'Sân 3', timeSlot: '20:00 - 21:00', status: 'CONFIRMED', customerName: 'Phạm Minh', paymentLabel: 'Đã TT • VietQR', price: 120000, isPeakHour: true },
      '21:00 - 22:00': { courtId: 'court-3', courtName: 'Sân 3', timeSlot: '21:00 - 22:00', status: 'EMPTY', price: 120000, isPeakHour: true },
    },
  },
  {
    id: 'court-4',
    name: 'Sân 4',
    surfaceName: 'Taraflex',
    courtNumber: 4,
    slots: {
      '16:00 - 17:00': { courtId: 'court-4', courtName: 'Sân 4', timeSlot: '16:00 - 17:00', status: 'EMPTY', price: 120000, isPeakHour: true },
      '17:00 - 18:00': { courtId: 'court-4', courtName: 'Sân 4', timeSlot: '17:00 - 18:00', status: 'HOLDING', customerName: 'Phạm Thùy Chi', paymentLabel: 'Chờ QR (04:35)', price: 120000, isPeakHour: true, ttlSecondsRemaining: 275 },
      '18:00 - 19:00': { courtId: 'court-4', courtName: 'Sân 4', timeSlot: '18:00 - 19:00', status: 'CONFIRMED', customerName: 'Nguyễn Đức Anh', paymentLabel: 'Đã TT • Quầy', price: 120000, isPeakHour: true },
      '19:00 - 20:00': { courtId: 'court-4', courtName: 'Sân 4', timeSlot: '19:00 - 20:00', status: 'CONFIRMED', customerName: 'Nguyễn Đức Anh', paymentLabel: 'Đã TT • Quầy', price: 120000, isPeakHour: true },
      '20:00 - 21:00': { courtId: 'court-4', courtName: 'Sân 4', timeSlot: '20:00 - 21:00', status: 'CONFIRMED', customerName: 'Phạm Thùy Chi', paymentLabel: 'Đã TT • VietQR', price: 120000, isPeakHour: true },
      '21:00 - 22:00': { courtId: 'court-4', courtName: 'Sân 4', timeSlot: '21:00 - 22:00', status: 'EMPTY', price: 120000, isPeakHour: true },
    },
  },
  {
    id: 'court-5',
    name: 'Sân 5',
    surfaceName: 'Tiêu chuẩn',
    courtNumber: 5,
    slots: {
      '16:00 - 17:00': { courtId: 'court-5', courtName: 'Sân 5', timeSlot: '16:00 - 17:00', status: 'EMPTY', price: 120000, isPeakHour: true },
      '17:00 - 18:00': { courtId: 'court-5', courtName: 'Sân 5', timeSlot: '17:00 - 18:00', status: 'CONFIRMED', customerName: 'Vũ Quốc Cường', paymentLabel: 'Đã TT • 120k', price: 120000, isPeakHour: true },
      '18:00 - 19:00': { courtId: 'court-5', courtName: 'Sân 5', timeSlot: '18:00 - 19:00', status: 'CONFIRMED', customerName: 'Phạm Thùy Chi', paymentLabel: 'Đã TT • VietQR', price: 120000, isPeakHour: true },
      '19:00 - 20:00': { courtId: 'court-5', courtName: 'Sân 5', timeSlot: '19:00 - 20:00', status: 'EMPTY', price: 120000, isPeakHour: true },
      '20:00 - 21:00': { courtId: 'court-5', courtName: 'Sân 5', timeSlot: '20:00 - 21:00', status: 'CONFIRMED', customerName: 'Đoàn Mạnh Hùng', paymentLabel: 'Đã TT • Quầy', price: 120000, isPeakHour: true },
      '21:00 - 22:00': { courtId: 'court-5', courtName: 'Sân 5', timeSlot: '21:00 - 22:00', status: 'EMPTY', price: 120000, isPeakHour: true },
    },
  },
];

const initialRecentTransactions: OwnerRecentTransaction[] = [
  {
    id: 'tx-1',
    bookingCode: '#BK-8902',
    customerName: 'Nguyễn Tuấn',
    customerPhoneMasked: '0912***456',
    courtAndTime: 'Sân 2 • 18:00 - 20:00',
    amount: 240000,
    statusText: 'Đã thanh toán VietQR',
    statusCode: 'CONFIRMED_VIETQR',
    paymentMethod: 'VIETQR_AUTO',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tx-2',
    bookingCode: '#BK-8901',
    customerName: 'Trần Hữu Nam',
    customerPhoneMasked: '0988***233',
    courtAndTime: 'Sân 1 • 17:00 - 19:00',
    amount: 240000,
    statusText: 'Đã thu tiền mặt',
    statusCode: 'CASH_PAID',
    paymentMethod: 'CASH_AT_COUNTER',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tx-3',
    bookingCode: '#BK-8900',
    customerName: 'Lê Hoàng Long',
    customerPhoneMasked: '0977***344',
    courtAndTime: 'Sân 3 • 19:00 - 21:00',
    amount: 240000,
    statusText: 'Đã thanh toán VietQR',
    statusCode: 'CONFIRMED_VIETQR',
    paymentMethod: 'VIETQR_AUTO',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tx-4',
    bookingCode: '#BK-8899',
    customerName: 'Nguyễn Đức Anh',
    customerPhoneMasked: '0966***455',
    courtAndTime: 'Sân 4 • 20:00 - 21:00',
    amount: 120000,
    statusText: 'Đang giữ chỗ Redis',
    statusCode: 'HOLDING_REDIS',
    paymentMethod: 'VIETQR_AUTO',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'tx-5',
    bookingCode: '#BK-8898',
    customerName: 'Phạm Thùy Chi',
    customerPhoneMasked: '0944***677',
    courtAndTime: 'Sân 5 • 18:00 - 19:00',
    amount: 120000,
    statusText: 'Chờ thanh toán',
    statusCode: 'PENDING_PAYMENT',
    paymentMethod: 'VIETQR_AUTO',
    createdAt: new Date().toISOString(),
  },
];

export const useOwnerStore = create<OwnerState>((set) => ({
  venueSlug: 'cum-san-cau-long-cau-giay',
  selectedDate: '2025-10-24',
  activeShift: 'evening',
  transactionTab: 'all',

  kpis: initialKpis,
  timeSlots: initialTimeSlots,
  courts: initialCourts,
  recentTransactions: initialRecentTransactions,

  isLoading: false,
  isCounterModalOpen: false,
  selectedSlotForBooking: null,

  setSelectedDate: (date) => set({ selectedDate: date }),
  setActiveShift: (shift) => set({ activeShift: shift }),
  setTransactionTab: (tab) => set({ transactionTab: tab }),
  setIsCounterModalOpen: (open) => set({ isCounterModalOpen: open }),

  openCounterModalWithSlot: (courtId, courtName, timeSlot) =>
    set({
      selectedSlotForBooking: { courtId, courtName, timeSlot },
      isCounterModalOpen: true,
    }),

  setDashboardData: (data) =>
    set({
      kpis: data.kpis,
      timeSlots: data.timeSlots,
      courts: data.courts,
      recentTransactions: data.recentTransactions,
    }),

  addCounterBooking: (booking) =>
    set((state) => {
      // Cập nhật ma trận lịch
      const newCourts = state.courts.map((court) => {
        if (court.id === booking.courtId || court.name === booking.courtName) {
          const updatedSlots = { ...court.slots };
          updatedSlots[booking.timeSlot] = {
            courtId: booking.courtId,
            courtName: booking.courtName,
            timeSlot: booking.timeSlot,
            status: 'CONFIRMED',
            customerName: booking.customerName,
            paymentLabel: 'Tiền mặt • Quầy',
            price: booking.amount,
            isPeakHour: true,
            bookingCode: booking.bookingCode,
          };
          return { ...court, slots: updatedSlots };
        }
        return court;
      });

      // Cập nhật giao dịch gần nhất
      const maskedPhone =
        booking.customerPhone.length >= 7
          ? `${booking.customerPhone.slice(0, 4)}***${booking.customerPhone.slice(-3)}`
          : booking.customerPhone;

      const newTx: OwnerRecentTransaction = {
        id: `tx-${Date.now()}`,
        bookingCode: booking.bookingCode,
        customerName: booking.customerName,
        customerPhoneMasked: maskedPhone,
        courtAndTime: `${booking.courtName} • ${booking.timeSlot}`,
        amount: booking.amount,
        statusText: 'Đã thu tiền mặt',
        statusCode: 'CASH_PAID',
        paymentMethod: 'CASH_AT_COUNTER',
        createdAt: new Date().toISOString(),
      };

      // Tăng doanh thu
      const newKpis = {
        ...state.kpis,
        todayRevenue: state.kpis.todayRevenue + booking.amount,
        completedSlots: state.kpis.completedSlots + 1,
      };

      return {
        courts: newCourts,
        recentTransactions: [newTx, ...state.recentTransactions],
        kpis: newKpis,
        isCounterModalOpen: false,
        selectedSlotForBooking: null,
      };
    }),

  decrementTtl: () =>
    set((state) => {
      let updatedAny = false;
      const newKpiDetail = state.kpis.redisLocksDetail.map((item) => {
        const nextSec = Math.max(0, item.secondsRemaining - 1);
        const mins = Math.floor(nextSec / 60);
        const secs = nextSec % 60;
        const ttlFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        updatedAny = true;
        return {
          ...item,
          secondsRemaining: nextSec,
          ttlFormatted,
        };
      });

      if (!updatedAny) return state;

      return {
        kpis: {
          ...state.kpis,
          redisLocksDetail: newKpiDetail,
        },
      };
    }),
}));
