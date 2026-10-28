import { create } from 'zustand';

export interface SelectedSlot {
  courtId: string;
  courtName: string;
  surfaceName: string;
  timeSlot: string;
  price: number;
  isPeakHour: boolean;
}

interface BookingState {
  selectedDistrict: string;
  selectedVenueSlug: string;
  selectedDate: string;
  selectedSlots: SelectedSlot[];
  isMatchmakingEnabled: boolean;
  matchmakingLevel: string;
  neededPlayers: number;
  voucherCode: string;
  discountAmount: number;
  holdSecondsRemaining: number;

  setSelectedDistrict: (district: string) => void;
  setSelectedVenueSlug: (slug: string) => void;
  setSelectedDate: (date: string) => void;
  toggleSlot: (slot: SelectedSlot) => void;
  removeSlot: (courtId: string, timeSlot: string) => void;
  clearSlots: () => void;
  setIsMatchmakingEnabled: (enabled: boolean) => void;
  setMatchmakingConfig: (level: string, needed: number) => void;
  applyVoucher: (code: string) => boolean;
  decrementTimer: () => void;
  resetTimer: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  selectedDistrict: 'quan-cau-giay',
  selectedVenueSlug: 'cum-san-cau-long-cau-giay',
  selectedDate: '2025-10-24',
  selectedSlots: [
    {
      courtId: 'court-2',
      courtName: 'Sân 2',
      surfaceName: 'Yonex Pro Mat',
      timeSlot: '18:00',
      price: 120000,
      isPeakHour: true,
    },
    {
      courtId: 'court-2',
      courtName: 'Sân 2',
      surfaceName: 'Yonex Pro Mat',
      timeSlot: '19:00',
      price: 120000,
      isPeakHour: true,
    },
  ],
  isMatchmakingEnabled: true,
  matchmakingLevel: 'Trung bình (B / C+)',
  neededPlayers: 2,
  voucherCode: 'BADMINTON20',
  discountAmount: 20000,
  holdSecondsRemaining: 596, // 09:56

  setSelectedDistrict: (district) => set({ selectedDistrict: district }),
  setSelectedVenueSlug: (slug) => set({ selectedVenueSlug: slug }),
  setSelectedDate: (date) => set({ selectedDate: date }),

  toggleSlot: (slot) =>
    set((state) => {
      const existsIndex = state.selectedSlots.findIndex(
        (s) => s.courtId === slot.courtId && s.timeSlot === slot.timeSlot
      );

      if (existsIndex > -1) {
        // Hủy chọn
        const updated = [...state.selectedSlots];
        updated.splice(existsIndex, 1);
        return { selectedSlots: updated };
      } else {
        // Thêm slot đang chọn
        return { selectedSlots: [...state.selectedSlots, slot] };
      }
    }),

  removeSlot: (courtId, timeSlot) =>
    set((state) => ({
      selectedSlots: state.selectedSlots.filter(
        (s) => !(s.courtId === courtId && s.timeSlot === timeSlot)
      ),
    })),

  clearSlots: () => set({ selectedSlots: [] }),

  setIsMatchmakingEnabled: (enabled) => set({ isMatchmakingEnabled: enabled }),

  setMatchmakingConfig: (level, needed) =>
    set({ matchmakingLevel: level, neededPlayers: needed }),

  applyVoucher: (code) => {
    if (code.toUpperCase() === 'BADMINTON20') {
      set({ voucherCode: 'BADMINTON20', discountAmount: 20000 });
      return true;
    }
    return false;
  },

  decrementTimer: () =>
    set((state) => ({
      holdSecondsRemaining: Math.max(0, state.holdSecondsRemaining - 1),
    })),

  resetTimer: () => set({ holdSecondsRemaining: 600 }),
}));
