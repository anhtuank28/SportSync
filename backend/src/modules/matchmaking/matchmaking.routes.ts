import { Router } from 'express';
import { matchmakingController } from './matchmaking.controller';
import { validateRequest } from '../../middlewares/validate';
import {
  listMatchRoomsSchema,
  createMatchRoomSchema,
  joinMatchRoomSchema,
} from './matchmaking.validation';

const router = Router();

// 1. Lấy danh sách phòng kèo (Bộ lọc đa tiêu chí + Phân trang 9 thẻ/trang)
router.get('/rooms', validateRequest(listMatchRoomsSchema), matchmakingController.listRooms);

// 2. Lấy danh sách quận cho dropdown bộ lọc
router.get('/districts', matchmakingController.getDistricts);

// 3. Lấy chi tiết phòng kèo
router.get('/rooms/:id', matchmakingController.getRoomDetail);

// 4. Tạo phòng kèo mới (liên kết đơn đặt sân đã thanh toán)
router.post('/rooms', validateRequest(createMatchRoomSchema), matchmakingController.createRoom);

// 5. Tham gia phòng kèo / Hàng chờ Waitlist
router.post('/rooms/:id/join', validateRequest(joinMatchRoomSchema), matchmakingController.joinRoom);

export default router;
