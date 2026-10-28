import { z } from 'zod';

// ==========================================
// VALIDATION: Lọc danh sách phòng kèo (GET /api/v1/matchmaking/rooms)
// ==========================================

export const listMatchRoomsSchema = {
  query: z.object({
    districtSlug: z.string().optional(),
    sportType: z.enum(['BADMINTON', 'PICKLEBALL', 'FOOTBALL', 'TENNIS']).optional(),
    skillLevel: z.string().optional(),
    dateFilter: z.enum(['today', 'tomorrow', 'weekend']).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
};

// ==========================================
// VALIDATION: Tạo phòng kèo mới (POST /api/v1/matchmaking/rooms)
// ==========================================

export const createMatchRoomSchema = {
  body: z.object({
    bookingId: z.string().uuid().optional(),
    title: z.string().min(2, 'Tên sân phải có ít nhất 2 ký tự'),
    sportType: z.enum(['BADMINTON', 'PICKLEBALL', 'FOOTBALL', 'TENNIS']),
    skillLevel: z.string().min(1, 'Trình độ không được để trống'),
    pricePerPerson: z.number().int().min(10000, 'Giá mỗi người tối thiểu 10.000đ'),
    maxPlayers: z.number().int().min(2).max(22, 'Số người chơi từ 2 - 22'),
    playDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày chơi phải theo định dạng YYYY-MM-DD'),
    timeSlot: z.string().min(5, 'Khung giờ không hợp lệ'),
    venueName: z.string().min(2),
    address: z.string().min(2),
    description: z.string().max(500).optional(),
    creatorName: z.string().min(2, 'Tên người tạo phải có ít nhất 2 ký tự'),
    creatorPhone: z.string().optional(),
  }),
};

// ==========================================
// VALIDATION: Tham gia / Hàng chờ kèo (POST /api/v1/matchmaking/rooms/:id/join)
// ==========================================

export const joinMatchRoomSchema = {
  params: z.object({
    id: z.string().uuid('ID phòng kèo không hợp lệ'),
  }),
  body: z.object({
    playerName: z.string().min(2, 'Tên người chơi phải có ít nhất 2 ký tự'),
    playerPhone: z.string().optional(),
  }),
};
