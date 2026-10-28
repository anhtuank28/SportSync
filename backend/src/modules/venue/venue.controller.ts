import { Request, Response, NextFunction } from 'express';
import { venueService } from './venue.service';
import { sendResponse } from '../../utils/response';

export class VenueController {
  async getSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;
      const { date } = req.query as { date?: string };

      const scheduleData = await venueService.getVenueSchedule(slug, date);

      return sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Lấy dữ liệu ma trận lịch cụm sân thành công',
        data: scheduleData,
      });
    } catch (error) {
      next(error);
    }
  }

  async getNearby(req: Request, res: Response, next: NextFunction) {
    try {
      const lat = Number(req.query.lat) || 21.0313;
      const lng = Number(req.query.lng) || 105.7892;
      const radius = Number(req.query.radius) || 2.5;
      const excludeSlug = req.query.excludeSlug as string | undefined;

      const nearbyVenues = await venueService.getNearbyVenues(lat, lng, radius, excludeSlug);

      return sendResponse(res, {
        success: true,
        statusCode: 200,
        message: `Lấy danh sách ${nearbyVenues.length} cụm sân trong bán kính ${radius}km thành công`,
        data: nearbyVenues,
        meta: {
          radiusKm: radius,
          centerCoordinates: { lat, lng },
          totalFound: nearbyVenues.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getDistricts(req: Request, res: Response, next: NextFunction) {
    try {
      const districts = await venueService.getDistrictsWithVenues();

      return sendResponse(res, {
        success: true,
        statusCode: 200,
        message: 'Lấy danh sách Quận và cụm sân thành công',
        data: districts,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const venueController = new VenueController();
