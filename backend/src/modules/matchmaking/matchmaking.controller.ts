import { Request, Response, NextFunction } from 'express';
import { matchmakingService } from './matchmaking.service';
import { sendResponse } from '../../utils/response';
import { MatchRoomFilterParams } from './matchmaking.types';

class MatchmakingController {
  /**
   * GET /api/v1/matchmaking/rooms
   * Lấy danh sách phòng kèo với bộ lọc đa tiêu chí (Quận, Môn, Trình độ, Ngày) + Phân trang
   */
  async listRooms(req: Request, res: Response, next: NextFunction) {
    try {
      const filters: MatchRoomFilterParams = {
        districtSlug: req.query.districtSlug as string | undefined,
        sportType: req.query.sportType as MatchRoomFilterParams['sportType'],
        skillLevel: req.query.skillLevel as string | undefined,
        dateFilter: req.query.dateFilter as MatchRoomFilterParams['dateFilter'],
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 9,
      };

      const result = await matchmakingService.listMatchRooms(filters);

      return sendResponse(res, {
        success: true,
        statusCode: 200,
        message: `Hiển thị ${result.pagination.showing} trên ${result.pagination.totalRooms} phòng mở tại Hà Nội`,
        data: result.rooms,
        meta: {
          pagination: result.pagination,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/matchmaking/rooms/:id
   * Lấy chi tiết 1 phòng kèo
   */
  async getRoomDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const room = await matchmakingService.getMatchRoomDetail(id);

      return sendResponse(res, {
        success: true,
        statusCode: 200,
        message: `Chi tiết phòng kèo: ${room.title}`,
        data: room,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/matchmaking/rooms
   * Tạo phòng kèo mới (liên kết với đơn đặt sân đã thanh toán)
   */
  async createRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const room = await matchmakingService.createMatchRoom(req.body);

      return sendResponse(res, {
        success: true,
        statusCode: 201,
        message: `Tạo phòng kèo "${room.title}" thành công! Đang chờ thêm thành viên.`,
        data: room,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/matchmaking/rooms/:id/join
   * Tham gia phòng kèo hoặc vào hàng chờ (Waitlist)
   */
  async joinRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { playerName, playerPhone } = req.body;

      const result = await matchmakingService.joinMatchRoom({
        matchRoomId: id,
        playerName,
        playerPhone,
      });

      return sendResponse(res, {
        success: true,
        statusCode: 200,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/matchmaking/districts
   * Lấy danh sách quận cho dropdown bộ lọc
   */
  async getDistricts(req: Request, res: Response, next: NextFunction) {
    try {
      const districts = await matchmakingService.getActiveDistricts();

      return sendResponse(res, {
        success: true,
        statusCode: 200,
        message: `Tìm thấy ${districts.length} quận đang hoạt động.`,
        data: districts,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const matchmakingController = new MatchmakingController();
