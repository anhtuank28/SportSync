import { Request, Response, NextFunction } from 'express';
import { ownerService } from './owner.service';
import { sendResponse } from '../../utils/response';

export class OwnerController {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = (req.params.slug as string) || 'cum-san-cau-long-cau-giay';
      const date = (req.query.date as string) || '2025-10-24';

      const data = await ownerService.getDashboardData(slug, date);

      return sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Lấy dữ liệu trung tâm điều hành CourtSync OS thành công',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async createCounterBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ownerService.createCounterBooking(req.body);

      return sendResponse(res, {
        success: true,
        statusCode: 201,
        message: `Tạo đơn đặt sân tại quầy thành công! Mã đơn: ${result.booking.bookingCode}`,
        data: {
          bookingCode: result.booking.bookingCode,
          customerName: result.booking.customerName,
          amount: result.booking.finalAmount,
          timeSlot: result.slot.timeSlot,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const ownerController = new OwnerController();
