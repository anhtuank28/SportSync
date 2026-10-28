# 🏸 SportSync (CourtSync OS)
> **Nền tảng Đặt sân, Ghép kèo Thể thao & Điều hành Cụm sân Đa cơ sở tại Hà Nội**  
> *Đạt chuẩn kiến trúc doanh nghiệp ISO/IEC 25010 | 100% TypeScript Fullstack | Pixel-Faithful UI*

[![CI/CD Pipeline](https://github.com/anhtuank28/SportSync/actions/workflows/ci.yml/badge.svg)](https://github.com/anhtuank28/SportSync/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-teal.svg)](https://www.prisma.io/)
[![Redis](https://img.shields.io/badge/Redis-7-red.svg)](https://redis.io/)
[![BullMQ](https://img.shields.io/badge/BullMQ-5.34-orange.svg)](https://bullmq.io/)

---

## 📸 3 Màn Hình Trực Quan (Pixel-Faithful)

### 1. Màn hình 1: Đặt Sân Người Chơi & Thanh Toán VietQR Tự Động
- **Lưới giờ trực quan (CourtScheduleMatrix):** Phân định rõ Giờ chuẩn (80k/h) và Giờ vàng 🔥 (17:00 - 22:00: 120k/h).
- **4 Trạng thái slot:** Trống (giá tiền), Đang chọn (Emerald `#10B981`), Giữ chỗ Redis (Amber `#FEF3C7` kèm TTL đếm ngược), Kín lịch.
- **Bản đồ lân cận 2.5km:** Thuật toán Haversine định vị cụm sân quanh khu vực (Dịch Vọng 800m, Yên Hòa 1.2km...).
- **Sidebar thanh toán:** Đếm ngược giữ chỗ 10 phút, Voucher `BADMINTON20`, toggle "Mở phòng tuyển giao lưu", mã VietQR động.

### 2. Màn hình 2: Sảnh Tìm Kèo Giao Lưu (Matchmaking Lobby)
- **Bộ lọc đa tiêu chí:** Quận (Cầu Giấy, Ba Đình, Đống Đa, Nam Từ Liêm), Môn thể thao (Cầu lông, Pickleball, Bóng đá), Trình độ (TB-Khá, Mới chơi, Bán chuyên), Thời gian (Hôm nay, Ngày mai, Cuối tuần).
- **Thẻ kèo đa năng `MatchRoomCard`:** Hiển thị tình trạng chỗ (`Còn 2 chỗ (4/6)` -> Nút *Tham gia*; `Đã đủ (6/6)` -> Nút *Hàng chờ*).
- **Tạo kèo gắn với đơn đặt sân:** Tự động đồng bộ lịch thi đấu khi người chơi đã thanh toán thành công.

### 3. Màn hình 3: CourtSync OS - Trung Tâm Điều Hành Chủ Sân
- **3 Thẻ KPI thời gian thực:** Doanh thu hôm nay (4.850.000đ, +12%), Tỷ lệ lấp đầy (78%), Slot giữ chỗ Redis (đếm ngược TTL thời gian thực).
- **Ma trận lịch sân trực tiếp:** Trạng thái ô trống (click mở nhanh cửa sổ đặt sân/khóa bảo trì), ô đã thanh toán (tên khách hàng & hình thức TT), ô giữ chỗ Redis.
- **Đặt sân tại quầy (Thu tiền mặt):** Chống trùng lịch vật lý tức thì, tự động cập nhật doanh thu và ma trận lịch.
- **Bảng giao dịch gần nhất:** Lọc theo hình thức thanh toán (Tất cả, VietQR tự động, Tiền mặt tại quầy), ẩn bảo mật 3 số giữa SĐT (`0912***456`).

---

## 🏗️ Kiến Trúc Kỹ Thuật (Enterprise Tech Stack)

```
SportSync Monorepo
├── backend/                  # Node.js + Express.js 3-Layer Architecture
│   ├── src/
│   │   ├── config/           # Database (Prisma), Redis, Swagger OpenAPI
│   │   ├── jobs/             # BullMQ Expiration Worker (Auto-release expired slots)
│   │   ├── middlewares/      # Zod Validation, Global Error Handling, CORS, Helmet
│   │   ├── modules/
│   │   │   ├── venue/        # Sân bãi, lịch, Haversine 2.5km lân cận
│   │   │   ├── booking/      # Giữ chỗ Redis Lock (NX EX 600), Voucher, VietQR
│   │   │   ├── matchmaking/  # Sảnh tìm kèo, đăng ký & hàng chờ (Waitlist)
│   │   │   ├── owner/        # CourtSync OS: KPIs, Ma trận live, Đặt sân tại quầy
│   │   │   └── payment/      # VietQR Service, Webhook idempotent
│   │   ├── utils/            # Haversine distance, chuẩn RESTful response
│   │   └── server.ts         # HTTP Server + WebSocket Socket.io Gateway
│   └── prisma/
│       ├── schema.prisma     # Composite Unique Index chống trùng lịch vật lý
│       └── seed.ts           # Dữ liệu thực tế 15 cụm sân Hà Nội & đơn mẫu
│
└── frontend/                 # React 18 + TypeScript + Vite + Tailwind CSS
    └── src/
        ├── api/              # Axios Client (RESTful unwrapper) & Socket.io
        ├── components/
        │   ├── booking/      # Sidebar thanh toán VietQR, tiện ích, bản đồ
        │   ├── matchmaking/  # Sảnh tìm kèo, bộ lọc, thẻ phòng, phân trang
        │   ├── owner/        # CourtSync OS: Sidebar, KPI, Ma trận, Đặt quầy
        │   ├── schedule/     # CourtScheduleMatrix (Giờ vàng & 4 trạng thái)
        │   └── shared/       # Header, Footer, Navigation
        └── store/            # Zustand stores: useBookingStore, useMatchmakingStore, useOwnerStore
```

---

## 🛡️ Tiêu Chuẩn Chất Lượng ISO/IEC 25010 & Concurrency Safety

1. **Chống trùng lịch vật lý (Zero Double-Booking):**
   - **Tầng 1 (Tốc độ):** Redis Distributed Lock `SET lock:court:{id}:{date}:{slot} {code} NX EX 600` chặn tranh chấp trong 10 phút.
   - **Tầng 2 (Bền vững):** Prisma / PostgreSQL `Composite Unique Index @@unique([courtId, date, timeSlot])` ngăn chặn double-booking tuyệt đối ở tầng vật lý (0% trùng lịch).
   - **Tầng 3 (Tự giải phóng):** BullMQ Worker tự động quét và giải phóng các slot giữ chỗ quá hạn 10 phút.
2. **Bảo mật & Quyền riêng tư (Privacy by Design):**
   - Che 3 số giữa số điện thoại khách hàng trên màn hình vận hành (`0912***456`).
3. **Bộ Test Suite Chuẩn Doanh Nghiệp (Jest + Supertest):**
   - Haversine distance & lân cận bán kính 2.5km.
   - Tính toán động giờ vàng (120k) vs giờ chuẩn (80k).
   - Khấu trừ voucher `BADMINTON20`.
   - KPI Tỷ lệ lấp đầy & TTL countdown.
   - Integration tests API Gateway & Zod Validation.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ (Local Setup)

### 1. Khởi động PostgreSQL & Redis (Docker)
```bash
docker-compose up -d
```

### 2. Cài đặt Dependencies Monorepo
```bash
npm install
```

### 3. Đồng bộ Database & Nạp Dữ Liệu Mẫu
```bash
npm run db:generate --workspace=backend
npm run db:migrate --workspace=backend
npm run db:seed --workspace=backend
```

### 4. Chạy Kiểm Thử Toàn Diện (ISO/IEC 25010)
```bash
npm test --workspace=backend
```

### 5. Khởi động Ứng Dụng (Development)
```bash
# Khởi động Backend API Gateway (Port 5000)
npm run dev:backend

# Khởi động Frontend Client (Port 5173)
npm run dev:frontend
```

---

## 📑 Tài Liệu API & Điểm Cuối (API Endpoints)
Truy cập giao diện tương tác Swagger UI trực tiếp tại:
👉 **`http://localhost:5000/api/v1/docs`**

| Phương thức | Đường dẫn API | Mô tả nghiệp vụ |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Kiểm tra tình trạng hoạt động hệ thống |
| `GET` | `/api/v1/venues` | Danh sách cụm sân (lọc theo quận) |
| `GET` | `/api/v1/venues/:slug/schedule` | Ma trận lịch & trạng thái slot theo ngày |
| `GET` | `/api/v1/venues/nearby` | Tìm sân lân cận theo Haversine 2.5km |
| `POST` | `/api/v1/bookings/hold` | Giữ chỗ 10 phút bằng Redis Lock (NX EX 600) |
| `POST` | `/api/v1/bookings/apply-voucher`| Áp dụng mã giảm giá (`BADMINTON20`) |
| `POST` | `/api/v1/bookings/webhook/vietqr` | Webhook thanh toán VietQR / PayOS |
| `GET` | `/api/v1/matchmaking/rooms` | Sảnh tìm kèo (lọc quận, môn, trình độ) |
| `POST` | `/api/v1/matchmaking/rooms/:id/join` | Tham gia phòng kèo hoặc hàng chờ |
| `GET` | `/api/v1/owner/venues/:slug/dashboard` | Dashboard điều hành CourtSync OS |
| `POST` | `/api/v1/owner/bookings/counter` | Đặt sân tại quầy thu tiền mặt tức thì |

---

## 👨‍💻 Tác Giả & Bản Quyền
Dự án được xây dựng và phát triển bởi **Nguyễn Anh Tuấn** ([@anhtuank28](https://github.com/anhtuank28)).  
Bản quyền © 2026 SportSync / CourtSync OS. All rights reserved.
