import { prisma } from '../../config/database';
import { BookingStatus, PaymentMethod, PaymentStatus, SportType, MatchRoomStatus, ParticipantStatus } from '@prisma/client';

export class BookingRepository {
  async findVoucherByCode(code: string) {
    return prisma.voucher.findUnique({
      where: { code: code.toUpperCase() },
    });
  }

  async checkSlotsConflicted(
    slots: Array<{ courtId: string; date: string; timeSlot: string }>
  ) {
    const conditions = slots.map((s) => ({
      courtId: s.courtId,
      date: s.date,
      timeSlot: s.timeSlot,
      status: { in: [BookingStatus.CONFIRMED, BookingStatus.HOLDING] },
    }));

    return prisma.bookingSlot.findFirst({
      where: { OR: conditions },
      include: { court: true },
    });
  }

  async createHoldingBooking(params: {
    bookingCode: string;
    venueId: string;
    customerName: string;
    customerPhone: string;
    totalStandardAmount: number;
    totalPeakAmount: number;
    discountAmount: number;
    finalAmount: number;
    voucherCode?: string;
    holdExpiresAt: Date;
    isMatchmakingEnabled: boolean;
    slots: Array<{
      courtId: string;
      date: string;
      timeSlot: string;
      price: number;
      isPeakHour: boolean;
    }>;
  }) {
    return prisma.$transaction(async (tx) => {
      // 1. Tạo đơn đặt sân ở trạng thái HOLDING
      const booking = await tx.booking.create({
        data: {
          bookingCode: params.bookingCode,
          venueId: params.venueId,
          customerName: params.customerName,
          customerPhone: params.customerPhone,
          totalStandardAmount: params.totalStandardAmount,
          totalPeakAmount: params.totalPeakAmount,
          discountAmount: params.discountAmount,
          finalAmount: params.finalAmount,
          voucherCode: params.voucherCode,
          paymentMethod: PaymentMethod.VIETQR_AUTO,
          paymentStatus: PaymentStatus.PENDING,
          status: BookingStatus.HOLDING,
          holdExpiresAt: params.holdExpiresAt,
          isMatchmakingEnabled: params.isMatchmakingEnabled,
        },
      });

      // 2. Tạo các slots giữ chỗ
      await tx.bookingSlot.createMany({
        data: params.slots.map((s) => ({
          bookingId: booking.id,
          courtId: s.courtId,
          date: s.date,
          timeSlot: s.timeSlot,
          price: s.price,
          isPeakHour: s.isPeakHour,
          status: BookingStatus.HOLDING,
        })),
      });

      return booking;
    });
  }

  async findByBookingCode(bookingCode: string) {
    return prisma.booking.findUnique({
      where: { bookingCode },
      include: {
        venue: true,
        slots: { include: { court: true } },
      },
    });
  }

  async confirmBookingPayment(params: {
    bookingId: string;
    referenceCode: string;
    amount: number;
    matchmakingData?: {
      skillLevel: string;
      neededPlayers: number;
    };
  }) {
    return prisma.$transaction(async (tx) => {
      // 1. Cập nhật trạng thái đơn sang CONFIRMED
      const booking = await tx.booking.update({
        where: { id: params.bookingId },
        data: {
          status: BookingStatus.CONFIRMED,
          paymentStatus: PaymentStatus.SUCCESS,
        },
        include: { venue: true, slots: true },
      });

      // 2. Cập nhật toàn bộ slots sang CONFIRMED
      await tx.bookingSlot.updateMany({
        where: { bookingId: params.bookingId },
        data: { status: BookingStatus.CONFIRMED },
      });

      // 3. Ghi vết giao dịch Transaction
      await tx.transaction.create({
        data: {
          bookingId: params.bookingId,
          paymentMethod: PaymentMethod.VIETQR_AUTO,
          amount: params.amount,
          referenceCode: params.referenceCode,
          status: PaymentStatus.SUCCESS,
        },
      });

      // 4. Nếu khách hàng bật toggle "Mở phòng tuyển giao lưu", tự động tạo MatchRoom
      if (booking.isMatchmakingEnabled) {
        const firstSlot = booking.slots[0];
        const room = await tx.matchRoom.create({
          data: {
            bookingId: booking.id,
            title: booking.venue.name,
            sportType: SportType.BADMINTON,
            sportTag: `🏸 Cầu lông • ${params.matchmakingData?.skillLevel || 'Trung bình'}`,
            skillLevel: params.matchmakingData?.skillLevel || 'Trung bình (B / C+)',
            pricePerPerson: Math.round(booking.finalAmount / (params.matchmakingData?.neededPlayers || 2)),
            maxPlayers: (params.matchmakingData?.neededPlayers || 2) + 1,
            currentPlayers: 1, // Người tạo đơn là người đầu tiên
            status: MatchRoomStatus.OPEN,
            playDate: firstSlot?.date || '2025-10-24',
            timeSlot: firstSlot?.timeSlot || '18:00 - 20:00',
            venueName: booking.venue.name,
            address: booking.venue.address,
          },
        });

        // Thêm người đặt sân vào danh sách tham gia chính thức
        await tx.matchParticipant.create({
          data: {
            matchRoomId: room.id,
            playerName: booking.customerName,
            playerPhone: booking.customerPhone,
            status: ParticipantStatus.CONFIRMED,
          },
        });
      }

      return booking;
    });
  }

  async releaseBookingSlots(bookingId: string) {
    return prisma.$transaction([
      prisma.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.CANCELLED },
      }),
      prisma.bookingSlot.updateMany({
        where: { bookingId },
        data: { status: BookingStatus.CANCELLED },
      }),
    ]);
  }
}

export const bookingRepository = new BookingRepository();
