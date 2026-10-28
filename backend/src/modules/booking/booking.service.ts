import { redis } from '../../config/redis';
import { bookingRepository } from './booking.repository';
import { vietqrService } from '../payment/vietqr.service';
import { bookingQueue } from '../../jobs/bookingExpirationWorker';
import { AppError } from '../../middlewares/errorHandler';
import { io } from '../../server';
import { HoldBookingInput, HoldBookingResponse } from './booking.types';

export class BookingService {
  /**
   * Giữ chỗ tạm thời trong 10 phút (600 giây) bằng Redis Distributed Lock (SET NX EX 600)
   * Phát sự kiện Socket.io slot_locked và lập lịch BullMQ giải phóng slot
   */
  async holdBooking(input: HoldBookingInput): Promise<HoldBookingResponse> {
    const { venueId, customerName, customerPhone, slots, voucherCode, isMatchmakingEnabled } = input;

    // Sinh mã đơn hàng dạng #BK-8902
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `#BK-${randomSuffix}`;

    // 1. Kiểm tra xung đột trong cơ sở dữ liệu
    const conflicted = await bookingRepository.checkSlotsConflicted(slots);
    if (conflicted) {
      throw new AppError(
        `Khung giờ ${conflicted.timeSlot} tại sân ${conflicted.court.name} đã có người đặt hoặc đang giữ chỗ.`,
        409
      );
    }

    // 2. Thực hiện REDIS DISTRIBUTED LOCK (NX EX 600) cho từng slot
    // Khóa slot trong 10 phút (600s). Nếu bất kỳ slot nào bị trùng, rollback toàn bộ khóa trước đó.
    const acquiredLockKeys: string[] = [];
    const TTL_SECONDS = Number(process.env.BOOKING_HOLD_TTL_SECONDS) || 600;

    try {
      for (const slot of slots) {
        const lockKey = `lock:court:${slot.courtId}:${slot.date}:${slot.timeSlot}`;
        // Lệnh Redis chuẩn: SET key value NX EX 600
        const lockResult = await redis.set(lockKey, bookingCode, 'EX', TTL_SECONDS, 'NX');

        if (!lockResult) {
          // Có người khác đang giữ chỗ slot này! Rollback các khóa đã chiếm
          console.warn(`🔒 Xung đột Redis Lock tại key: ${lockKey}`);
          for (const key of acquiredLockKeys) {
            await redis.del(key);
          }
          throw new AppError(
            `Khung giờ ${slot.timeSlot} vừa được người khác chọn trước bạn một tích tắc. Vui lòng chọn giờ khác!`,
            409
          );
        }
        acquiredLockKeys.push(lockKey);
      }
    } catch (redisErr) {
      if (redisErr instanceof AppError) throw redisErr;
      console.warn('⚠️ Redis Lock cảnh báo (bỏ qua nếu test offline):', (redisErr as Error).message);
    }

    // 3. Tính toán tiền giờ chuẩn vs giờ vàng
    let totalStandardAmount = 0;
    let totalPeakAmount = 0;

    slots.forEach((s) => {
      if (s.isPeakHour) {
        totalPeakAmount += s.price;
      } else {
        totalStandardAmount += s.price;
      }
    });

    // 4. Áp dụng mã giảm giá nếu có
    let discountAmount = 0;
    let validVoucherCode: string | undefined = undefined;

    if (voucherCode) {
      const voucher = await bookingRepository.findVoucherByCode(voucherCode);
      if (voucher && voucher.isActive && new Date() <= voucher.endDate) {
        if (totalStandardAmount + totalPeakAmount >= voucher.minOrderValue) {
          discountAmount = voucher.discountAmount;
          validVoucherCode = voucher.code;
        }
      }
    }

    const subtotal = totalStandardAmount + totalPeakAmount;
    const finalAmount = Math.max(0, subtotal - discountAmount);

    const holdExpiresAt = new Date(Date.now() + TTL_SECONDS * 1000);

    // 5. Lưu đơn hàng vào PostgreSQL qua Prisma Transaction
    const booking = await bookingRepository.createHoldingBooking({
      bookingCode,
      venueId,
      customerName,
      customerPhone,
      totalStandardAmount,
      totalPeakAmount,
      discountAmount,
      finalAmount,
      voucherCode: validVoucherCode,
      holdExpiresAt,
      isMatchmakingEnabled: Boolean(isMatchmakingEnabled),
      slots,
    });

    // 6. Đẩy tác vụ vào hàng đợi BullMQ để tự động giải phóng sau 600 giây
    try {
      await bookingQueue.add(
        'expire-hold',
        {
          bookingId: booking.id,
          venueId,
          slots: slots.map((s) => ({
            courtId: s.courtId,
            date: s.date,
            timeSlot: s.timeSlot,
          })),
        },
        {
          delay: TTL_SECONDS * 1000,
          jobId: `expire-${booking.id}`,
        }
      );
    } catch (queueErr) {
      console.warn('⚠️ BullMQ Queue add warning:', (queueErr as Error).message);
    }

    // 7. Sinh thông tin thanh toán VietQR
    const payment = vietqrService.generatePaymentInfo({
      amount: finalAmount,
      bookingCode: booking.bookingCode,
    });

    // 8. Phát sự kiện Socket.io 'slot_locked' realtime đến phòng của Cụm Sân
    io.to(`venue_${venueId}`).emit('slot_locked', {
      venueId,
      bookingCode: booking.bookingCode,
      slots: slots.map((s) => ({
        courtId: s.courtId,
        date: s.date,
        timeSlot: s.timeSlot,
        ttlSeconds: TTL_SECONDS,
      })),
    });

    return {
      bookingId: booking.id,
      bookingCode: booking.bookingCode,
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      finalAmount: booking.finalAmount,
      discountAmount: booking.discountAmount,
      totalStandardAmount: booking.totalStandardAmount,
      totalPeakAmount: booking.totalPeakAmount,
      holdExpiresAt: holdExpiresAt.toISOString(),
      ttlSecondsRemaining: TTL_SECONDS,
      payment,
    };
  }

  /**
   * Giải phóng slot khi khách bấm hủy đơn
   */
  async releaseBooking(bookingId: string) {
    const booking = await bookingRepository.releaseBookingSlots(bookingId);
    return booking;
  }

  /**
   * Áp dụng mã giảm giá (Voucher)
   */
  async applyVoucher(code: string, orderTotal: number) {
    const voucher = await bookingRepository.findVoucherByCode(code);
    if (!voucher) {
      throw new AppError('Mã giảm giá không tồn tại trên hệ thống.', 404);
    }

    if (!voucher.isActive || new Date() > voucher.endDate) {
      throw new AppError('Mã giảm giá đã hết hạn sử dụng.', 400);
    }

    if (orderTotal < voucher.minOrderValue) {
      throw new AppError(
        `Đơn hàng chưa đạt giá trị tối thiểu ${voucher.minOrderValue.toLocaleString('vi-VN')}đ để dùng mã này.`,
        400
      );
    }

    return {
      code: voucher.code,
      discountAmount: voucher.discountAmount,
      description: voucher.description,
    };
  }

  /**
   * Xử lý Idempotent Webhook xác nhận thanh toán từ VietQR / PayOS
   */
  async handleVietQRWebhook(payload: {
    bookingCode: string;
    amount: number;
    referenceCode?: string;
  }) {
    const booking = await bookingRepository.findByBookingCode(payload.bookingCode);
    if (!booking) {
      throw new AppError(`Không tìm thấy đơn đặt sân với mã: ${payload.bookingCode}`, 404);
    }

    // Kiểm tra Idempotency: Nếu đơn đã thanh toán rồi thì trả về ngay lập tức
    if (booking.status === 'CONFIRMED') {
      return {
        isAlreadyProcessed: true,
        booking,
        message: 'Đơn hàng này đã được xác nhận thanh toán trước đó.',
      };
    }

    // Xác nhận thanh toán & chuyển trạng thái sang CONFIRMED
    const referenceCode = payload.referenceCode || `MB${Date.now()}`;
    const confirmedBooking = await bookingRepository.confirmBookingPayment({
      bookingId: booking.id,
      referenceCode,
      amount: payload.amount,
      matchmakingData: {
        skillLevel: 'Trung bình (B / C+)',
        neededPlayers: 2,
      },
    });

    // Xóa Redis lock tạm thời
    try {
      for (const slot of booking.slots) {
        const lockKey = `lock:court:${slot.courtId}:${slot.date}:${slot.timeSlot}`;
        await redis.del(lockKey);
      }
    } catch (redisErr) {
      console.warn('⚠️ Lỗi xóa Redis Lock sau thanh toán:', redisErr);
    }

    // Phát sự kiện Socket.io 'booking_confirmed' tới màn hình Người chơi & Chủ sân (CourtSync OS)
    io.to(`venue_${booking.venueId}`).emit('booking_confirmed', {
      bookingId: booking.id,
      bookingCode: booking.bookingCode,
      venueId: booking.venueId,
      customerName: booking.customerName,
      finalAmount: booking.finalAmount,
      slots: booking.slots.map((s) => ({
        courtId: s.courtId,
        date: s.date,
        timeSlot: s.timeSlot,
      })),
      isMatchmakingEnabled: booking.isMatchmakingEnabled,
    });

    return {
      isAlreadyProcessed: false,
      booking: confirmedBooking,
      message: 'Xác nhận thanh toán VietQR thành công.',
    };
  }
}

export const bookingService = new BookingService();
