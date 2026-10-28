import { create } from 'zustand';

export interface MatchRoomCard {
  id: string;
  title: string;
  sportType: string;
  sportTag: string;
  skillLevel: string;
  pricePerPerson: number;
  maxPlayers: number;
  currentPlayers: number;
  status: string;
  playDate: string;
  timeSlot: string;
  venueName: string;
  address: string;
  waitlistCount: number;
  availableSlots: number;
  dateLabel: string;
  createdAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalRooms: number;
  limit: number;
  showing: number;
}

interface MatchmakingState {
  // Bộ lọc đa tiêu chí
  districtSlug: string;
  sportType: string;
  skillLevel: string;
  dateFilter: 'today' | 'tomorrow' | 'weekend' | '';

  // Dữ liệu
  rooms: MatchRoomCard[];
  pagination: Pagination;
  isLoading: boolean;

  // Actions
  setDistrictSlug: (slug: string) => void;
  setSportType: (type: string) => void;
  setSkillLevel: (level: string) => void;
  setDateFilter: (filter: 'today' | 'tomorrow' | 'weekend' | '') => void;
  setRooms: (rooms: MatchRoomCard[]) => void;
  setPagination: (pagination: Pagination) => void;
  setIsLoading: (loading: boolean) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
}

export const useMatchmakingStore = create<MatchmakingState>((set) => ({
  districtSlug: '',
  sportType: '',
  skillLevel: '',
  dateFilter: 'today',

  rooms: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalRooms: 0,
    limit: 9,
    showing: 0,
  },
  isLoading: false,

  setDistrictSlug: (slug) => set({ districtSlug: slug }),
  setSportType: (type) => set({ sportType: type }),
  setSkillLevel: (level) => set({ skillLevel: level }),
  setDateFilter: (filter) => set({ dateFilter: filter }),
  setRooms: (rooms) => set({ rooms }),
  setPagination: (pagination) => set({ pagination }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setPage: (page) =>
    set((state) => ({
      pagination: { ...state.pagination, currentPage: page },
    })),
  resetFilters: () =>
    set({
      districtSlug: '',
      sportType: '',
      skillLevel: '',
      dateFilter: 'today',
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalRooms: 0,
        limit: 9,
        showing: 0,
      },
    }),
}));
