import { prisma } from '../../config/database';
import { MatchRoomStatus, ParticipantStatus, SportType, Prisma } from '@prisma/client';
import { MatchRoomFilterParams } from './matchmaking.types';

export class MatchmakingRepository {
  /**
   * Lấy danh sách phòng kèo với bộ lọc đa tiêu chí + phân trang
   * Hỗ trợ lọc theo: Quận, Môn thể thao, Trình độ, Ngày (Hôm nay / Ngày mai / Cuối tuần)
   */
  async findMatchRooms(filters: MatchRoomFilterParams) {
    const { districtSlug, sportType, skillLevel, dateFilter, page = 1, limit = 9 } = filters;

    const where: Prisma.MatchRoomWhereInput = {
      status: { in: [MatchRoomStatus.OPEN, MatchRoomStatus.FULL] },
    };

    // Lọc theo môn thể thao
    if (sportType) {
      where.sportType = sportType;
    }

    // Lọc theo trình độ
    if (skillLevel) {
      where.skillLevel = { contains: skillLevel, mode: 'insensitive' };
    }

    // Lọc theo ngày (Hôm nay / Ngày mai / Cuối tuần)
    if (dateFilter) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dateFilter === 'today') {
        const dateStr = today.toISOString().split('T')[0];
        where.playDate = dateStr;
      } else if (dateFilter === 'tomorrow') {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        where.playDate = tomorrow.toISOString().split('T')[0];
      } else if (dateFilter === 'weekend') {
        // Tìm thứ Bảy và Chủ Nhật gần nhất
        const dayOfWeek = today.getDay();
        const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
        const saturday = new Date(today);
        saturday.setDate(today.getDate() + daysUntilSaturday);
        const sunday = new Date(saturday);
        sunday.setDate(saturday.getDate() + 1);

        where.playDate = {
          in: [
            saturday.toISOString().split('T')[0],
            sunday.toISOString().split('T')[0],
          ],
        };
      }
    }

    // Lọc theo quận (thông qua address chứa tên quận)
    if (districtSlug) {
      // Tìm quận theo slug để lấy tên
      const district = await prisma.district.findUnique({
        where: { slug: districtSlug },
      });
      if (district) {
        where.address = { contains: district.name, mode: 'insensitive' };
      }
    }

    // Đếm tổng số phòng
    const totalRooms = await prisma.matchRoom.count({ where });

    // Lấy danh sách phòng có phân trang
    const rooms = await prisma.matchRoom.findMany({
      where,
      include: {
        participants: {
          select: {
            id: true,
            playerName: true,
            status: true,
          },
        },
        booking: {
          select: {
            id: true,
            bookingCode: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { rooms, totalRooms, page, limit };
  }

  /**
   * Lấy chi tiết một phòng kèo theo ID
   */
  async findMatchRoomById(id: string) {
    return prisma.matchRoom.findUnique({
      where: { id },
      include: {
        participants: {
          select: {
            id: true,
            playerName: true,
            playerPhone: true,
            status: true,
            joinedAt: true,
          },
          orderBy: { joinedAt: 'asc' },
        },
        booking: {
          select: {
            id: true,
            bookingCode: true,
            venue: {
              select: { name: true, address: true },
            },
          },
        },
      },
    });
  }

  /**
   * Tạo phòng kèo mới
   */
  async createMatchRoom(data: {
    bookingId?: string;
    creatorId?: string;
    title: string;
    sportType: SportType;
    sportTag: string;
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
  }) {
    return prisma.$transaction(async (tx) => {
      // 1. Tạo phòng kèo
      const room = await tx.matchRoom.create({
        data: {
          bookingId: data.bookingId,
          creatorId: data.creatorId,
          title: data.title,
          sportType: data.sportType,
          sportTag: data.sportTag,
          skillLevel: data.skillLevel,
          pricePerPerson: data.pricePerPerson,
          maxPlayers: data.maxPlayers,
          currentPlayers: 1, // Người tạo kèo là thành viên đầu tiên
          status: MatchRoomStatus.OPEN,
          playDate: data.playDate,
          timeSlot: data.timeSlot,
          venueName: data.venueName,
          address: data.address,
          description: data.description,
        },
      });

      // 2. Thêm người tạo kèo vào danh sách tham gia
      await tx.matchParticipant.create({
        data: {
          matchRoomId: room.id,
          playerName: data.creatorName,
          playerPhone: data.creatorPhone,
          status: ParticipantStatus.CONFIRMED,
        },
      });

      return room;
    });
  }

  /**
   * Tham gia phòng kèo hoặc vào hàng chờ (Waitlist)
   */
  async joinMatchRoom(matchRoomId: string, playerName: string, playerPhone?: string) {
    return prisma.$transaction(async (tx) => {
      const room = await tx.matchRoom.findUnique({
        where: { id: matchRoomId },
        include: {
          participants: {
            where: { status: { in: [ParticipantStatus.CONFIRMED, ParticipantStatus.WAITLISTED] } },
          },
        },
      });

      if (!room) {
        throw new Error('ROOM_NOT_FOUND');
      }

      const confirmedCount = room.participants.filter(
        (p) => p.status === ParticipantStatus.CONFIRMED
      ).length;

      const waitlistedCount = room.participants.filter(
        (p) => p.status === ParticipantStatus.WAITLISTED
      ).length;

      // Kiểm tra nếu phòng còn chỗ → CONFIRMED, nếu đã đủ → WAITLISTED
      let participantStatus: ParticipantStatus;
      let newCurrentPlayers = room.currentPlayers;
      let newRoomStatus = room.status;

      if (confirmedCount < room.maxPlayers) {
        participantStatus = ParticipantStatus.CONFIRMED;
        newCurrentPlayers = confirmedCount + 1;
        // Kiểm tra nếu đã đủ người thì chuyển sang FULL
        if (newCurrentPlayers >= room.maxPlayers) {
          newRoomStatus = MatchRoomStatus.FULL;
        }
      } else {
        participantStatus = ParticipantStatus.WAITLISTED;
      }

      // Tạo bản ghi participant
      const participant = await tx.matchParticipant.create({
        data: {
          matchRoomId,
          playerName,
          playerPhone,
          status: participantStatus,
        },
      });

      // Cập nhật số người trong phòng và trạng thái phòng
      await tx.matchRoom.update({
        where: { id: matchRoomId },
        data: {
          currentPlayers: newCurrentPlayers,
          status: newRoomStatus,
        },
      });

      return {
        participant,
        currentPlayers: newCurrentPlayers,
        maxPlayers: room.maxPlayers,
        waitlistPosition: participantStatus === ParticipantStatus.WAITLISTED
          ? waitlistedCount + 1
          : undefined,
      };
    });
  }

  /**
   * Lấy danh sách quận có phòng kèo đang mở (cho dropdown lọc)
   */
  async getActiveDistricts() {
    return prisma.district.findMany({
      where: {
        venues: {
          some: { isActive: true },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: { name: 'asc' },
    });
  }
}

export const matchmakingRepository = new MatchmakingRepository();
