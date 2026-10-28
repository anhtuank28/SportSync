import { Router } from 'express';
import { bookingController } from './booking.controller';
import { validateRequest } from '../../middlewares/validate';
import {
  holdBookingSchema,
  applyVoucherSchema,
  vietqrWebhookSchema,
} from './booking.validation';

const router = Router();

// 1. Giữ chỗ slot bằng Redis Distributed Lock (SET NX EX 600)
router.post('/hold', validateRequest(holdBookingSchema), bookingController.hold);

// 2. Hủy giữ chỗ / giải phóng slot
router.post('/:id/release', bookingController.release);

// 3. Áp dụng mã giảm giá voucher (BADMINTON20)
router.post('/vouchers/apply', validateRequest(applyVoucherSchema), bookingController.applyVoucher);

// 4. Webhook VietQR / PayOS xác nhận thanh toán (Idempotent)
router.post('/webhook/vietqr', validateRequest(vietqrWebhookSchema), bookingController.webhookVietQR);

export default router;
