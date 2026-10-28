import { Router } from 'express';
import { venueController } from './venue.controller';
import { validateRequest } from '../../middlewares/validate';
import { getVenueScheduleSchema, getNearbyVenuesSchema } from './venue.validation';

const router = Router();

// 1. Danh sách Quận & Cụm sân
router.get('/districts', venueController.getDistricts);

// 2. Tìm kiếm sân lân cận theo công thức Haversine (bán kính 2.5km)
router.get(
  '/nearby',
  validateRequest(getNearbyVenuesSchema),
  venueController.getNearby
);

// 3. Ma trận lịch chi tiết theo Slug và Ngày
router.get(
  '/:slug/schedule',
  validateRequest(getVenueScheduleSchema),
  venueController.getSchedule
);

export default router;
