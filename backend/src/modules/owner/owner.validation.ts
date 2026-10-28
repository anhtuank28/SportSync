import { z } from 'zod';

export const getOwnerDashboardSchema = {
  params: z.object({
    slug: z.string().min(1, 'Slug cụm sân không được để trống'),
  }),
  query: z.object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Định dạng ngày phải là YYYY-MM-DD')
      .optional(),
  }),
};

export const createCounterBookingSchema = {
  body: z.object({
    venueSlug: z.string().min(1, 'Slug cụm sân là bắt buộc'),
    courtId: z.string().min(1, 'ID sân đấu là bắt buộc'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Định dạng ngày phải là YYYY-MM-DD'),
    timeSlot: z.string().min(1, 'Khung giờ là bắt buộc'),
    customerName: z.string().min(2, 'Tên khách hàng tối thiểu 2 ký tự'),
    customerPhone: z.string().min(9, 'Số điện thoại tối thiểu 9 chữ số'),
    price: z.number().int().positive().optional().default(120000),
    notes: z.string().optional(),
  }),
};
