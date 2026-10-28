import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useOwnerStore } from '../../store/useOwnerStore';
import { ownerApi } from '../../api/ownerApi';

export const WalkInBookingModal: React.FC = () => {
  const {
    isCounterModalOpen,
    setIsCounterModalOpen,
    selectedSlotForBooking,
    courts,
    timeSlots,
    venueSlug,
    selectedDate,
    addCounterBooking,
  } = useOwnerStore();

  const [courtId, setCourtId] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [price, setPrice] = useState(120000);
  const [notes, setNotes] = useState('Thu tiền mặt tại quầy');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Sync state when opened via clicking an empty slot
  useEffect(() => {
    if (selectedSlotForBooking) {
      setCourtId(selectedSlotForBooking.courtId);
      setTimeSlot(selectedSlotForBooking.timeSlot);
    } else if (courts.length > 0 && !courtId) {
      setCourtId(courts[0].id);
      setTimeSlot(timeSlots[0] || '16:00 - 17:00');
    }
  }, [selectedSlotForBooking, courts, timeSlots]);

  if (!isCounterModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('Vui lòng nhập tên khách hàng');
      return;
    }

    if (!customerPhone.trim() || customerPhone.length < 9) {
      setErrorMessage('Vui lòng nhập số điện thoại hợp lệ (tối thiểu 9 số)');
      return;
    }

    const selectedCourt = courts.find((c) => c.id === courtId) || courts[0];

    try {
      setIsSubmitting(true);

      const response = await ownerApi.createCounterBooking({
        venueSlug,
        courtId,
        date: selectedDate,
        timeSlot,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        price,
        notes,
      });

      // Optimistic update in Zustand store
      addCounterBooking({
        courtId,
        courtName: selectedCourt.name,
        timeSlot,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        amount: price,
        bookingCode: response.bookingCode || `#BK-${Math.floor(1000 + Math.random() * 9000)}`,
      });

      setSuccessToast(`Đã đặt sân và thu tiền mặt thành công cho ${customerName}!`);

      // Reset form
      setCustomerName('');
      setCustomerPhone('');
      setTimeout(() => {
        setSuccessToast('');
        setIsCounterModalOpen(false);
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Có lỗi xảy ra khi tạo đơn đặt sân.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <h3 className="font-bold text-sm tracking-tight">
              Đặt sân tại quầy (Thu tiền mặt trực tiếp)
            </h3>
          </div>
          <button
            onClick={() => setIsCounterModalOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="flex items-center space-x-2 p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successToast && (
            <div className="flex items-center space-x-2 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successToast}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Chọn Sân */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Sân thi đấu
              </label>
              <select
                value={courtId}
                onChange={(e) => setCourtId(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {courts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.surfaceName})
                  </option>
                ))}
              </select>
            </div>

            {/* Chọn Khung Giờ */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Khung giờ
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {timeSlots.map((ts) => (
                  <option key={ts} value={ts}>
                    {ts}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tên khách hàng */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Họ và tên khách hàng <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: Nguyễn Văn Nam"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
            />
          </div>

          {/* Số điện thoại */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Số điện thoại liên hệ <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              placeholder="VD: 0912345678"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
            />
          </div>

          {/* Giá tiền & Ghi chú */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Giá thu tiền mặt (VNĐ)
              </label>
              <input
                type="number"
                step="10000"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Ghi chú nội bộ
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="VD: Khách trả tiền mặt"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Nút hành động */}
          <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCounterModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Đang ghi nhận...' : 'Xác nhận & Thu tiền mặt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
