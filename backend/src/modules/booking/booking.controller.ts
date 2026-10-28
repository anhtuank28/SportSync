import { Request, Response, NextFunction } from 'express';
import { bookingService } from './booking.service';
import { sendResponse } from '../../utils/response';

export class BookingController {
  async hold(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await bookingService.holdBooking(req.body);

      return sendResponse(res, {
        success: true,
        statusCode: 201,
        message: 'Giữ chỗ tạm thời thành công trong 10 phút. Vui lòng hoàn tất thanh toán VietQR.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async release(req: Request, res: Response, next: NextFunction) {
    try {
      const bookingId = req.params.id as string;
      const result = await bookingService.releaseBooking(bookingId);

      return sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Đã hủy giữ chỗ thành công.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async applyVoucher(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, orderTotal } = req.body;
      const result = await bookingService.applyVoucher(code, orderTotal);

      return sendResponse(res, {
        success: true,
        statusCode: 200,
        message: `Áp dụng thành công mã giảm giá ${result.code}`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async webhookVietQR(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await bookingService.handleVietQRWebhook(req.body);

      return sendResponse(res, {
        success: true,
        statusCode: 200,
        message: result.message,
        data: {
          bookingCode: result.booking.bookingCode,
          status: result.booking.status,
          finalAmount: result.booking.finalAmount,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const bookingController = new BookingController();
