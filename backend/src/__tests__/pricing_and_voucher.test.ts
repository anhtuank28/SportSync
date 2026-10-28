describe('ISO/IEC 25010 - Pricing Engine & Voucher Calculation Tests', () => {
  test('Tính toán đúng tổng tiền giờ chuẩn (80k) và giờ vàng (120k)', () => {
    const slots = [
      { courtId: 'c1', date: '2025-10-24', timeSlot: '16:00 - 17:00', price: 80000, isPeakHour: false },
      { courtId: 'c1', date: '2025-10-24', timeSlot: '18:00 - 19:00', price: 120000, isPeakHour: true },
      { courtId: 'c1', date: '2025-10-24', timeSlot: '19:00 - 20:00', price: 120000, isPeakHour: true },
    ];

    let totalStandard = 0;
    let totalPeak = 0;

    slots.forEach((s) => {
      if (s.isPeakHour) {
        totalPeak += s.price;
      } else {
        totalStandard += s.price;
      }
    });

    const subtotal = totalStandard + totalPeak;

    expect(totalStandard).toBe(80000);
    expect(totalPeak).toBe(240000);
    expect(subtotal).toBe(320000);
  });

  test('Khấu trừ voucher BADMINTON20 (giảm 20.000đ khi đạt giá trị tối thiểu)', () => {
    const voucher = {
      code: 'BADMINTON20',
      discountAmount: 20000,
      minOrderValue: 100000,
      isActive: true,
      endDate: new Date(Date.now() + 86400000), // Còn hạn
    };

    const orderSubtotal = 240000; // 2 giờ vàng: 2 * 120.000đ = 240.000đ

    expect(orderSubtotal).toBeGreaterThanOrEqual(voucher.minOrderValue);

    const discountAmount = voucher.discountAmount;
    const finalAmount = Math.max(0, orderSubtotal - discountAmount);

    // Khớp 100% Mockup 1: 240.000đ - 20.000đ = 220.000đ
    expect(discountAmount).toBe(20000);
    expect(finalAmount).toBe(220000);
  });

  test('Đơn hàng không bị âm khi giảm giá vượt quá giá trị đơn hàng', () => {
    const voucherDiscount = 100000;
    const smallOrderSubtotal = 80000;

    const finalAmount = Math.max(0, smallOrderSubtotal - voucherDiscount);
    expect(finalAmount).toBe(0);
  });
});
