import React from 'react';
import { Flame, Lock, Check, MousePointerClick } from 'lucide-react';
import { useBookingStore, SelectedSlot } from '../../store/useBookingStore';

interface CourtScheduleMatrixProps {
  onSlotClick?: (slot: SelectedSlot) => void;
}

export const CourtScheduleMatrix: React.FC<CourtScheduleMatrixProps> = () => {
  const { selectedDate, setSelectedDate, selectedSlots, toggleSlot } = useBookingStore();

  // Danh sách các cột giờ khớp mockup Màn hình 1
  const timeColumns = [
    { id: '06:00', label: '06:00', isPeak: false },
    { id: '08:00', label: '08:00', isPeak: false },
    { id: '10:00', label: '10:00', isPeak: false },
    { id: '14:00', label: '14:00', isPeak: false },
    { id: '16:00', label: '16:00', isPeak: false },
    { id: '17:00', label: '17:00 🔥', isPeak: true },
    { id: '18:00', label: '18:00 🔥', isPeak: true },
    { id: '19:00', label: '19:00 🔥', isPeak: true },
  ];

  // 6 Sân con theo đúng thiết kế Màn hình 1
  const courts = [
    { id: 'court-1', name: 'Sân 1', surface: 'Yonex Pro Mat', basePrice: 80 },
    { id: 'court-2', name: 'Sân 2', surface: 'Yonex Pro Mat', basePrice: 80, hasDot: true },
    { id: 'court-3', name: 'Sân 3', surface: 'VIP Điều hòa', basePrice: 100 },
    { id: 'court-4', name: 'Sân 4', surface: 'Thảm Taraflex', basePrice: 80 },
    { id: 'court-5', name: 'Sân 5', surface: 'Thảm Taraflex', basePrice: 80 },
    { id: 'court-6', name: 'Sân 6', surface: 'Tiêu Chuẩn CLB', basePrice: 80 },
  ];

  // Dữ liệu trạng thái slot mô phỏng đúng 100% Mockup 1:
  // - Sân 1: 08:00 kín, 16:00 giữ chỗ (04:12), 17:00 kín, 18:00 kín
  // - Sân 2: 10:00 kín, 18:00 đang chọn, 19:00 đang chọn
  // - Sân 3: 06:00 kín, 14:00 kín, 17:00 kín, 18:00 kín, 19:00 giữ chỗ (08:44)
  // - Sân 4: 18:00 kín, 19:00 kín
  // - Sân 5: 06:00 kín, 16:00 kín, 17:00 kín
  // - Sân 6: 14:00 kín, 19:00 kín
  const bookedOrHoldingMap: Record<string, { status: 'BOOKED' | 'HOLDING'; timer?: string }> = {
    'court-1_08:00': { status: 'BOOKED' },
    'court-1_16:00': { status: 'HOLDING', timer: '04:12' },
    'court-1_17:00': { status: 'BOOKED' },
    'court-1_18:00': { status: 'BOOKED' },

    'court-2_10:00': { status: 'BOOKED' },

    'court-3_06:00': { status: 'BOOKED' },
    'court-3_14:00': { status: 'BOOKED' },
    'court-3_17:00': { status: 'BOOKED' },
    'court-3_18:00': { status: 'BOOKED' },
    'court-3_19:00': { status: 'HOLDING', timer: '08:44' },

    'court-4_18:00': { status: 'BOOKED' },
    'court-4_19:00': { status: 'BOOKED' },

    'court-5_06:00': { status: 'BOOKED' },
    'court-5_16:00': { status: 'BOOKED' },
    'court-5_17:00': { status: 'BOOKED' },

    'court-6_14:00': { status: 'BOOKED' },
    'court-6_19:00': { status: 'BOOKED' },
  };

  const datesTabs = [
    { id: '2025-10-24', label: 'Hôm nay (24/10)', isPeak: false },
    { id: '2025-10-25', label: 'Ngày mai (25/10)', isPeak: false },
    { id: '2025-10-26', label: 'T.Sáu (26/10)', isPeak: false },
    { id: '2025-10-27', label: 'T.Bảy (27/10)', isPeak: true },
    { id: '2025-10-28', label: 'Chủ Nhật (28/10)', isPeak: true },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
      {/* 1. Header Card: Live Status & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-2xs font-bold uppercase tracking-wider text-emerald-600">
              TRỰC TIẾP CẬP NHẬT
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Lịch Đặt Sân Thời Gian Thực
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            35 Trần Thái Tông, Cầu Giấy • Hệ thống 6 sân thảm cao cấp
          </p>
        </div>

        {/* Golden Hour Pill */}
        <div className="bg-amber-50 border border-amber-200/80 rounded-xl px-3.5 py-2 flex items-center space-x-2 text-xs text-amber-900 self-start md:self-auto">
          <div className="w-6 h-6 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <span className="font-bold">GIỜ VÀNG (17:00 - 22:00): 120K</span>
            <div className="text-2xs text-amber-700">Giờ chuẩn: 80k/h</div>
          </div>
        </div>
      </div>

      {/* 2. Date Tabs Filter */}
      <div className="flex items-center space-x-2 py-4 overflow-x-auto no-scrollbar">
        {datesTabs.map((tab) => {
          const isActive = selectedDate === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedDate(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              {tab.isPeak && (
                <Flame className={`w-3.5 h-3.5 ${isActive ? 'fill-white text-white' : 'fill-amber-500 text-amber-500'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Legend Row */}
      <div className="flex flex-wrap items-center justify-between py-2.5 px-3 bg-slate-50 rounded-xl text-xs text-slate-600 mb-4 gap-2">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded border border-slate-300 bg-white" />
            <span>Còn trống (80k/120k)</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded bg-emerald-600 text-white flex items-center justify-center text-2xs">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </span>
            <span className="font-semibold text-emerald-700">
              Đang chọn ({selectedSlots.length} slot)
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-600 text-2xs">
              <Lock className="w-2 h-2" />
            </span>
            <span>Giữ chỗ (Có cọc)</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-500 text-2xs">
              <Lock className="w-2 h-2" />
            </span>
            <span>Kín lịch</span>
          </div>
        </div>

        <div className="hidden lg:flex items-center space-x-1 text-slate-400 text-2xs">
          <MousePointerClick className="w-3.5 h-3.5" />
          <span>Click để chọn hoặc hủy slot</span>
        </div>
      </div>

      {/* 4. Ma Trận Lịch Chi Tiết (Matrix Table) */}
      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="py-2.5 px-3 text-left text-xs font-semibold text-slate-500 w-36">
                Cụm Sân
              </th>
              {timeColumns.map((col) => (
                <th
                  key={col.id}
                  className={`py-2.5 px-2 text-xs font-semibold ${
                    col.isPeak ? 'text-amber-600' : 'text-slate-600'
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {courts.map((court) => (
              <tr key={court.id} className="hover:bg-slate-50/50 transition-colors">
                {/* Cột Tên Sân */}
                <td className="py-3 px-3 text-left">
                  <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                    {court.hasDot && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                    <span>{court.name}</span>
                  </div>
                  <div className="text-2xs text-slate-400 font-normal">
                    {court.surface}
                  </div>
                </td>

                {/* Các Ô Giờ (Slots) */}
                {timeColumns.map((col) => {
                  const key = `${court.id}_${col.id}`;
                  const isSelected = selectedSlots.some(
                    (s) => s.courtId === court.id && s.timeSlot === col.id
                  );
                  const specialStatus = bookedOrHoldingMap[key];

                  // Tính giá
                  const price = col.isPeak ? 120 : court.basePrice;

                  // 1. Ô ĐANG CHỌN (EMERALD)
                  if (isSelected) {
                    return (
                      <td key={col.id} className="p-1.5">
                        <button
                          onClick={() =>
                            toggleSlot({
                              courtId: court.id,
                              courtName: court.name,
                              surfaceName: court.surface,
                              timeSlot: col.id,
                              price: price * 1000,
                              isPeakHour: col.isPeak,
                            })
                          }
                          className="w-full h-11 rounded-xl bg-emerald-600 text-white font-bold flex flex-col items-center justify-center shadow-xs shadow-emerald-200 transition-transform active:scale-95"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span className="text-2xs">{price}k</span>
                        </button>
                      </td>
                    );
                  }

                  // 2. Ô GIỮ CHỖ REDIS LOCK (AMBER KÈM COUNTDOWN)
                  if (specialStatus?.status === 'HOLDING') {
                    return (
                      <td key={col.id} className="p-1.5">
                        <div className="w-full h-11 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 flex flex-col items-center justify-center cursor-not-allowed">
                          <Lock className="w-3 h-3 text-amber-600 mb-0.5" />
                          <span className="text-3xs font-mono font-bold text-amber-700">
                            {specialStatus.timer}
                          </span>
                        </div>
                      </td>
                    );
                  }

                  // 3. Ô KÍN LỊCH (LOCKED / BLUE-GRAY)
                  if (specialStatus?.status === 'BOOKED') {
                    return (
                      <td key={col.id} className="p-1.5">
                        <div className="w-full h-11 rounded-xl bg-sky-50/80 border border-sky-100 flex items-center justify-center text-slate-400 cursor-not-allowed">
                          <Lock className="w-3.5 h-3.5 text-sky-400/80" />
                        </div>
                      </td>
                    );
                  }

                  // 4. Ô CÒN TRỐNG (CLICKABLE)
                  return (
                    <td key={col.id} className="p-1.5">
                      <button
                        onClick={() =>
                          toggleSlot({
                            courtId: court.id,
                            courtName: court.name,
                            surfaceName: court.surface,
                            timeSlot: col.id,
                            price: price * 1000,
                            isPeakHour: col.isPeak,
                          })
                        }
                        className={`w-full h-11 rounded-xl border border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/30 transition-all font-semibold flex items-center justify-center ${
                          col.isPeak ? 'text-amber-700 font-bold' : 'text-slate-700'
                        }`}
                      >
                        {price}k
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
