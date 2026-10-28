import React from 'react';
import { useOwnerStore, MatrixSlotItem } from '../../store/useOwnerStore';

export const OwnerScheduleMatrix: React.FC = () => {
  const { courts, timeSlots, openCounterModalWithSlot } = useOwnerStore();

  const handleSlotClick = (slot: MatrixSlotItem, courtName: string) => {
    if (slot.status === 'EMPTY') {
      openCounterModalWithSlot(slot.courtId, courtName, slot.timeSlot);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
      {/* 1. Header with Live Status & Legend khớp 100% Mockup */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-3">
        <div className="flex items-center space-x-2.5">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Lịch sân trực tiếp hôm nay
          </h2>
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Thời gian thực</span>
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center flex-wrap gap-4 text-xs text-slate-600">
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded bg-white border border-slate-300 shadow-2xs" />
            <span>Trống (Bấm để khóa)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded bg-sky-100 border border-sky-200" />
            <span>Đã thanh toán</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded bg-amber-100 border border-amber-300" />
            <span>Giữ chỗ Redis</span>
          </div>
        </div>
      </div>

      {/* 2. Live Court Schedule Matrix Table */}
      <div className="overflow-x-auto mt-5">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-50/80 rounded-xl">
              <th className="py-3 px-4 text-xs font-bold text-slate-700 uppercase tracking-wider rounded-l-xl w-36">
                SÂN ĐẤU
              </th>
              {timeSlots.map((ts, index) => (
                <th
                  key={ts}
                  className={`py-3 px-3 text-xs font-bold text-slate-700 text-center tracking-tight min-w-[120px] ${
                    index === timeSlots.length - 1 ? 'rounded-r-xl' : ''
                  }`}
                >
                  {ts}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {courts.map((court) => (
              <tr key={court.id} className="hover:bg-slate-50/40 transition-colors">
                {/* Court Name and Surface Type */}
                <td className="py-4 px-4 align-middle">
                  <div className="font-bold text-xs text-slate-900">
                    {court.name}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {court.surfaceName}
                  </div>
                </td>

                {/* Slots per column */}
                {timeSlots.map((ts) => {
                  const slot: MatrixSlotItem = court.slots[ts] || {
                    courtId: court.id,
                    courtName: court.name,
                    timeSlot: ts,
                    status: 'EMPTY',
                    price: 120000,
                    isPeakHour: true,
                  };

                  return (
                    <td key={ts} className="p-1.5 align-middle">
                      {slot.status === 'CONFIRMED' && (
                        <div className="bg-sky-50 border border-sky-100 rounded-xl p-2.5 text-center min-h-[64px] flex flex-col justify-center transition-all hover:shadow-2xs">
                          <div className="text-xs font-bold text-slate-800 truncate">
                            {slot.customerName || 'Khách đặt'}
                          </div>
                          <div className="text-[11px] font-semibold text-sky-700 mt-0.5">
                            {slot.paymentLabel || 'Đã TT • VietQR'}
                          </div>
                        </div>
                      )}

                      {slot.status === 'HOLDING' && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-center min-h-[64px] flex flex-col justify-center transition-all animate-pulse">
                          <div className="text-xs font-bold text-amber-900 truncate">
                            Đang giữ chỗ
                          </div>
                          <div className="text-[11px] font-semibold text-amber-700 mt-0.5">
                            {slot.paymentLabel || 'Chờ QR'}
                          </div>
                        </div>
                      )}

                      {slot.status === 'EMPTY' && (
                        <button
                          onClick={() => handleSlotClick(slot, court.name)}
                          className="w-full bg-white hover:bg-emerald-50/40 border border-slate-200 hover:border-emerald-400 rounded-xl p-2.5 text-center min-h-[64px] flex flex-col justify-center items-center transition-all group cursor-pointer"
                          title="Bấm để đặt sân tại quầy hoặc khóa sân"
                        >
                          <div className="text-xs font-semibold text-slate-600 group-hover:text-emerald-700 transition-colors">
                            Trống
                          </div>
                          <div className="text-[11px] text-slate-400 group-hover:text-emerald-600 transition-colors">
                            {slot.price.toLocaleString('vi-VN')}đ
                          </div>
                        </button>
                      )}
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
