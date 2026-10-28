import React, { useState, useEffect } from 'react';
import {
  Clock,
  MapPin,
  Trash2,
  Users,
  Zap,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { useBookingStore } from '../../store/useBookingStore';
import { VietQRModal } from './VietQRModal';
import { apiClient } from '../../api/client';

export const BookingSidebar: React.FC = () => {
  const {
    selectedSlots,
    removeSlot,
    isMatchmakingEnabled,
    setIsMatchmakingEnabled,
    matchmakingLevel,
    neededPlayers,
    voucherCode,
    discountAmount,
    holdSecondsRemaining,
    decrementTimer,
    selectedVenueSlug,
  } = useBookingStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeBookingCode, setActiveBookingCode] = useState('#BK-8902');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isVoucherApplied = Boolean(voucherCode);

  // Đếm ngược 1 giây mỗi chu kỳ
  useEffect(() => {
    const timer = setInterval(() => {
      decrementTimer();
    }, 1000);
    return () => clearInterval(timer);
  }, [decrementTimer]);

  // Format giây thành MM:SS
  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Tính toán giờ chuẩn vs giờ vàng
  const standardHours = selectedSlots.filter((s) => !s.isPeakHour).length;
  const standardTotal = selectedSlots
    .filter((s) => !s.isPeakHour)
    .reduce((sum, s) => sum + s.price, 0);

  const peakHours = selectedSlots.filter((s) => s.isPeakHour).length;
  const peakTotal = selectedSlots
    .filter((s) => s.isPeakHour)
    .reduce((sum, s) => sum + s.price, 0);

  const subtotal = standardTotal + peakTotal;
  const finalTotal = Math.max(0, subtotal - (isVoucherApplied ? discountAmount : 0));

  // Kích hoạt API Giữ chỗ Redis và mở Modal VietQR
  const handleOpenPayment = async () => {
    if (selectedSlots.length === 0) {
      alert('Vui lòng chọn ít nhất 1 khung giờ trên ma trận lịch.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = (await apiClient.post('/bookings/hold', {
        venueId: selectedVenueSlug || 'cum-san-cau-long-cau-giay',
        customerName: 'Nguyễn Tuấn',
        customerPhone: '0912345456',
        slots: selectedSlots.map((s) => ({
          courtId: s.courtId,
          date: '2025-10-24',
          timeSlot: s.timeSlot,
          price: s.price,
          isPeakHour: s.isPeakHour,
        })),
        voucherCode: voucherCode || undefined,
        isMatchmakingEnabled,
        matchmakingLevel,
        neededPlayers,
      })) as { data?: { bookingCode?: string } };

      if (res?.data?.bookingCode) {
        setActiveBookingCode(res.data.bookingCode);
      }
      setIsModalOpen(true);
    } catch (err) {
      console.warn('Backend call warning, fallback to default booking code for demo:', err);
      // Fallback cho phép hiển thị modal trải nghiệm mượt mà ngay cả khi chưa bật server
      setActiveBookingCode('#BK-8902');
      setIsModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden sticky top-24">
        {/* 1. TOP COUNTDOWN BAR (AMBER) */}
        <div className="bg-amber-50/90 border-b border-amber-200/80 p-3.5">
          <div className="flex items-center justify-between text-amber-900 text-xs font-semibold mb-1.5">
            <div className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Giữ chỗ tạm thời hết hạn sau:</span>
            </div>
            <span className="font-mono text-sm font-extrabold text-amber-800">
              {formatTimer(holdSecondsRemaining)}
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-amber-200/60 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${(holdSecondsRemaining / 600) * 100}%` }}
            />
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* 2. VENUE INFO */}
          <div>
            <div className="text-2xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              ĐỊA ĐIỂM TỔ CHỨC
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Cụm Sân Cầu Lông Cầu Giấy
            </h3>
            <p className="text-xs text-slate-500 flex items-start space-x-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>Số 35 Trần Thái Tông, Dịch Vọng Hậu, Cầu Giấy</span>
            </p>
          </div>

          {/* 3. SELECTED SLOTS LIST */}
          <div>
            <div className="text-2xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Khung giờ đã chọn:
            </div>

            {selectedSlots.length === 0 ? (
              <div className="text-xs text-slate-400 italic py-3 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Chưa chọn khung giờ nào từ ma trận lịch.
              </div>
            ) : (
              <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
                    <Zap className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Sân 2 (Thảm Yonex Pro)
                    </div>
                    <div className="text-2xs text-slate-500 mt-0.5">
                      18:00 - 20:00 ({selectedSlots.length} giờ • Giờ vàng)
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-900">
                    {subtotal.toLocaleString('vi-VN')}đ
                  </span>
                  <button
                    onClick={() => removeSlot('court-2', '18:00')}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    title="Xóa slot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4. TOGGLE MỞ PHÒNG TUYỂN GIAO LƯU */}
          <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-slate-900">
                  Mở phòng tuyển giao lưu
                </span>
              </div>

              {/* Toggle switch */}
              <button
                onClick={() => setIsMatchmakingEnabled(!isMatchmakingEnabled)}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                  isMatchmakingEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    isMatchmakingEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <p className="text-2xs text-slate-600 leading-relaxed">
              Cho phép vợt thủ cùng trình độ tham gia ghép sân chia đôi tiền cọc.
            </p>

            {isMatchmakingEnabled && (
              <div className="bg-white/80 rounded-lg p-2 border border-emerald-200/60 flex items-center space-x-1.5 text-2xs text-emerald-900 font-medium">
                <span>🏆</span>
                <span>
                  Trình độ: <b className="text-emerald-800">{matchmakingLevel}</b> • Cần ghép: <b className="text-emerald-800">{neededPlayers} người</b>
                </span>
              </div>
            )}
          </div>

          {/* 5. PRICE BREAKDOWN */}
          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Giờ tiêu chuẩn ({standardHours}h)</span>
              <span>{standardTotal.toLocaleString('vi-VN')}đ</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Giờ vàng cao điểm ({peakHours}h x 120k)</span>
              <span>{peakTotal.toLocaleString('vi-VN')}đ</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Hệ thống chiếu sáng & Dịch vụ</span>
              <span className="text-emerald-600 font-medium">Miễn phí</span>
            </div>

            {/* Voucher row */}
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center space-x-1 text-emerald-700 font-medium">
                <Tag className="w-3.5 h-3.5" />
                <span>Mã giảm giá ({voucherCode})</span>
              </div>
              <span className="text-emerald-600 font-bold">
                -{discountAmount.toLocaleString('vi-VN')}đ
              </span>
            </div>
          </div>

          {/* 6. TOTAL AMOUNT */}
          <div className="pt-3 border-t border-slate-100 flex items-end justify-between">
            <div>
              <div className="text-2xs font-bold uppercase tracking-wider text-slate-400">
                TỔNG THANH TOÁN
              </div>
              <div className="text-2xl font-black text-emerald-600 tracking-tight">
                {finalTotal.toLocaleString('vi-VN')}đ
              </div>
            </div>
            <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 mb-1">
              Đã bao gồm VAT
            </span>
          </div>

          {/* 7. CTA BUTTON: VIETQR */}
          <button
            onClick={handleOpenPayment}
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-sm shadow-emerald-200 transition-all disabled:opacity-50"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>
              {isSubmitting
                ? 'Đang khóa slot...'
                : `Thanh toán nhanh VietQR (${finalTotal.toLocaleString('vi-VN')}đ)`}
            </span>
          </button>

          {/* 8. BANK LOGOS ROW */}
          <div className="flex items-center justify-between px-1 py-1.5 text-2xs text-slate-400 font-semibold grayscale opacity-80 border-t border-b border-slate-100">
            <span className="text-slate-600 font-bold">VietQR</span>
            <span>Napas 247</span>
            <span>MB Bank</span>
            <span>Vietcombank</span>
            <span>Techcombank</span>
          </div>

          {/* 9. TRUST BADGES */}
          <div className="flex items-center justify-center space-x-1.5 text-2xs text-slate-500 font-medium text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Giữ slot tức thì • Hoàn hủy miễn phí trước 2 giờ</span>
          </div>
        </div>
      </div>

      {/* VietQR Payment Modal */}
      <VietQRModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bookingCode={activeBookingCode}
        amount={finalTotal}
        courtName="Sân 2 (Thảm Yonex Pro)"
        timeSlot="18:00 - 20:00"
        isMatchmakingEnabled={isMatchmakingEnabled}
      />
    </>
  );
};
