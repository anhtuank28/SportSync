import { matchmakingRepository } from './matchmaking.repository';
import { AppError } from '../../middlewares/errorHandler';
import { io } from '../../server';
import {
  MatchRoomFilterParams,
  MatchRoomCardResponse,
  MatchRoomListResponse,
  CreateMatchRoomInput,
  JoinMatchRoomInput,
  JoinMatchRoomResponse,
} from './matchmaking.types';
import { SportType, ParticipantStatus } from '@prisma/client';

export class MatchmakingService {
  /**
   * Lấy danh sách phòng kèo với bộ lọc đa tiêu chí + phân trang
   * Theo mockup: Hiển thị 9 trên 38 phòng mở tại Hà Nội
   */
  async listMatchRooms(filters: MatchRoomFilterParams): Promise<MatchRoomListResponse> {
    const { rooms, totalRooms, page, limit } = await matchmakingRepository.findMatchRooms(filters);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const roomCards: MatchRoomCardResponse[] = rooms.map((room) => {
      // Đếm số người trong hàng chờ (WAITLISTED)
      const waitlistCount = room.participants.filter(
        (p) => p.status === ParticipantStatus.WAITLISTED
      ).length;

      // Tạo nhãn ngày hiển thị
      const dateLabel = this.getDateLabel(room.playDate, today);

      return {
        id: room.id,
        title: room.title,
        sportType: room.sportType,
        sportTag: room.sportTag,
        skillLevel: room.skillLevel,
        pricePerPerson: room.pricePerPerson,
        maxPlayers: room.maxPlayers,
        currentPlayers: room.currentPlayers,
        status: room.status,
        playDate: room.playDate,
        timeSlot: room.timeSlot,
        venueName: room.venueName,
        address: room.address,
        waitlistCount,
        availableSlots: Math.max(0, room.maxPlayers - room.currentPlayers),
        dateLabel,
        createdAt: room.createdAt.toISOString(),
      };
    });

    const totalPages = Math.ceil(totalRooms / limit);

    return {
      rooms: roomCards,
      pagination: {
        currentPage: page,
        totalPages,
        totalRooms,
        limit,
        showing: roomCards.length,
      },
    };
  }

  /**
   * Tạo phòng kèo mới (+ Tạo kèo mới từ mockup)
   * Liên kết với đơn đặt sân đã thanh toán (bookingId) nếu có
   */
  async createMatchRoom(input: CreateMatchRoomInput): Promise<MatchRoomCardResponse> {
    // Tạo sportTag tự động theo mockup: "🏸 Cầu lông • TB-Khá"
    const sportEmoji = this.getSportEmoji(input.sportType);
    const sportName = this.getSportName(input.sportType);
    const sportTag = `${sportEmoji} ${sportName} • ${input.skillLevel}`;

    const room = await matchmakingRepository.createMatchRoom({
      bookingId: input.bookingId,
      title: input.title,
      sportType: input.sportType as SportType,
      sportTag,
      skillLevel: input.skillLevel,
      pricePerPerson: input.pricePerPerson,
      maxPlayers: input.maxPlayers,
      playDate: input.playDate,
      timeSlot: input.timeSlot,
      venueName: input.venueName,
      address: input.address,
      description: input.description,
      creatorName: input.creatorName,
      creatorPhone: input.creatorPhone,
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result: MatchRoomCardResponse = {
      id: room.id,
      title: room.title,
      sportType: room.sportType,
      sportTag: room.sportTag,
      skillLevel: room.skillLevel,
      pricePerPerson: room.pricePerPerson,
      maxPlayers: room.maxPlayers,
      currentPlayers: room.currentPlayers,
      status: room.status,
      playDate: room.playDate,
      timeSlot: room.timeSlot,
      venueName: room.venueName,
      address: room.address,
      waitlistCount: 0,
      availableSlots: room.maxPlayers - 1,
      dateLabel: this.getDateLabel(room.playDate, today),
      createdAt: room.createdAt.toISOString(),
    };

    // Phát sự kiện Socket.io thông báo kèo mới
    io.emit('match_room_created', result);

    return result;
  }

  /**
   * Tham gia phòng kèo hoặc vào hàng chờ
   * Theo mockup: "● Còn 2 chỗ (4/6)" → Nút Tham gia, "● Đã đủ 6/6 • Chờ (1)" → Nút Hàng chờ
   */
  async joinMatchRoom(input: JoinMatchRoomInput): Promise<JoinMatchRoomResponse> {
    // Kiểm tra phòng tồn tại
    const room = await matchmakingRepository.findMatchRoomById(input.matchRoomId);
    if (!room) {
      throw new AppError('Phòng kèo không tồn tại hoặc đã bị đóng.', 404);
    }

    // Kiểm tra nếu phòng đã COMPLETED hoặc CANCELLED
    if (room.status === 'COMPLETED' || room.status === 'CANCELLED') {
      throw new AppError('Phòng kèo đã kết thúc hoặc bị hủy, không thể tham gia.', 400);
    }

    // Kiểm tra trùng tên người chơi
    const alreadyJoined = room.participants.find(
      (p) =>
        p.playerName === input.playerName &&
        (p.status === ParticipantStatus.CONFIRMED || p.status === ParticipantStatus.WAITLISTED)
    );
    if (alreadyJoined) {
      throw new AppError('Bạn đã tham gia hoặc đang trong hàng chờ phòng kèo này rồi.', 409);
    }

    const result = await matchmakingRepository.joinMatchRoom(
      input.matchRoomId,
      input.playerName,
      input.playerPhone
    );

    const participantStatus = result.participant.status;
    let message: string;

    if (participantStatus === ParticipantStatus.CONFIRMED) {
      message = `Tham gia thành công! Bạn là thành viên thứ ${result.currentPlayers}/${result.maxPlayers}.`;
    } else {
      message = `Phòng đã đủ người. Bạn đang ở vị trí thứ ${result.waitlistPosition} trong hàng chờ.`;
    }

    // Phát sự kiện Socket.io cập nhật realtime
    io.emit('match_room_updated', {
      matchRoomId: input.matchRoomId,
      currentPlayers: result.currentPlayers,
      maxPlayers: result.maxPlayers,
      newPlayer: input.playerName,
      participantStatus,
    });

    return {
      matchRoomId: input.matchRoomId,
      playerName: input.playerName,
      status: participantStatus,
      currentPlayers: result.currentPlayers,
      maxPlayers: result.maxPlayers,
      waitlistPosition: result.waitlistPosition,
      message,
    };
  }

  /**
   * Lấy chi tiết phòng kèo
   */
  async getMatchRoomDetail(roomId: string) {
    const room = await matchmakingRepository.findMatchRoomById(roomId);
    if (!room) {
      throw new AppError('Phòng kèo không tồn tại.', 404);
    }

    const waitlistCount = room.participants.filter(
      (p) => p.status === ParticipantStatus.WAITLISTED
    ).length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      ...room,
      waitlistCount,
      availableSlots: Math.max(0, room.maxPlayers - room.currentPlayers),
      dateLabel: this.getDateLabel(room.playDate, today),
    };
  }

  /**
   * Lấy danh sách quận (cho dropdown bộ lọc)
   */
  async getActiveDistricts() {
    return matchmakingRepository.getActiveDistricts();
  }

  // ==========================================
  // HELPER METHODS
  // ==========================================

  private getDateLabel(playDate: string, today: Date): string {
    const dateObj = new Date(playDate);
    dateObj.setHours(0, 0, 0, 0);

    const diffDays = Math.round(
      (dateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Ngày mai';
    if (diffDays === 2) return 'Ngày kia';

    const dayOfWeek = dateObj.getDay();
    const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return dayNames[dayOfWeek];
  }

  private getSportEmoji(sportType: string): string {
    const map: Record<string, string> = {
      BADMINTON: '🏸',
      PICKLEBALL: '🏓',
      FOOTBALL: '⚽',
      TENNIS: '🎾',
    };
    return map[sportType] || '🏅';
  }

  private getSportName(sportType: string): string {
    const map: Record<string, string> = {
      BADMINTON: 'Cầu lông',
      PICKLEBALL: 'Pickleball',
      FOOTBALL: 'Bóng đá 7',
      TENNIS: 'Tennis',
    };
    return map[sportType] || sportType;
  }
}

export const matchmakingService = new MatchmakingService();
