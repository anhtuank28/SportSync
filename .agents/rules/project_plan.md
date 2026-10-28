# NGUYÊN TẮC & QUY TRÌNH PHÁT TRIỂN: SPORTSYNC (COURTSYNC OS)

## 1. Mục tiêu Dự án & Chuẩn Chất lượng
- **Tên dự án**: **SPORTSYNC (COURTSYNC OS)**
- **Mục tiêu**: Nền tảng Đặt sân, Ghép kèo Thể thao & Điều hành Cụm sân Đa cơ sở tại Hà Nội.
- **Tiêu chuẩn chất lượng**: Tuân thủ chuẩn **ISO/IEC 25010** (độ tin cậy, hiệu năng, bảo mật, khả năng bảo trì). Kiểm thử chịu tải 500 CCU không phát sinh lỗi trùng lịch (Double-booking 0%).
- **Tiêu chuẩn giao diện**: 100% các màn hình Frontend phải được hiện thực hóa chính xác tuyệt đối theo 3 bản thiết kế UI tại `docs/designs/`:
  - `docs/designs/screen_1_player_booking.png` (Màn hình 1: Lưới đặt sân, 4 trạng thái slot, Map 2.5km & Sidebar thanh toán VietQR)
  - `docs/designs/screen_2_matchmaking_lobby.png` (Màn hình 2: Sảnh tìm kèo giao lưu, thẻ `MatchRoomCard`, bộ lọc đa tiêu chí)
  - `docs/designs/screen_3_owner_courtsync_os.png` (Màn hình 3: CourtSync OS - KPI Chủ sân, ma trận realtime, đặt sân tại quầy)

---

## 2. Công nghệ Cốt lõi (Enterprise Tech Stack)
- **Ngôn ngữ**: TypeScript đồng bộ 100% từ Backend đến Frontend.
- **Backend**: Node.js, Express.js với kiến trúc **3-Layer** (`Controller -> Service -> Repository`), chuẩn hóa RESTful API, Global Error Handler và Zod Validator.
- **Database & ORM**: PostgreSQL 16 + Prisma ORM. Bắt buộc đánh `Composite Unique Index` trên `[courtId, date, timeSlot]` chống trùng lịch vật lý, truy vấn bán kính **Haversine (2.5km)**.
- **Cache & Queue**: Redis 7, BullMQ (`ioredis`). **Distributed Lock** (`SET key value NX EX 600`) giữ chỗ 10 phút kèm `PTTL` đếm ngược trực tiếp trên UI; BullMQ Background Worker tự động giải phóng slot khi quá hạn.
- **Realtime**: Socket.io Server đồng bộ tức thì trạng thái ô lịch giữa màn hình Khách hàng và Trung tâm điều hành Chủ sân (`CourtSync OS`).
- **Thanh toán**: VietQR / PayOS API, xử lý Idempotent Webhook chuyển trạng thái `CONFIRMED`.
- **Frontend**: React (Vite / Next.js), Tailwind CSS, quản lý state bằng **Zustand**, data-fetching & caching với **SWR + Axios**, form với **React Hook Form + Zod**, bản đồ **React-Leaflet**.
- **Testing**: Jest, Supertest (Unit & Integration), Playwright (E2E đồng bộ 2 màn hình), Apache JMeter (Stress test concurrency).

---

## 3. Quy chuẩn Thiết kế Giao diện (Design Tokens & States)
- **Bảng màu chuẩn**:
  - `Primary / Success (Emerald)`: `#10B981` (hover `#059669`) cho nút bấm, badge active, slot đang chọn.
  - `Warning / Redis Lock (Amber)`: `#FEF3C7` (background), `#F59E0B` / `#D97706` (border & text) cho slot giữ chỗ và countdown timer.
  - `Neutral / Surfaces`: `#F8FAFC` (app background), `#FFFFFF` (card surfaces), border `#E2E8F0` / `#CBD5E1`.
  - `Booked / Locked (Slate/Sky)`: `#E0F2FE` hoặc slate nhẹ với icon khóa.
- **Quy tắc 4 Trạng thái Ô lịch trong `CourtScheduleMatrix`**:
  1. `Trống`: Nền trắng viền xám, hiển thị giá tiền (`80k` / `100k` / `120k`). Click để chuyển sang trạng thái đang chọn.
  2. `Đang chọn`: Nền Emerald `#10B981`, chữ trắng, icon checkmark `✓`.
  3. `Giữ chỗ (Có cọc)`: Nền Amber `#FEF3C7`, icon ổ khóa 🔒 kèm đồng hồ đếm ngược `MM:SS` (vd `04:12`). Không cho người khác chọn.
  4. `Kín lịch`: Nền xám/xanh nhạt, icon ổ khóa 🔒. Vô hiệu hóa click.

---

## 4. Quy trình 6 Tuần Thực hiện & Tiêu chí Nghiệm thu
- **Tuần 1: Setup & Data Foundation** (Docker Compose, schema.prisma, seed 15 cụm sân, UI layout skeleton).
- **Tuần 2: Màn hình 1 (Phần 1)** (Lọc sân, Haversine 2.5km, React-Leaflet Map, CourtScheduleMatrix).
- **Tuần 3: Màn hình 1 (Phần 2)** (Redis Lock 10p, BullMQ auto-expire, VietQR Webhook, Sidebar tính tiền, toggle ghép kèo).
- **Tuần 4: Màn hình 2 & Màn hình 3** (Sảnh tìm kèo, MatchRoomCard, CourtSync OS Dashboard, KPI, đặt sân tại quầy).
- **Tuần 5: Kiểm thử ISO/IEC 25010** (Jest, Supertest, JMeter 500 CCU 0% lỗi trùng lịch, Playwright realtime E2E).
- **Tuần 6: Swagger, CI/CD & Bàn giao**.
