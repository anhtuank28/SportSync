# KẾ HOẠCH PHÁT TRIỂN DỰ ÁN: SPORTSYNC (COURTSYNC OS)
> **Nền tảng Đặt sân, Ghép kèo Thể thao & Điều hành Cụm sân Đa cơ sở tại Hà Nội**  
> Tiêu chuẩn chất lượng: **ISO/IEC 25010** | Đồng bộ TypeScript Fullstack | Chuẩn giao diện 100% khớp Mockups

---

## 1. Kiến trúc Kỹ thuật & Công nghệ (Enterprise Tech Stack)

| Phân hệ | Công nghệ sử dụng | Mục đích & Tiêu chuẩn áp dụng |
| :--- | :--- | :--- |
| **Backend** | Node.js, Express.js (TypeScript) | Kiến trúc **3-Layer Architecture** (`Controller -> Service -> Repository`), chuẩn hóa RESTful API & Global Error Handler. |
| **Database & ORM** | PostgreSQL 16, Prisma ORM | Quản lý Migration, đánh `Composite Unique Index` chống trùng lịch vật lý, truy vấn khoảng cách địa lý **Haversine (2.5km)**. |
| **Caching & Queue** | Redis 7, BullMQ (`ioredis`) | **Distributed Lock** giữ chỗ tạm thời (kèm `PTTL` đếm ngược giây trực tiếp trên UI); Background Worker tự động giải phóng slot quá hạn. |
| **Frontend** | React (Vite / Next.js), Tailwind CSS | Quản lý state với **Zustand**, caching & fetch API với **SWR + Axios**, form với **React Hook Form + Zod**, bản đồ **React-Leaflet**. |
| **Realtime & Payment** | Socket.io, VietQR / PayOS API | Đồng bộ tức thì trạng thái ô lịch giữa màn hình Người chơi và Trung tâm điều hành Chủ sân (`CourtSync OS`); xử lý Idempotent Webhook. |
| **Testing Suite** | Jest, Supertest, Playwright, JMeter | Unit/Integration Test (Backend), E2E Automation Test (Frontend), Concurrency Stress Test (500 CCU tranh 1 slot giờ vàng). |
| **DevOps & Quality** | Docker Compose, GitHub Actions, ESLint, Husky | Đóng gói môi trường đồng nhất với Docker Compose, CI/CD tự động kiểm tra code và chạy test trước khi merge. |

---

## 2. Cấu trúc Thư mục Chuẩn Doanh nghiệp

```text
sportsync-monorepo/
├── docker-compose.yml               # Khởi tạo PostgreSQL 16 & Redis 7
├── docs/
│   └── designs/                     # Ảnh thiết kế UI thực tế (Screen 1, Screen 2, Screen 3)
│       ├── screen_1_player_booking.png
│       ├── screen_2_matchmaking_lobby.png
│       └── screen_3_owner_courtsync_os.png
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma            # Cấu trúc bảng khớp 100% với 3 màn hình UI
│   │   └── seed.ts                  # Dữ liệu mẫu 15 cụm sân tại Hà Nội (Cầu Giấy, Dịch Vọng, Yên Hòa...)
│   ├── src/
│   │   ├── config/                  # Env, Prisma Client, Redis Client, Socket.io Server
│   │   ├── middlewares/             # Auth JWT, RBAC (Player/Owner/Admin), Zod Validator, Error Handler
│   │   ├── modules/
│   │   │   ├── auth/                # Đăng nhập, Đăng ký, Refresh Token
│   │   │   ├── venue/               # Lọc cụm sân theo Quận, Tìm sân bán kính 2.5km, Tiện ích sân
│   │   │   ├── booking/             # Lưới giờ thực, Redis Lock giữ chỗ, Mã giảm giá, VietQR Webhook
│   │   │   ├── matchmaking/         # Sảnh tìm kèo giao lưu, Chia tiền sân, Hàng chờ (Waitlist)
│   │   │   └── owner-dashboard/     # CourtSync OS: KPI hôm nay, Đặt sân tại quầy, Đổi ca trực
│   │   └── jobs/                    # BullMQ Worker giải phóng slot hết hạn giữ chỗ
│   └── tests/                       # Unit Test (Jest), Integration (Supertest), JMeter (.jmx)
└── frontend/
    ├── src/
    │   ├── api/                     # Axios Interceptors & SWR Fetcher
    │   ├── components/
    │   │   ├── shared/              # Header, DistrictSwitcher, StatusBadge, VietQRModal
    │   │   └── schedule/            # CourtScheduleMatrix.tsx (Dùng chung cho cả Player & Owner)
    │   ├── features/
    │   │   ├── booking/             # Màn hình 1: Lưới đặt sân, Sidebar tính tiền, Map 2.5km
    │   │   ├── matchmaking/         # Màn hình 2: Sảnh tìm kèo giao lưu, Bộ lọc, Card kèo & Hàng chờ
    │   │   └── owner-os/            # Màn hình 3: CourtSync OS Dashboard, KPI, Bảng giao dịch
    │   └── store/                   # useBookingStore.ts, useAuthStore.ts (Zustand)
    └── e2e/                         # Kịch bản kiểm thử tự động Playwright cho cả 3 màn hình
```

---

## 3. Thiết kế Cơ sở Dữ liệu (Prisma Schema)

- [ ] **Bảng District & Venue (Cụm sân)**:
  - Thông tin: `name` (Cụm Sân Cầu Lông Cầu Giấy), `address` (35 Trần Thái Tông, Dịch Vọng Hậu, Cầu Giấy), `latitude`, `longitude`, `openTime` (06:00), `closeTime` (23:00), `isBwfStandard` (true), `rating` (4.7).
  - Cột `amenities` (JSONB): Lưu 3 tiện ích hiển thị ở Màn hình 1 (Đèn LED Chống Lóa 500 Lux, Phòng Tắm Nóng Lạnh, Bãi Đỗ Xe Rộng Rãi 24/7).
- [ ] **Bảng Court (Sân con trong cụm sân)**:
  - Thông tin: `name` (Sân 1 – Sân 6), `surfaceType` (Yonex Pro Mat, VIP Điều hòa, Thảm Taraflex, Tiêu chuẩn CLB), `sportType` (`BADMINTON`, `PICKLEBALL`, `FOOTBALL`).
- [ ] **Bảng PricingRule & Voucher**:
  - Cấu hình giá khung giờ chuẩn (80.000đ/h hoặc 100.000đ/h) và Giờ vàng cao điểm 17:00 – 22:00 (120.000đ/h).
  - Lưu mã giảm giá (ví dụ: `BADMINTON20` giảm 20.000đ).
- [ ] **Bảng Booking & BookingSlot**:
  - Mã đơn định dạng `#BK-8902`, `#BK-8901`; thông tin khách hàng (`customerName`, `customerPhone` hỗ trợ che SĐT `0912***456`).
  - Phân biệt phương thức thanh toán: `VIETQR_AUTO` (VietQR tự động) và `CASH_AT_COUNTER` (Tiền mặt • Quầy).
  - Trạng thái đơn: `HOLDING` (Đang giữ chỗ Redis), `CONFIRMED` (Đã thanh toán), `EXPIRED` (Hết hạn giữ chỗ).
  - Đánh `Composite Unique Index` trên `[courtId, date, timeSlot]` để chống trùng lịch mức vật lý.
- [ ] **Bảng MatchRoom & MatchParticipant (Sảnh Tìm Kèo Giao Lưu)**:
  - `sportType` (Cầu lông, Pickleball, Bóng đá 7), `skillLevel` (TB-Khá, Mới chơi, Bán chuyên, Trung bình B/C+, Giao lưu mở, Đôi Nam Nữ).
  - `pricePerPerson` (65.000đ/người, 80.000đ/người...), `maxPlayers` (4, 6, 14), `currentPlayers` và danh sách chờ (`WAITLISTED` - hiển thị *Đã đủ 6/6 • Chờ (1)*).

---

## 4. Đặc tả Giao diện & UI Mockups Chi tiết

Dự án có **3 màn hình giao diện cốt lõi** đã được thiết kế hoàn thiện. Mọi thành phần Frontend phải tuân thủ chính xác từng khối, màu sắc, font chữ và trạng thái tương tác:

### 🖼️ Màn hình 1: Đặt Sân, Lưới Lịch Realtime & Sidebar Thanh toán VietQR
*Tệp thiết kế tham chiếu:* [docs/designs/screen_1_player_booking.png](file:///Users/nguyenanhtuan/Documents/SportSync/docs/designs/screen_1_player_booking.png)

```
+--------------------------------------------------------------------------------------------------------+
| [SportSync]  District 1 • SkyCourts Center ▾   [Court Schedule]  Browse Venues  Tournaments  My Bookings  | ⚡ Instant Book  (👤) |
| [Quận Cầu Giấy ▾]  Cụm Sân Cầu Lông Cầu Giấy (Đổi cơ sở ▾) [✔ BWF Standard]  [🔍 Tìm kiếm...]  Dịch Vọng (800m)  Yên Hòa (1.2km) |
+-----------------------------------------------------------------------------------+--------------------+
| CỘT CHÍNH (Trái - 65% width)                                                      | SIDEBAR (Phải - 35%)|
| • TRỰC TIẾP CẬP NHẬT                                                              | ⏱ Giữ chỗ tạm thời |
| Lịch Đặt Sân Thời Gian Thực                                                       | hết hạn sau: 09:56 |
| 35 Trần Thái Tông, Cầu Giấy • Hệ thống 6 sân thảm cao cấp                         | [=================]|
| [🔥 GIỜ VÀNG (17:00 - 22:00): 120k | Giờ chuẩn: 80k/h]                            | ĐỊA ĐIỂM TỔ CHỨC:  |
| [Hôm nay (24/10)] [Ngày mai] [T.Sáu] [T.Bảy 🔥] [Chủ Nhật 🔥]                      | Cụm Sân Cầu Giấy   |
|                                                                                   |                    |
| Lưới ma trận lịch (CourtScheduleMatrix):                                          | Sân 2 (Yonex Pro)  |
| Cụm Sân   | 06:00 | 08:00 | 10:00 | 14:00 | 16:00 | 17:00🔥 | 18:00🔥 | 19:00🔥  | 18:00-20:00: 240k 🗑|
| Sân 1     | 80k   | [kín] | 80k   | 80k   |[04:12]| [kín]   | [kín]   | 120k     | ------------------ |
| Sân 2     | 80k   | 80k   | [kín] | 80k   | 80k   | 120k    | [✓120k] | [✓120k]  | Mở phòng giao lưu  |
| Sân 3 VIP | [kín] | 100k  | 100k  | [kín] | 100k  | [kín]   | [kín]   |[08:44]   | [Toggle ON]        |
| Sân 4     | 80k   | 80k   | 80k   | 80k   | 80k   | 120k    | [kín]   | [kín]    | TB(B/C+) • Cần 2 ng|
| Sân 5     | [kín] | 80k   | 80k   | 80k   | [kín] | [kín]   | 120k    | 120k     | ------------------ |
| Sân 6     | 80k   | 80k   | 80k   | [kín] | 80k   | 120k    | 120k    | [kín]    | Giờ chuẩn: 0đ      |
|                                                                                   | Giờ vàng: 240.000đ |
| 3 Tiện ích sân:                                                                   | Voucher: -20.000đ  |
| [💡 Đèn LED 500 Lux]  [🚿 Phòng Tắm Nóng Lạnh]  [🅿️ Bãi Đỗ Xe Rộng Rãi 24/7]     | TỔNG: 220.000đ     |
|                                                                                   | [⚡ Thanh toán QR]  |
| Bản Đồ Cụm Sân Lân Cận (Bán kính 2.5km):                                          | [VietQR][Napas][MB]|
| React-Leaflet Map với pins: Dịch Vọng (800m), Cầu Giấy, Yên Hòa, Nghĩa Tân        | 🛡 Hoàn hủy < 2h   |
+-----------------------------------------------------------------------------------+--------------------+
```

* **Thành phần & Trạng thái ô slot:**
  - `Trống (White)`: Viền xám `#E2E8F0`, hiển thị giá `80k` / `100k` / `120k`.
  - `Đang chọn (Emerald)`: Nền xanh `#10B981`, icon tích `✓`, chữ trắng.
  - `Giữ chỗ Redis (Amber)`: Nền vàng cam `#FEF3C7`, viền `#F59E0B`, icon khóa 🔒 kèm đồng hồ đếm ngược `MM:SS` (vd `04:12`, `08:44`).
  - `Kín lịch (Slate)`: Nền xanh nhạt `#E0F2FE` hoặc xám, icon ổ khóa.

---

### 🖼️ Màn hình 2: Sảnh Tìm Kèo Giao Lưu (Matchmaking Lobby)
*Tệp thiết kế tham chiếu:* [docs/designs/screen_2_matchmaking_lobby.png](file:///Users/nguyenanhtuan/Documents/SportSync/docs/designs/screen_2_matchmaking_lobby.png)

* **Top Bar & Search**: Search bar tích hợp phím tắt `⌘K`, chuông thông báo, Avatar profile `Minh Nhật ˅`.
* **Bộ lọc đa tiêu chí**:
  - Dropdown Quận: `Quận Cầu Giấy ▾`
  - Dropdown Môn thể thao: `Cầu lông ▾`, `Pickleball`, `Bóng đá 7`
  - Dropdown Trình độ: `Trình độ: Tất cả ▾`
  - Date Filter: `Hôm nay` (Active đen), `Ngày mai`, `Cuối tuần`
  - Nút `+ Tạo kèo mới` (gắn liền với đơn đặt sân đã thanh toán).
* **Lưới 9 Thẻ kèo (`MatchRoomCard`) - Responsive 3 cột**:
  - `Card Header`: Tag môn & trình độ (`🏸 Cầu lông • TB-Khá`, `🏓 Pickleball • Mới chơi`, `⚽ Bóng đá 7 • Vui khỏe`) + Giá/người (`65.000đ / người`, `80.000đ / người`...).
  - `Card Body`: Tên sân (`Sân Cầu Lông Dịch Vọng`), thời gian & địa điểm (`19:00 - 21:00, Hôm nay • Quận Cầu Giấy`).
  - `Card Footer`:
    - Nếu còn slot: Chấm xanh `● Còn 2 chỗ (4/6)` + Nút `Tham gia` (Xanh Emerald).
    - Nếu đã đủ slot: Chấm xám `● Đã đủ 6/6 • Chờ (1)` + Nút `Hàng chờ` (Xám nhạt).
* **Phân trang**: `Hiển thị 9 trên 38 phòng mở tại Hà Nội`, nút trang `[1]`, `2`, `3`, `Tiếp ->`.

---

### 🖼️ Màn hình 3: CourtSync OS - Trung Tâm Điều Hành Chủ Sân
*Tệp thiết kế tham chiếu:* [docs/designs/screen_3_owner_courtsync_os.png](file:///Users/nguyenanhtuan/Documents/SportSync/docs/designs/screen_3_owner_courtsync_os.png)

* **Sidebar Quản trị (Trái)**: Logo `CourtSync OS`, Menu: `Lịch vận hành` (active), `Đơn đặt sân`, `Bảng giá giờ vàng`, `Cài đặt sân`. Bottom Card hiển thị trạng thái cụm sân `● ĐANG HOẠT ĐỘNG - Cụm Sân Cầu Lông Cầu Giấy (8 sân • Trực tiếp)`.
* **Header Điều hành**: Trạng thái mở cửa `● Đang mở cửa (06:00 - 23:00)`, Picker ngày `📅 Hôm nay, 24/10/2025`, nút `Đổi ca trực`, nút nổi bật `+ Đặt sân tại quầy` (tiền mặt).
* **3 Thẻ KPI Thực tế**:
  1. `DOANH THU HÔM NAY`: `4.850.000đ` (tăng trưởng `+12% so với hôm qua 4.330.000đ`).
  2. `TỶ LỆ LẤP ĐẦY`: `78%` (`28/36 khung giờ đã hoàn tất giữ chỗ`).
  3. `ĐANG GIỮ CHỖ (REDIS LOCK)`: `2 slot` (Chờ quét VietQR `TTL: 08:12, 04:35`).
* **Lưới Lịch Sân Trực Tiếp Hôm Nay (Realtime Matrix)**:
  - Khung giờ: `16:00 - 17:00` đến `21:00 - 22:00`.
  - Ô xanh dương: `Đã thanh toán` kèm tên khách hàng & kênh (`Nguyễn Tuấn - Đã TT • VietQR`, `Lê Minh Khôi - Tiền mặt • Quầy`).
  - Ô vàng cam: `Đang giữ chỗ` (`Chờ QR (08:12)`).
  - Ô trắng: `Trống - 120.000đ` (Chủ sân có thể click để khóa nhanh hoặc gán khách tại quầy).
* **Bảng Giao Dịch Gần Nhất (28 đơn)**:
  - Tabs lọc: `Tất cả (28)`, `VietQR tự động`, `Tiền mặt tại quầy`.
  - Cột: `MÃ ĐƠN` (`#BK-8902`), `KHÁCH HÀNG` (`Nguyễn Tuấn (0912***456)` - tự động che 3 số giữa), `SÂN & KHUNG GIỜ`, `SỐ TIỀN`, `TRẠNG THÁI`.

---

## 5. Lộ trình Thực hiện Chi tiết 6 Tuần

### Tuần 1: Khởi tạo Kiến trúc, Database Schema & Hệ thống Design System
- [x] **Backend & DB**:
  - [x] Dựng `docker-compose.yml` cho PostgreSQL 16 và Redis 7.
  - [x] Viết `schema.prisma` và chạy `seed.ts` nạp dữ liệu thật cho các cụm sân tại Hà Nội: Cụm Sân Cầu Lông Cầu Giấy (35 Trần Thái Tông), Sân Dịch Vọng (cách 800m), Sân Yên Hòa (cách 1.2km), CLB Nghĩa Tân (cách 1.8km), D-Pickleball Sky Club, Sân Bóng Đá Trung Kính Hạ.
- [x] **Frontend (UI Base)**:
  - [x] Cấu hình bảng màu chuẩn theo Mockups: Màu chủ đạo Emerald (`#10B981` / `#059669`), màu cảnh báo giữ chỗ Redis Amber (`#FEF3C7` / `#D97706`), nền Slate/Zinc trung tính (`#F8FAFC`, `#FFFFFF`, border `#E2E8F0`).
  - [x] Xây dựng Layout khung cho khu vực Khách hàng (**SportSync**) và khu vực Chủ sân (**CourtSync OS**).

### Tuần 2: Màn hình 1 (Phần 1) – Tìm kiếm Cụm sân, Lưới Lịch & Bản đồ 2.5km
- [x] **Backend**:
  - [x] API `GET /api/v1/venues/:slug/schedule`: Trả về thông tin cụm sân, danh sách sân con kèm loại thảm (Yonex Pro Mat, Taraflex...), tiện ích sân và trạng thái từng ô giờ.
  - [x] API `GET /api/v1/venues/nearby`: Tính khoảng cách bằng công thức Haversine để trả về các sân trong bán kính 2.5km kèm số slot còn trống.
- [x] **Frontend (Giao diện Màn hình 1)**:
  - [x] Thanh chuyển nhanh Quận & Cụm sân (*Quận Cầu Giấy ▾ | Cụm Sân Cầu Lông Cầu Giấy*) và các pill khoảng cách lân cận (*Dịch Vọng (800m), Yên Hòa (1.2km)...*).
  - [x] Lưới chọn giờ (`CourtScheduleMatrix`): Tách biệt Giờ vàng (17:00 – 22:00: 120k) | Giờ chuẩn (80k/h kèm biểu tượng ngọn lửa 🔥). Hiển thị 4 trạng thái: Trống, Đang chọn, Giữ chỗ đếm ngược (VD: 04:12, 08:44), và Kín lịch.
  - [x] Bản đồ Cụm Sân Lân Cận: Tích hợp React-Leaflet hiển thị ghim kèm thông tin khoảng cách và nút *Chuyển sang sân này*.

### Tuần 3: Màn hình 1 (Phần 2) – Giữ chỗ Redis Lock, Ghép kèo & Thanh toán VietQR
- [x] **Backend**:
  - [x] API `POST /api/v1/bookings/hold`: Sử dụng Redis Distributed Lock (`NX EX 600`) khóa slot trong 10 phút, phát sự kiện Socket.io `slot_locked` và đẩy job vào BullMQ.
  - [x] API áp dụng mã giảm giá (`BADMINTON20` giảm -20.000đ).
  - [x] API Webhook VietQR xác thực giao dịch, chuyển trạng thái đơn sang `CONFIRMED` và tự động tạo phòng ghép kèo nếu khách bật tùy chọn.
- [x] **Frontend (Sidebar Thanh toán)**:
  - [x] Đồng hồ đếm ngược Giữ chỗ tạm thời hết hạn sau: `09:59`.
  - [x] Toggle *Mở phòng tuyển giao lưu* (cấu hình trình độ, số lượng người cần ghép).
  - [x] Bảng bóc tách giá tiền chi tiết và nút ⚡ *Thanh toán nhanh VietQR* kèm logo các ngân hàng.

### Tuần 4: Màn hình 2 (Sảnh Tìm Kèo) & Màn hình 3 (CourtSync OS)
- [x] **Màn hình 2 (Sảnh Tìm Kèo Giao Lưu)**:
  - [x] API lọc nâng cao theo Quận, Môn thể thao, Trình độ và Ngày.
  - [x] Giao diện thẻ kèo tối giản (`MatchRoomCard`) hiển thị tag thể thao, giá tiền, thời gian, địa điểm, trạng thái chỗ trống (ví dụ: `● Còn 2 chỗ (4/6)` kèm nút *Tham gia* hoặc `● Đã đủ 6/6 • Chờ (1)` kèm nút *Hàng chờ*).
  - [x] Nút `+ Tạo kèo mới` liên kết với lịch sử đặt sân đã thanh toán.
- [x] **Màn hình 3 (CourtSync OS - Trung Tâm Điều Hành Chủ Sân)**:
  - [x] Header với trạng thái mở cửa, ca trực và nút `+ Đặt sân tại quầy` (thu tiền mặt trực tiếp, bỏ qua bước chờ VietQR).
  - [x] 3 thẻ KPI thực tế: Doanh thu hôm nay (4.850.000đ), Tỷ lệ lấp đầy (78%), và Đang giữ chỗ Redis (2 slot kèm đếm ngược TTL).
  - [x] Lịch sân trực tiếp hôm nay: Ma trận theo thời gian thực hiển thị ô trống, ô đã thanh toán và ô cam giữ chỗ Redis.
  - [x] Bảng giao dịch gần nhất: Bộ lọc theo phương thức thanh toán, hỗ trợ ẩn một phần số điện thoại khách hàng (`0912***456`).

### Tuần 5: Kiểm thử Toàn diện theo Chuẩn ISO/IEC 25010
- [x] Viết Unit/Integration Test (Jest + Supertest) kiểm tra logic tính tiền giờ vàng/thường, mã giảm giá và bảo vệ quyền riêng tư số điện thoại (11/11 tests pass 100%).
- [x] Đảm bảo cấu trúc Composite Unique Index `unique_court_date_timeslot` triệt tiêu 100% nguy cơ trùng lịch vật lý (Zero Double-Booking).
- [x] Đồng bộ hoá sự kiện Socket.io thời gian thực giữa Màn hình Người chơi và CourtSync OS Chủ sân.

### Tuần 6: CI/CD, Tài liệu hóa Swagger & Đóng gói Hồ sơ CV
- [x] Tích hợp Swagger UI OpenAPI 3.0 trực quan tại `/api/v1/docs`.
- [x] Thiết lập GitHub Actions CI/CD (`.github/workflows/ci.yml`) tự động chạy migration, test suite và build monorepo.
- [x] Hoàn thiện file `README.md` chuẩn doanh nghiệp kèm hướng dẫn cài đặt, kiến trúc kỹ thuật và đặc tả API.
