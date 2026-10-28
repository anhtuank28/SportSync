import prisma from '../../config/database';
import { BookingStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import { CreateCounterBookingInput } from './owner.types';

export class OwnerRepository {
  async getVenueBySlug(slug: string) {
    return prisma.venue.findUnique({
      where: { slug },
      include: {
        courts: {
          orderBy: { courtNumber: 'asc' },
        },
      },
    });
  }

  async getBookingsForDate(venueId: string, date: string) {
    return prisma.booking.findMany({
      where: {
        venueId,
        slots: {
          some: {
            date,
          },
        },
      },
      include: {
        slots: {
          include: {
            court: true,
          },
        },
        transactions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getRecentTransactions(venueId: string, limit: number = 20) {
    return prisma.booking.findMany({
      where: {
        venueId,
      },
      include: {
        slots: {
          include: {
            court: true,
          },
          orderBy: {
            timeSlot: 'asc',
          },
        },
        transactions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  async createCounterBooking(input: CreateCounterBookingInput) {
    const bookingCode = `#BK-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalAmount = input.price || 120000;

    return prisma.$transaction(async (tx) => {
      // 1. Kiểm tra chống trùng lịch vật lý trước khi tạo
      const existingSlot = await tx.bookingSlot.findUnique({
        where: {
          unique_court_date_timeslot: {
            courtId: input.courtId,
            date: input.date,
            timeSlot: input.timeSlot,
          },
        },
      });

      if (existingSlot && existingSlot.status !== BookingStatus.CANCELLED && existingSlot.status !== BookingStatus.EXPIRED) {
        throw new Error(`Khung giờ ${input.timeSlot} tại sân này đã có người giữ chỗ hoặc đã thanh toán!`);
      }

      // 2. Tìm venue theo slug
      const venue = await tx.venue.findUnique({
        where: { slug: input.venueSlug },
      });

      if (!venue) {
        throw new Error('Không tìm thấy cụm sân');
      }

      // 3. Tạo Booking với CASH_AT_COUNTER và CONFIRMED
      const booking = await tx.booking.create({
        data: {
          bookingCode,
          venueId: venue.id,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          totalPeakAmount: finalAmount,
          finalAmount,
          paymentMethod: PaymentMethod.CASH_AT_COUNTER,
          paymentStatus: PaymentStatus.SUCCESS,
          status: BookingStatus.CONFIRMED,
          notes: input.notes || 'Thu tiền mặt tại quầy',
        },
      });

      // 4. Tạo BookingSlot vật lý
      const slot = await tx.bookingSlot.create({
        data: {
          bookingId: booking.id,
          courtId: input.courtId,
          date: input.date,
          timeSlot: input.timeSlot,
          price: finalAmount,
          isPeakHour: true,
          status: BookingStatus.CONFIRMED,
        },
      });

      // 5. Tạo Transaction tiền mặt
      const transaction = await tx.transaction.create({
        data: {
          bookingId: booking.id,
          paymentMethod: PaymentMethod.CASH_AT_COUNTER,
          amount: finalAmount,
          referenceCode: `CASH-${Date.now().toString().slice(-6)}`,
          status: PaymentStatus.SUCCESS,
        },
      });

      return { booking, slot, transaction };
    });
  }
}

export const ownerRepository = new OwnerRepository();
