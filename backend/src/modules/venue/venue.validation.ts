import { z } from 'zod';

export const getVenueScheduleSchema = {
  params: z.object({
    slug: z.string().min(1, 'Slug cụm sân không được để trống'),
  }),
  query: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Định dạng ngày phải là YYYY-MM-DD').optional(),
  }),
};

export const getNearbyVenuesSchema = {
  query: z.object({
    lat: z.coerce.number().min(-90).max(90).default(21.0313),
    lng: z.coerce.number().min(-180).max(180).default(105.7892),
    radius: z.coerce.number().positive().default(2.5), // Bán kính 2.5km mặc định
    excludeSlug: z.string().optional(),
  }),
};
