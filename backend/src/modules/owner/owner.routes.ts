import { Router } from 'express';
import { ownerController } from './owner.controller';
import { validateRequest } from '../../middlewares/validate';
import { getOwnerDashboardSchema, createCounterBookingSchema } from './owner.validation';

const router = Router();

// GET /api/v1/owner/venues/:slug/dashboard?date=2025-10-24
router.get(
  '/venues/:slug/dashboard',
  validateRequest(getOwnerDashboardSchema),
  ownerController.getDashboard
);

// POST /api/v1/owner/bookings/counter
router.post(
  '/bookings/counter',
  validateRequest(createCounterBookingSchema),
  ownerController.createCounterBooking
);

export default router;
