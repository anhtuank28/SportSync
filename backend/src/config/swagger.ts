export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'SportSync (CourtSync OS) Enterprise API',
    version: '1.0.0',
    description:
      'Nền tảng Đặt sân, Ghép kèo Thể thao & Điều hành Cụm sân Đa cơ sở tại Hà Nội. Kiến trúc 3-Layer (Controller -> Service -> Repository), PostgreSQL 16, Prisma ORM, Redis Distributed Lock & BullMQ.',
    contact: {
      name: 'SportSync Engineering Team',
      email: 'dev@sportsync.vn',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000/api/v1',
      description: 'Local Development Server',
    },
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Kiểm tra tình trạng hoạt động của API Gateway',
        tags: ['System'],
        responses: {
          200: {
            description: 'Hệ thống hoạt động bình thường',
          },
        },
      },
    },
    '/venues': {
      get: {
        summary: 'Lấy danh sách các cụm sân thể thao tại Hà Nội (hỗ trợ lọc quận)',
        tags: ['Venues'],
        parameters: [
          {
            name: 'district',
            in: 'query',
            schema: { type: 'string' },
            description: 'Slug quận (VD: quan-cau-giay, quan-ba-dinh)',
          },
        ],
        responses: {
          200: { description: 'Danh sách cụm sân' },
        },
      },
    },
    '/venues/{slug}/schedule': {
      get: {
        summary: 'Lấy ma trận lịch và trạng thái slot theo ngày',
        tags: ['Venues'],
        parameters: [
          { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'date', in: 'query', schema: { type: 'string', example: '2025-10-24' } },
        ],
        responses: {
          200: { description: 'Chi tiết lịch sân và giá giờ vàng' },
        },
      },
    },
    '/venues/nearby': {
      get: {
        summary: 'Tìm cụm sân lân cận theo công thức Haversine (bán kính 2.5km)',
        tags: ['Venues'],
        parameters: [
          { name: 'lat', in: 'query', required: true, schema: { type: 'number', example: 21.0313 } },
          { name: 'lon', in: 'query', required: true, schema: { type: 'number', example: 105.7892 } },
          { name: 'radiusKm', in: 'query', schema: { type: 'number', default: 2.5 } },
        ],
        responses: {
          200: { description: 'Danh sách sân lân cận kèm khoảng cách' },
        },
      },
    },
    '/bookings/hold': {
      post: {
        summary: 'Giữ chỗ tạm thời 10 phút qua Redis Distributed Lock (NX EX 600)',
        tags: ['Bookings'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['venueId', 'customerName', 'customerPhone', 'slots'],
                properties: {
                  venueId: { type: 'string' },
                  customerName: { type: 'string', example: 'Minh Nhật' },
                  customerPhone: { type: 'string', example: '0912345456' },
                  voucherCode: { type: 'string', example: 'BADMINTON20' },
                  isMatchmakingEnabled: { type: 'boolean', example: false },
                  slots: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        courtId: { type: 'string' },
                        date: { type: 'string', example: '2025-10-24' },
                        timeSlot: { type: 'string', example: '18:00 - 19:00' },
                        price: { type: 'number', example: 120000 },
                        isPeakHour: { type: 'boolean', example: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Giữ chỗ thành công kèm thông tin VietQR' },
          409: { description: 'Xung đột lịch vật lý hoặc có người đang giữ chỗ' },
        },
      },
    },
    '/bookings/apply-voucher': {
      post: {
        summary: 'Áp dụng mã giảm giá voucher (VD: BADMINTON20)',
        tags: ['Bookings'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  code: { type: 'string', example: 'BADMINTON20' },
                  orderTotal: { type: 'number', example: 240000 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Áp dụng voucher thành công' },
        },
      },
    },
    '/bookings/webhook/vietqr': {
      post: {
        summary: 'Webhook idempotent xác nhận thanh toán VietQR / PayOS',
        tags: ['Bookings'],
        responses: {
          200: { description: 'Xác nhận đơn hàng và kích hoạt phòng ghép kèo nếu có' },
        },
      },
    },
    '/matchmaking/rooms': {
      get: {
        summary: 'Lấy danh sách phòng ghép kèo theo bộ lọc đa tiêu chí (quận, môn, trình độ, ngày)',
        tags: ['Matchmaking'],
        parameters: [
          { name: 'districtSlug', in: 'query', schema: { type: 'string' } },
          { name: 'sportType', in: 'query', schema: { type: 'string', enum: ['BADMINTON', 'PICKLEBALL', 'FOOTBALL', 'TENNIS'] } },
          { name: 'skillLevel', in: 'query', schema: { type: 'string' } },
          { name: 'dateFilter', in: 'query', schema: { type: 'string', enum: ['today', 'tomorrow', 'weekend'] } },
          { name: 'page', in: 'query', schema: { type: 'number', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'number', default: 9 } },
        ],
        responses: {
          200: { description: 'Danh sách phòng kèm thông tin phân trang' },
        },
      },
      post: {
        summary: 'Tạo phòng ghép kèo mới liên kết với đơn đặt sân',
        tags: ['Matchmaking'],
        responses: {
          201: { description: 'Tạo phòng thành công' },
        },
      },
    },
    '/matchmaking/rooms/{id}/join': {
      post: {
        summary: 'Tham gia phòng kèo hoặc xếp vào hàng chờ',
        tags: ['Matchmaking'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Gia nhập phòng thành công' },
        },
      },
    },
    '/owner/venues/{slug}/dashboard': {
      get: {
        summary: 'Lấy toàn bộ dữ liệu KPI, ma trận realtime và giao dịch của CourtSync OS',
        tags: ['CourtSync OS (Owner)'],
        parameters: [
          { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'date', in: 'query', schema: { type: 'string', example: '2025-10-24' } },
        ],
        responses: {
          200: { description: 'Dữ liệu vận hành cụm sân' },
        },
      },
    },
    '/owner/bookings/counter': {
      post: {
        summary: 'Đặt sân trực tiếp tại quầy thu tiền mặt (Walk-in booking)',
        tags: ['CourtSync OS (Owner)'],
        responses: {
          201: { description: 'Đã tạo đơn và cập nhật ma trận lịch ngay lập tức' },
        },
      },
    },
  },
};
