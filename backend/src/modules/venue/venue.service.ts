import { venueRepository } from './venue.repository';
import { AppError } from '../../middlewares/errorHandler';
import { calculateHaversineDistance, formatDistanceString } from '../../utils/haversine';
import {
  VenueScheduleResponse,
  CourtScheduleRow,
  ScheduleSlotCell,
  NearbyVenueItem,
  SlotStatus,
} from './venue.types';

export class VenueService {
  /**
   * Lấy ma trận lịch thời gian thực cho một Cụm Sân theo Slug và Ngày
   * Khớp 100% với CourtScheduleMatrix trên Màn hình 1 và Màn hình 3
   */
  async getVenueSchedule(slug: string, targetDate?: string): Promise<VenueScheduleResponse> {
    const venue = await venueRepository.findBySlug(slug);
    if (!venue) {
      throw new AppError(`Không tìm thấy cụm sân với mã: ${slug}`, 404);
    }

    const selectedDate = targetDate || '2025-10-24'; // Mặc định ngày theo mockup

    // Định nghĩa các cột khung giờ theo đúng thiết kế Màn hình 1
    const timeSlots = [
      { time: '06:00', label: '06:00 - 08:00', isPeakHour: false },
      { time: '08:00', label: '08:00 - 10:00', isPeakHour: false },
      { time: '10:00', label: '10:00 - 12:00', isPeakHour: false },
      { time: '14:00', label: '14:00 - 16:00', isPeakHour: false },
      { time: '16:00', label: '16:00 - 17:00', isPeakHour: false },
      { time: '17:00', label: '17:00 - 18:00', isPeakHour: true },
      { time: '18:00', label: '18:00 - 19:00', isPeakHour: true },
      { time: '19:00', label: '19:00 - 20:00', isPeakHour: true },
    ];

    // Lấy các slots đã đặt trong cơ sở dữ liệu
    const courtIds = venue.courts.map((c) => c.id);
    const existingSlots = await venueRepository.findBookingSlots(courtIds, selectedDate);

    // Xây dựng ma trận lịch cho từng sân con (Sân 1 -> Sân 6)
    const courtsSchedule: CourtScheduleRow[] = venue.courts.map((court) => {
      const slotsRecord: Record<string, ScheduleSlotCell> = {};

      timeSlots.forEach((slotDef) => {
        // Tìm slot đã đặt trong DB
        // So sánh theo chuỗi bắt đầu hoặc trùng khớp
        const matchedSlot = existingSlots.find(
          (s) => s.courtId === court.id && (s.timeSlot.startsWith(slotDef.time) || s.timeSlot.includes(slotDef.time))
        );

        let status: SlotStatus = 'AVAILABLE';
        let ttlSecondsRemaining: number | undefined;
        let bookedByName: string | undefined;
        let paymentMethod: string | undefined;

        // Tính giá dựa trên loại sân & khung giờ vàng
        let price = slotDef.isPeakHour ? 120000 : 80000;
        if (court.surfaceName.includes('VIP') && !slotDef.isPeakHour) {
          price = 100000;
        }

        if (matchedSlot) {
          if (matchedSlot.status === 'CONFIRMED') {
            status = 'BOOKED';
            bookedByName = matchedSlot.booking?.customerName;
            paymentMethod = matchedSlot.booking?.paymentMethod;
          } else if (matchedSlot.status === 'HOLDING') {
            status = 'HOLDING';
            // Tính số giây TTL còn lại
            if (matchedSlot.booking?.holdExpiresAt) {
              const diffMs = new Date(matchedSlot.booking.holdExpiresAt).getTime() - Date.now();
              ttlSecondsRemaining = Math.max(0, Math.floor(diffMs / 1000));
            } else {
              ttlSecondsRemaining = 252; // Default ~04:12 nếu đang mock
            }
          }
        }

        slotsRecord[slotDef.time] = {
          courtId: court.id,
          courtName: court.name,
          surfaceName: court.surfaceName,
          timeSlot: slotDef.time,
          price,
          isPeakHour: slotDef.isPeakHour,
          status,
          holdExpiresAt: matchedSlot?.booking?.holdExpiresAt?.toISOString() || null,
          ttlSecondsRemaining,
          bookedByName,
          paymentMethod,
        };
      });

      return {
        courtId: court.id,
        courtName: court.name,
        surfaceType: court.surfaceType,
        surfaceName: court.surfaceName,
        sportType: court.sportType,
        courtNumber: court.courtNumber,
        slots: slotsRecord,
      };
    });

    // Danh sách 5 ngày lựa chọn trên tab (Hôm nay, Ngày mai, T.Sáu, T.Bảy 🔥, Chủ Nhật 🔥)
    const availableDates = [
      { date: '2025-10-24', label: 'Hôm nay (24/10)', isPeakDay: false, isToday: true },
      { date: '2025-10-25', label: 'Ngày mai (25/10)', isPeakDay: false, isToday: false },
      { date: '2025-10-26', label: 'T.Sáu (26/10)', isPeakDay: false, isToday: false },
      { date: '2025-10-27', label: 'T.Bảy (27/10) 🔥', isPeakDay: true, isToday: false },
      { date: '2025-10-28', label: 'Chủ Nhật (28/10) 🔥', isPeakDay: true, isToday: false },
    ];

    return {
      venue: {
        id: venue.id,
        name: venue.name,
        slug: venue.slug,
        address: venue.address,
        latitude: venue.latitude,
        longitude: venue.longitude,
        openTime: venue.openTime,
        closeTime: venue.closeTime,
        isBwfStandard: venue.isBwfStandard,
        rating: venue.rating,
        ratingCount: venue.ratingCount,
        amenities: venue.amenities as Array<{ title: string; desc: string; icon: string }>,
      },
      date: selectedDate,
      availableDates,
      timeColumns: timeSlots,
      peakHourBanner: {
        title: 'GIỜ VÀNG (17:00 - 22:00): 120K | Giờ chuẩn: 80k/h',
        standardPrice: 80000,
        peakPrice: 120000,
        peakRange: '17:00 - 22:00',
      },
      courts: courtsSchedule,
    };
  }

  /**
   * Tìm kiếm các cụm sân trong bán kính 2.5km bằng công thức Haversine
   */
  async getNearbyVenues(
    userLat: number,
    userLng: number,
    radiusKm = 2.5,
    excludeSlug?: string
  ): Promise<NearbyVenueItem[]> {
    const allVenues = await venueRepository.findAllVenuesWithLocation();

    const nearbyList: NearbyVenueItem[] = [];

    for (const v of allVenues) {
      const distance = calculateHaversineDistance(userLat, userLng, v.latitude, v.longitude);

      if (distance <= radiusKm) {
        const prices = v.pricingRules.map((p) => p.pricePerHour);
        const minPrice = prices.length > 0 ? Math.min(...prices) : 80000;

        nearbyList.push({
          id: v.id,
          name: v.name,
          slug: v.slug,
          address: v.address,
          distanceKm: distance,
          distanceFormatted: formatDistanceString(distance),
          latitude: v.latitude,
          longitude: v.longitude,
          rating: v.rating,
          availableSlotCount: Math.floor(Math.random() * 5) + 2, // 2-6 slots
          minPrice,
          isCurrent: v.slug === excludeSlug,
        });
      }
    }

    // Sắp xếp theo khoảng cách tăng dần (gần nhất lên đầu)
    return nearbyList.sort((a, b) => a.distanceKm - b.distanceKm);
  }

  /**
   * Lấy danh sách Quận & Cụm sân cho bộ lọc chuyển nhanh
   */
  async getDistrictsWithVenues() {
    return venueRepository.findAllDistrictsWithVenues();
  }
}

export const venueService = new VenueService();
