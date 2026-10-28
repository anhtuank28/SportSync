import { Queue, Worker, Job } from 'bullmq';
import { redis } from '../config/redis';
import { prisma } from '../config/database';
import { io } from '../server';

const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || 'redispassword',
};

// 1. Khởi tạo BullMQ Queue cho tác vụ tự động hủy slot giữ chỗ quá 10 phút
export const bookingQueue =
  process.env.NODE_ENV === 'test'
    ? ({ add: async () => {} } as any)
    : new Queue('booking-expiration', {
        connection: redisConnection,
        defaultJobOptions: {
          removeOnComplete: true,
          removeOnFail: 100,
        },
      });

export interface BookingExpirationJobData {
  bookingId: string;
  venueId: string;
  slots: Array<{
    courtId: string;
    date: string;
    timeSlot: string;
  }>;
}

// 2. Worker xử lý giải phóng slot khi hết hạn giữ chỗ (TTL 600s)
export const bookingExpirationWorker =
  process.env.NODE_ENV === 'test'
    ? ({ on: () => {} } as any)
    : new Worker<BookingExpirationJobData>(
  'booking-expiration',
  async (job: Job<BookingExpirationJobData>) => {
    const { bookingId, venueId, slots } = job.data;
    console.log(`⏱️ [BullMQ Worker] Kiểm tra hạn giữ chỗ cho đơn: ${bookingId}`);

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { slots: true },
    });

    // Nếu đơn hàng vẫn ở trạng thái HOLDING (chưa thanh toán sau 10 phút)
    if (booking && booking.status === 'HOLDING') {
      console.log(`⌛ [BullMQ Worker] Đơn ${booking.bookingCode} đã hết hạn 10 phút! Tiến hành giải phóng slot...`);

      // Cập nhật trạng thái đơn sang EXPIRED
      await prisma.$transaction([
        prisma.booking.update({
          where: { id: bookingId },
          data: { status: 'EXPIRED' },
        }),
        prisma.bookingSlot.updateMany({
          where: { bookingId },
          data: { status: 'EXPIRED' },
        }),
      ]);

      // Xóa Redis Distributed Lock cho từng slot
      try {
        for (const slot of slots) {
          const lockKey = `lock:court:${slot.courtId}:${slot.date}:${slot.timeSlot}`;
          await redis.del(lockKey);
        }
      } catch (redisErr) {
        console.warn('⚠️ Lỗi khi xóa Redis Lock (worker):', redisErr);
      }

      // Phát sự kiện Socket.io thông báo ô lịch đã được giải phóng cho tất cả người chơi
      io.to(`venue_${venueId}`).emit('slots_released', {
        bookingId,
        venueId,
        slots,
        message: 'Các ô giữ chỗ đã hết hạn và mở lại cho người chơi khác.',
      });

      console.log(`✅ [BullMQ Worker] Đã giải phóng thành công ${slots.length} slot cho đơn ${booking.bookingCode}`);
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

if (process.env.NODE_ENV !== 'test') {
  bookingExpirationWorker.on('completed', (job: Job) => {
    console.log(`🎯 Job BullMQ #${job.id} hoàn thành.`);
  });

  bookingExpirationWorker.on('failed', (job: Job | undefined, err: Error) => {
    console.error(`💥 Job BullMQ #${job?.id} thất bại:`, err.message);
  });
}
