import { SportType, MatchRoomStatus, ParticipantStatus } from '@prisma/client';

// ==========================================
// QUERY FILTERS (Bộ lọc đa tiêu chí Sảnh Tìm Kèo)
// ==========================================

export interface MatchRoomFilterParams {
  districtSlug?: string;       // VD: "quan-cau-giay"
  sportType?: SportType;       // BADMINTON | PICKLEBALL | FOOTBALL
  skillLevel?: string;         // "TB-Khá", "Mới chơi", "Bán chuyên", etc.
  dateFilter?: 'today' | 'tomorrow' | 'weekend';
  page?: number;
  limit?: number;
}

// ==========================================
// RESPONSE TYPES (Chuẩn RESTful + Phân trang)
// ==========================================

export interface MatchRoomCardResponse {
  id: string;
  title: string;                    // "Sân Cầu Lông Dịch Vọng"
  sportType: SportType;
  sportTag: string;                 // "🏸 Cầu lông • TB-Khá"
  skillLevel: string;               // "TB-Khá"
  pricePerPerson: number;           // 65000
  maxPlayers: number;               // 6
  currentPlayers: number;           // 4
  status: MatchRoomStatus;          // OPEN | FULL
  playDate: string;                 // "2025-10-24"
  timeSlot: string;                 // "19:00 - 21:00"
  venueName: string;                // "Sân Cầu Lông Dịch Vọng"
  address: string;                  // "Quận Cầu Giấy"
  waitlistCount: number;            // Số người trong hàng chờ
  availableSlots: number;           // maxPlayers - currentPlayers
  dateLabel: string;                // "Hôm nay", "Ngày mai", etc.
  createdAt: string;
}

export interface MatchRoomListResponse {
  rooms: MatchRoomCardResponse[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRooms: number;
    limit: number;
    showing: number;              // Đang hiển thị bao nhiêu
  };
}

// ==========================================
// CREATE MATCH ROOM (Tạo kèo mới)
// ==========================================

export interface CreateMatchRoomInput {
  bookingId?: string;              // Liên kết với đơn đặt sân đã thanh toán
  title: string;                   // Tên sân
  sportType: SportType;
  skillLevel: string;
  pricePerPerson: number;
  maxPlayers: number;
  playDate: string;
  timeSlot: string;
  venueName: string;
  address: string;
  description?: string;
  creatorName: string;
  creatorPhone?: string;
}

// ==========================================
// JOIN MATCH ROOM (Tham gia kèo)
// ==========================================

export interface JoinMatchRoomInput {
  matchRoomId: string;
  playerName: string;
  playerPhone?: string;
}

export interface JoinMatchRoomResponse {
  matchRoomId: string;
  playerName: string;
  status: ParticipantStatus;       // CONFIRMED | WAITLISTED
  currentPlayers: number;
  maxPlayers: number;
  waitlistPosition?: number;       // Vị trí trong hàng chờ
  message: string;
}
