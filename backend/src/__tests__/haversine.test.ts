import { calculateHaversineDistance, formatDistanceString } from '../utils/haversine';

describe('ISO/IEC 25010 - Haversine Distance & Proximity Tests', () => {
  // Tọa độ Cụm Sân Cầu Lông Cầu Giấy (SkyCourts Center)
  const SKYCOURTS_LAT = 21.0313;
  const SKYCOURTS_LON = 105.7892;

  test('Tính chính xác khoảng cách lân cận Cầu Giấy -> Dịch Vọng (~800m)', () => {
    // Sân Dịch Vọng
    const DICH_VONG_LAT = 21.0355;
    const DICH_VONG_LON = 105.7940;

    const distanceKm = calculateHaversineDistance(
      SKYCOURTS_LAT,
      SKYCOURTS_LON,
      DICH_VONG_LAT,
      DICH_VONG_LON
    );

    expect(distanceKm).toBeGreaterThan(0);
    expect(distanceKm).toBeLessThan(1.5);
    // Bán kính lân cận 2.5km theo nghiệp vụ
    expect(distanceKm).toBeLessThanOrEqual(2.5);
  });

  test('Khoảng cách từ 1 điểm đến chính nó phải bằng 0', () => {
    const distanceKm = calculateHaversineDistance(
      SKYCOURTS_LAT,
      SKYCOURTS_LON,
      SKYCOURTS_LAT,
      SKYCOURTS_LON
    );
    expect(distanceKm).toBe(0);
  });

  test('Định dạng hiển thị mét (< 1km) và kilomet (>= 1km)', () => {
    expect(formatDistanceString(0.8)).toBe('800m');
    expect(formatDistanceString(0.5)).toBe('500m');
    expect(formatDistanceString(1.2)).toBe('1.2km');
    expect(formatDistanceString(2.5)).toBe('2.5km');
  });
});
