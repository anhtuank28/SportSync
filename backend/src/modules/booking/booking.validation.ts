import { z } from 'zod';

export const holdBookingSchema = {
  body: z.object({
    venueId: z.string().min(1, 'Mã cụm sân không được để trống'),
    customerName: z.string().min(2, 'Tên khách hàng tối thiểu 2 ký tự').default('Khách Hàng SportSync'),
    customerPhone: z.string().min(9, 'Số điện thoại không hợp lệ').default('0912345456'),
    slots: z
      .array(
        z.object({
          courtId: z.string().min(1, 'Mã sân con không được để trống'),
          courtName: z.string().optional(),
          date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Định dạng ngày phải là YYYY-MM-DD'),
          timeSlot: z.string().min(1, 'Khung giờ không được để trống'),
          price: z.number().positive('Giá slot phải lớn hơn 0'),
          isPeakHour: z.boolean().default(false),
        })
      )
      .min(1, 'Phải chọn ít nhất 1 khung giờ'),
    voucherCode: z.string().optional(),
    isMatchmakingEnabled: z.boolean().default(false),
    matchmakingLevel: z.string().optional(),
    neededPlayers: z.number().int().min(1).max(20).optional(),
  }),
};

export const applyVoucherSchema = {
  body: z.object({
    code: z.string().min(1, 'Mã giảm giá không được để trống'),
    venueId: z.string().optional(),
    orderTotal: z.number().positive(),
  }),
};

export const vietqrWebhookSchema = {
  body: z.object({
    bookingCode: z.string().min(1),
    amount: z.number().positive(),
    referenceCode: z.string().optional(),
    transactionTime: z.string().optional(),
  }),
};
