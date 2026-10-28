import { PrismaClient, Role, SportType, SurfaceType, BookingStatus, PaymentMethod, PaymentStatus, MatchRoomStatus, ParticipantStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Đang khởi tạo dữ liệu mẫu thực tế cho SportSync tại Hà Nội...');

  // 1. DỌN DẸP DỮ LIỆU CŨ NẾU CÓ
  await prisma.transaction.deleteMany();
  await prisma.matchParticipant.deleteMany();
  await prisma.matchRoom.deleteMany();
  await prisma.bookingSlot.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.pricingRule.deleteMany();
  await prisma.voucher.deleteMany();
  await prisma.court.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.district.deleteMany();
  await prisma.user.deleteMany();

  // 2. KHỞI TẠO USER (CHỦ SÂN & NGƯỜI CHƠI)
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Sportsync@2026', salt);

  const ownerUser = await prisma.user.create({
    data: {
      email: 'owner.caugiay@sportsync.vn',
      phone: '0901234567',
      passwordHash,
      fullName: 'Chủ Sân Cầu Giấy',
      role: Role.OWNER,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  const playerMinhNhat = await prisma.user.create({
    data: {
      email: 'minhnhat@sportsync.vn',
      phone: '0912345456',
      passwordHash,
      fullName: 'Minh Nhật',
      role: Role.PLAYER,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    },
  });

  const playerTuan = await prisma.user.create({
    data: {
      email: 'tuan.nguyen@gmail.com',
      phone: '0912345456',
      passwordHash,
      fullName: 'Nguyễn Tuấn',
      role: Role.PLAYER,
    },
  });

  // 3. KHỞI TẠO QUẬN (DISTRICTS TẠI HÀ NỘI)
  const districtCauGiay = await prisma.district.create({
    data: {
      name: 'Quận Cầu Giấy',
      slug: 'quan-cau-giay',
      city: 'Hà Nội',
    },
  });

  const districtBaDinh = await prisma.district.create({
    data: {
      name: 'Quận Ba Đình',
      slug: 'quan-ba-dinh',
      city: 'Hà Nội',
    },
  });

  const districtDongDa = await prisma.district.create({
    data: {
      name: 'Quận Đống Đa',
      slug: 'quan-dong-da',
      city: 'Hà Nội',
    },
  });

  const districtNamTuLiem = await prisma.district.create({
    data: {
      name: 'Quận Nam Từ Liêm',
      slug: 'quan-nam-tu-liem',
      city: 'Hà Nội',
    },
  });

  // 4. KHỞI TẠO CỤM SÂN CHÍNH (Cụm Sân Cầu Lông Cầu Giấy - Khớp 100% Màn hình 1 & 3)
  const venueCauGiay = await prisma.venue.create({
    data: {
      districtId: districtCauGiay.id,
      ownerId: ownerUser.id,
      name: 'Cụm Sân Cầu Lông Cầu Giấy',
      slug: 'cum-san-cau-long-cau-giay',
      address: '35 Trần Thái Tông, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
      latitude: 21.0313,
      longitude: 105.7892,
      openTime: '06:00',
      closeTime: '23:00',
      isBwfStandard: true,
      rating: 4.7,
      ratingCount: 128,
      amenities: [
        {
          title: 'Đèn LED Chống Lóa',
          desc: 'Chuẩn thi đấu BWF, 500 Lux đồng đều',
          icon: 'light',
        },
        {
          title: 'Phòng Tắm Nóng Lạnh',
          desc: 'Miễn phí cho mọi lượt đặt sân',
          icon: 'shower',
        },
        {
          title: 'Bãi Đỗ Xe Rộng Rãi',
          desc: 'Sức chứa ô tô và xe máy an ninh 24/7',
          icon: 'parking',
        },
      ],
      images: [
        'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800',
        'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800',
      ],
    },
  });

  // 5. CÁC CỤM SÂN LÂN CẬN (Bán kính 2.5km hiển thị trên Map & Pills Màn hình 1)
  const venueDichVong = await prisma.venue.create({
    data: {
      districtId: districtCauGiay.id,
      name: 'Sân Cầu Lông Dịch Vọng',
      slug: 'san-cau-long-dich-vong',
      address: 'Ngõ 86 Duy Tân, Dịch Vọng Hậu, Cầu Giấy',
      latitude: 21.0345, // ~800m
      longitude: 105.7940,
      openTime: '06:00',
      closeTime: '22:30',
      rating: 4.7,
      ratingCount: 94,
      amenities: [
        { title: 'Thảm Yonex Tiêu chuẩn', desc: 'Độ bám tốt', icon: 'court' },
        { title: 'Bãi đỗ xe máy', desc: 'Có bảo vệ', icon: 'parking' }
      ]
    }
  });

  const venueYenHoa = await prisma.venue.create({
    data: {
      districtId: districtCauGiay.id,
      name: 'CLB Cầu Lông Yên Hòa',
      slug: 'clb-cau-long-yen-hoa',
      address: 'Hạ Yên Quyết, Yên Hòa, Cầu Giấy',
      latitude: 21.0230, // ~1.2km
      longitude: 105.7920,
      openTime: '06:00',
      closeTime: '23:00',
      rating: 4.6,
      ratingCount: 65,
      amenities: [
        { title: 'Điều hòa thông thoáng', desc: 'Thoải mái mùa hè', icon: 'fan' }
      ]
    }
  });

  const venueNghiaTan = await prisma.venue.create({
    data: {
      districtId: districtCauGiay.id,
      name: 'CLB Cầu Lông Nghĩa Tân',
      slug: 'clb-cau-long-nghia-tan',
      address: '14 Tô Hiệu, Nghĩa Tân, Cầu Giấy',
      latitude: 21.0430, // ~1.8km
      longitude: 105.7950,
      openTime: '06:00',
      closeTime: '22:00',
      rating: 4.5,
      ratingCount: 52,
      amenities: [
        { title: 'Sân tiêu chuẩn CLB', desc: 'Giá sinh viên', icon: 'court' }
      ]
    }
  });

  const venuePickleSky = await prisma.venue.create({
    data: {
      districtId: districtCauGiay.id,
      name: 'D-Pickleball Sky Club',
      slug: 'd-pickleball-sky-club',
      address: 'Tầng 4 Tòa nhà Detech, Dịch Vọng Hậu, Cầu Giấy',
      latitude: 21.0325,
      longitude: 105.7865,
      openTime: '06:00',
      closeTime: '23:00',
      rating: 4.8,
      ratingCount: 110,
      amenities: [
        { title: 'Mặt sân Acrylic Pro', desc: 'Chuẩn quốc tế', icon: 'court' },
        { title: 'Quầy nước giải khát', desc: 'Đầy đủ đồ uống bổ sung điện giải', icon: 'cafe' }
      ]
    }
  });

  const venueBongDaTrungKinh = await prisma.venue.create({
    data: {
      districtId: districtCauGiay.id,
      name: 'Sân Bóng Đá Trung Kính Hạ',
      slug: 'san-bong-da-trung-kinh-ha',
      address: 'Ngõ 20 Trung Kính, Trung Hòa, Cầu Giấy',
      latitude: 21.0185,
      longitude: 105.7965,
      openTime: '06:00',
      closeTime: '23:00',
      rating: 4.6,
      ratingCount: 88,
      amenities: [
        { title: 'Cỏ nhân tạo thế hệ mới', desc: 'Độ nảy chuẩn', icon: 'field' },
        { title: 'Đèn cao áp 8 bóng', desc: 'Sáng rõ ban đêm', icon: 'light' }
      ]
    }
  });

  // 6. TẠO 6 SÂN CON (COURTS) CHO CỤM SÂN CẦU GIẤY (Khớp 100% Màn hình 1)
  const courtsData = [
    { name: 'Sân 1', surfaceType: SurfaceType.YONEX_PRO_MAT, surfaceName: 'Yonex Pro Mat', courtNumber: 1 },
    { name: 'Sân 2', surfaceType: SurfaceType.YONEX_PRO_MAT, surfaceName: 'Yonex Pro Mat', courtNumber: 2 },
    { name: 'Sân 3', surfaceType: SurfaceType.VIP_AIR_CONDITIONED, surfaceName: 'VIP Điều hòa', courtNumber: 3 },
    { name: 'Sân 4', surfaceType: SurfaceType.TARAFLEX, surfaceName: 'Thảm Taraflex', courtNumber: 4 },
    { name: 'Sân 5', surfaceType: SurfaceType.TARAFLEX, surfaceName: 'Thảm Taraflex', courtNumber: 5 },
    { name: 'Sân 6', surfaceType: SurfaceType.CLUB_STANDARD, surfaceName: 'Tiêu Chuẩn CLB', courtNumber: 6 },
  ];

  const createdCourts = [];
  for (const c of courtsData) {
    const court = await prisma.court.create({
      data: {
        venueId: venueCauGiay.id,
        name: c.name,
        surfaceType: c.surfaceType,
        surfaceName: c.surfaceName,
        courtNumber: c.courtNumber,
        sportType: SportType.BADMINTON,
      },
    });
    createdCourts.push(court);
  }

  // Tạo thêm sân cho Sân Dịch Vọng & Pickleball Sky
  await prisma.court.create({
    data: { venueId: venueDichVong.id, name: 'Sân DV-1', surfaceType: SurfaceType.TARAFLEX, surfaceName: 'Thảm Taraflex', courtNumber: 1, sportType: SportType.BADMINTON }
  });
  await prisma.court.create({
    data: { venueId: venuePickleSky.id, name: 'Sân Pickle 1', surfaceType: SurfaceType.CLUB_STANDARD, surfaceName: 'Mặt Acrylic', courtNumber: 1, sportType: SportType.PICKLEBALL }
  });

  // 7. CẤU HÌNH BẢNG GIÁ GIỜ VÀNG & GIỜ CHUẨN (PRICING RULES)
  await prisma.pricingRule.create({
    data: {
      venueId: venueCauGiay.id,
      name: 'Khung Giờ Tiêu Chuẩn',
      startTime: '06:00',
      endTime: '17:00',
      isPeakHour: false,
      pricePerHour: 80000,
    },
  });

  await prisma.pricingRule.create({
    data: {
      venueId: venueCauGiay.id,
      name: 'Giờ Vàng Cao Điểm 🔥',
      startTime: '17:00',
      endTime: '22:00',
      isPeakHour: true,
      pricePerHour: 120000,
    },
  });

  // 8. TẠO MÃ GIẢM GIÁ (VOUCHER)
  await prisma.voucher.create({
    data: {
      code: 'BADMINTON20',
      description: 'Giảm ngay 20.000đ khi đặt sân qua VietQR',
      discountAmount: 20000,
      minOrderValue: 80000,
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 ngày sau
      usageLimit: 1000,
      usedCount: 14,
    },
  });

  await prisma.voucher.create({
    data: {
      code: 'SPORTSYNC50',
      description: 'Ưu đãi thành viên mới - Giảm 50.000đ đơn từ 200k',
      discountAmount: 50000,
      minOrderValue: 200000,
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      usageLimit: 500,
      usedCount: 28,
    },
  });

  // 9. NẠP DỮ LIỆU ĐẶT SÂN & MA TRẬN LỊCH THỜI GIAN THỰC (Khớp 100% Màn hình 3 - CourtSync OS)
  const today = '2025-10-24'; // Ngày chuẩn theo mockup

  // Đơn 1: #BK-8902 - Nguyễn Tuấn (Sân 2: 18:00 - 20:00) -> 240k - Đã thanh toán VietQR
  const booking8902 = await prisma.booking.create({
    data: {
      bookingCode: '#BK-8902',
      venueId: venueCauGiay.id,
      userId: playerTuan.id,
      customerName: 'Nguyễn Tuấn',
      customerPhone: '0912345456',
      totalPeakAmount: 240000,
      discountAmount: 20000,
      finalAmount: 220000,
      voucherCode: 'BADMINTON20',
      paymentMethod: PaymentMethod.VIETQR_AUTO,
      paymentStatus: PaymentStatus.SUCCESS,
      status: BookingStatus.CONFIRMED,
      isMatchmakingEnabled: true,
      createdAt: new Date('2025-10-24T14:30:00Z'),
    },
  });

  await prisma.bookingSlot.create({
    data: {
      bookingId: booking8902.id,
      courtId: createdCourts[1].id, // Sân 2
      date: today,
      timeSlot: '18:00 - 19:00',
      price: 120000,
      isPeakHour: true,
      status: BookingStatus.CONFIRMED,
    },
  });
  await prisma.bookingSlot.create({
    data: {
      bookingId: booking8902.id,
      courtId: createdCourts[1].id, // Sân 2
      date: today,
      timeSlot: '19:00 - 20:00',
      price: 120000,
      isPeakHour: true,
      status: BookingStatus.CONFIRMED,
    },
  });

  await prisma.transaction.create({
    data: {
      bookingId: booking8902.id,
      paymentMethod: PaymentMethod.VIETQR_AUTO,
      amount: 220000,
      referenceCode: 'VQ8902MB99182',
      status: PaymentStatus.SUCCESS,
    },
  });

  // Đơn 2: #BK-8901 - Trần Hữu Nam (Sân 1: 17:00 - 19:00) -> 240k - Tiền mặt tại quầy
  const booking8901 = await prisma.booking.create({
    data: {
      bookingCode: '#BK-8901',
      venueId: venueCauGiay.id,
      customerName: 'Trần Hữu Nam',
      customerPhone: '0988112233',
      totalPeakAmount: 240000,
      finalAmount: 240000,
      paymentMethod: PaymentMethod.CASH_AT_COUNTER,
      paymentStatus: PaymentStatus.SUCCESS,
      status: BookingStatus.CONFIRMED,
      createdAt: new Date('2025-10-24T15:10:00Z'),
    },
  });
  await prisma.bookingSlot.create({
    data: {
      bookingId: booking8901.id,
      courtId: createdCourts[0].id, // Sân 1
      date: today,
      timeSlot: '17:00 - 18:00',
      price: 120000,
      isPeakHour: true,
      status: BookingStatus.CONFIRMED,
    },
  });
  await prisma.bookingSlot.create({
    data: {
      bookingId: booking8901.id,
      courtId: createdCourts[0].id, // Sân 1
      date: today,
      timeSlot: '18:00 - 19:00',
      price: 120000,
      isPeakHour: true,
      status: BookingStatus.CONFIRMED,
    },
  });

  // Đơn 3: #BK-8900 - Lê Hoàng Long (Sân 3: 19:00 - 21:00) -> 240k - VietQR
  const booking8900 = await prisma.booking.create({
    data: {
      bookingCode: '#BK-8900',
      venueId: venueCauGiay.id,
      customerName: 'Lê Hoàng Long',
      customerPhone: '0977223344',
      totalPeakAmount: 240000,
      finalAmount: 240000,
      paymentMethod: PaymentMethod.VIETQR_AUTO,
      paymentStatus: PaymentStatus.SUCCESS,
      status: BookingStatus.CONFIRMED,
      createdAt: new Date('2025-10-24T15:45:00Z'),
    },
  });
  await prisma.bookingSlot.create({
    data: {
      bookingId: booking8900.id,
      courtId: createdCourts[2].id, // Sân 3
      date: today,
      timeSlot: '19:00 - 20:00',
      price: 120000,
      isPeakHour: true,
      status: BookingStatus.CONFIRMED,
    },
  });
  await prisma.bookingSlot.create({
    data: {
      bookingId: booking8900.id,
      courtId: createdCourts[2].id, // Sân 3
      date: today,
      timeSlot: '20:00 - 21:00',
      price: 120000,
      isPeakHour: true,
      status: BookingStatus.CONFIRMED,
    },
  });

  // Đơn 4: #BK-8899 - Nguyễn Đức Anh (Sân 4: 20:00 - 21:00) -> 120k - Đang giữ chỗ Redis (Chờ QR 04:35)
  const booking8899 = await prisma.booking.create({
    data: {
      bookingCode: '#BK-8899',
      venueId: venueCauGiay.id,
      customerName: 'Nguyễn Đức Anh',
      customerPhone: '0966334455',
      totalPeakAmount: 120000,
      finalAmount: 120000,
      paymentMethod: PaymentMethod.VIETQR_AUTO,
      paymentStatus: PaymentStatus.PENDING,
      status: BookingStatus.HOLDING,
      holdExpiresAt: new Date(Date.now() + 275 * 1000), // ~04:35
      createdAt: new Date('2025-10-24T16:00:00Z'),
    },
  });
  await prisma.bookingSlot.create({
    data: {
      bookingId: booking8899.id,
      courtId: createdCourts[3].id, // Sân 4
      date: today,
      timeSlot: '17:00 - 18:00',
      price: 120000,
      isPeakHour: true,
      status: BookingStatus.HOLDING,
    },
  });

  // Đơn 5: #BK-8898 - Phạm Thùy Chi (Sân 5: 18:00 - 19:00) -> 120k - Chờ thanh toán
  const booking8898 = await prisma.booking.create({
    data: {
      bookingCode: '#BK-8898',
      venueId: venueCauGiay.id,
      customerName: 'Phạm Thùy Chi',
      customerPhone: '0944556677',
      totalPeakAmount: 120000,
      finalAmount: 120000,
      paymentMethod: PaymentMethod.VIETQR_AUTO,
      paymentStatus: PaymentStatus.PENDING,
      status: BookingStatus.HOLDING,
      holdExpiresAt: new Date(Date.now() + 492 * 1000), // ~08:12
      createdAt: new Date('2025-10-24T16:05:00Z'),
    },
  });
  await prisma.bookingSlot.create({
    data: {
      bookingId: booking8898.id,
      courtId: createdCourts[1].id, // Sân 2 lúc 20:00 - 21:00
      date: today,
      timeSlot: '20:00 - 21:00',
      price: 120000,
      isPeakHour: true,
      status: BookingStatus.HOLDING,
    },
  });

  // Thêm các slot khớp ma trận CourtSync OS Screen 3
  // Sân 1: 16:00-17:00 (Nguyễn Tuấn - Đã TT • VietQR), 20:00-21:00 (Lê Minh Khôi - Tiền mặt)
  const bookingKhôi = await prisma.booking.create({
    data: {
      bookingCode: '#BK-8897',
      venueId: venueCauGiay.id,
      customerName: 'Lê Minh Khôi',
      customerPhone: '0933112244',
      totalPeakAmount: 120000,
      finalAmount: 120000,
      paymentMethod: PaymentMethod.CASH_AT_COUNTER,
      paymentStatus: PaymentStatus.SUCCESS,
      status: BookingStatus.CONFIRMED,
    }
  });
  await prisma.bookingSlot.create({
    data: {
      bookingId: bookingKhôi.id,
      courtId: createdCourts[0].id,
      date: today,
      timeSlot: '20:00 - 21:00',
      price: 120000,
      isPeakHour: true,
      status: BookingStatus.CONFIRMED,
    }
  });

  // 10. NẠP 9 PHÒNG GHÉP KÈO MẪU (SẢNH TÌM KÈO - Khớp 100% Màn hình 2)
  const matchRoomsData = [
    {
      title: 'Sân Cầu Lông Dịch Vọng',
      sportType: SportType.BADMINTON,
      sportTag: '🏸 Cầu lông • TB-Khá',
      skillLevel: 'TB-Khá',
      pricePerPerson: 65000,
      maxPlayers: 6,
      currentPlayers: 4,
      status: MatchRoomStatus.OPEN,
      timeSlot: '19:00 - 21:00, Hôm nay',
      venueName: 'Sân Cầu Lông Dịch Vọng',
      address: 'Quận Cầu Giấy',
    },
    {
      title: 'D-Pickleball Sky Club',
      sportType: SportType.PICKLEBALL,
      sportTag: '🏓 Pickleball • Mới chơi',
      skillLevel: 'Mới chơi',
      pricePerPerson: 80000,
      maxPlayers: 4,
      currentPlayers: 3,
      status: MatchRoomStatus.OPEN,
      timeSlot: '18:00 - 20:00, Hôm nay',
      venueName: 'D-Pickleball Sky Club',
      address: 'Dịch Vọng Hậu',
    },
    {
      title: 'Sân Thảm Yonex Trần Thái Tông',
      sportType: SportType.BADMINTON,
      sportTag: '🏸 Cầu lông • Bán chuyên',
      skillLevel: 'Bán chuyên',
      pricePerPerson: 70000,
      maxPlayers: 6,
      currentPlayers: 6,
      status: MatchRoomStatus.FULL,
      timeSlot: '20:00 - 22:00, Hôm nay',
      venueName: 'Cụm Sân Cầu Lông Cầu Giấy',
      address: 'Trần Thái Tông',
    },
    {
      title: 'Sân Bóng Đá Trung Kính Hạ',
      sportType: SportType.FOOTBALL,
      sportTag: '⚽ Bóng đá 7 • Vui khỏe',
      skillLevel: 'Vui khỏe',
      pricePerPerson: 50000,
      maxPlayers: 14,
      currentPlayers: 11,
      status: MatchRoomStatus.OPEN,
      timeSlot: '19:30 - 21:00, Hôm nay',
      venueName: 'Sân Bóng Đá Trung Kính Hạ',
      address: 'Trung Kính',
    },
    {
      title: 'Sân Cầu Lông THCS Nghĩa Tân',
      sportType: SportType.BADMINTON,
      sportTag: '🏸 Cầu lông • Trung bình',
      skillLevel: 'Trung bình',
      pricePerPerson: 60000,
      maxPlayers: 6,
      currentPlayers: 4,
      status: MatchRoomStatus.OPEN,
      timeSlot: '17:30 - 19:30, Hôm nay',
      venueName: 'Sân Cầu Lông THCS Nghĩa Tân',
      address: 'Nghĩa Tân',
    },
    {
      title: 'PickleArena Cầu Giấy',
      sportType: SportType.PICKLEBALL,
      sportTag: '🏓 Pickleball • TB-Khá',
      skillLevel: 'TB-Khá',
      pricePerPerson: 90000,
      maxPlayers: 4,
      currentPlayers: 3,
      status: MatchRoomStatus.OPEN,
      timeSlot: '20:00 - 22:00, Hôm nay',
      venueName: 'PickleArena Cầu Giấy',
      address: 'Phạm Văn Đồng',
    },
    {
      title: 'Nhà Thi Đấu Cầu Giấy Sân 2',
      sportType: SportType.BADMINTON,
      sportTag: '🏸 Cầu lông • Giao lưu mở',
      skillLevel: 'Giao lưu mở',
      pricePerPerson: 55000,
      maxPlayers: 6,
      currentPlayers: 2,
      status: MatchRoomStatus.OPEN,
      timeSlot: '18:30 - 20:30, Hôm nay',
      venueName: 'Nhà Thi Đấu Cầu Giấy Sân 2',
      address: 'Trần Quý Kiên',
    },
    {
      title: 'CLB Cầu Lông Yên Hòa',
      sportType: SportType.BADMINTON,
      sportTag: '🏸 Cầu lông • Đôi Nam Nữ',
      skillLevel: 'Đôi Nam Nữ',
      pricePerPerson: 65000,
      maxPlayers: 4,
      currentPlayers: 4,
      status: MatchRoomStatus.FULL,
      timeSlot: '19:00 - 21:00, Hôm nay',
      venueName: 'CLB Cầu Lông Yên Hòa',
      address: 'Hạ Yên Quyết',
    },
    {
      title: 'Green Club Pickle Court 4',
      sportType: SportType.PICKLEBALL,
      sportTag: '🏓 Pickleball • Tập luyện',
      skillLevel: 'Tập luyện',
      pricePerPerson: 75000,
      maxPlayers: 4,
      currentPlayers: 2,
      status: MatchRoomStatus.OPEN,
      timeSlot: '21:00 - 22:30, Hôm nay',
      venueName: 'Green Club Pickle Court 4',
      address: 'Mai Dịch',
    },
  ];

  for (const m of matchRoomsData) {
    const room = await prisma.matchRoom.create({
      data: {
        title: m.title,
        sportType: m.sportType,
        sportTag: m.sportTag,
        skillLevel: m.skillLevel,
        pricePerPerson: m.pricePerPerson,
        maxPlayers: m.maxPlayers,
        currentPlayers: m.currentPlayers,
        status: m.status,
        playDate: today,
        timeSlot: m.timeSlot,
        venueName: m.venueName,
        address: m.address,
      },
    });

    // Thêm người tham gia mẫu
    await prisma.matchParticipant.create({
      data: {
        matchRoomId: room.id,
        playerName: 'Nguyễn Thành Nam',
        playerPhone: '0981234567',
        status: ParticipantStatus.CONFIRMED,
      },
    });

    // Nếu phòng đầy, thêm 1 người vào hàng chờ (WAITLISTED)
    if (m.status === MatchRoomStatus.FULL) {
      await prisma.matchParticipant.create({
        data: {
          matchRoomId: room.id,
          playerName: 'Lê Văn Hùng',
          playerPhone: '0977889900',
          status: ParticipantStatus.WAITLISTED,
        },
      });
    }
  }

  console.log('✅ Nạp dữ liệu mẫu hoàn tất thành công!');
  console.log(`- 4 Quận tại Hà Nội (Cầu Giấy, Ba Đình, Đống Đa, Nam Từ Liêm)`);
  console.log(`- Cụm sân chính: ${venueCauGiay.name} với 6 sân con & bảng giá Giờ vàng`);
  console.log(`- 5 Cụm sân lân cận trong bán kính 2.5km`);
  console.log(`- Voucher: BADMINTON20 (-20k) & SPORTSYNC50 (-50k)`);
  console.log(`- 5 Đơn đặt sân thời gian thực khớp bảng điều hành CourtSync OS`);
  console.log(`- 9 Phòng ghép kèo thể thao khớp Sảnh Tìm Kèo Giao Lưu`);
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi chạy seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
