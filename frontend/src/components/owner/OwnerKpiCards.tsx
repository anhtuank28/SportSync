import React, { useEffect } from 'react';
import { useOwnerStore } from '../../store/useOwnerStore';

export const OwnerKpiCards: React.FC = () => {
  const { kpis, decrementTtl } = useOwnerStore();

  // Đếm ngược TTL thời gian thực mỗi 1 giây
  useEffect(() => {
    const timer = setInterval(() => {
      decrementTtl();
    }, 1000);
    return () => clearInterval(timer);
  }, [decrementTtl]);

  const ttlListString = kpis.redisLocksDetail
    .map((item) => item.ttlFormatted)
    .join(', ');

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* THẺ KPI 1: DOANH THU HÔM NAY */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:shadow-xs transition-shadow">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          DOANH THU HÔM NAY
        </span>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {kpis.todayRevenue.toLocaleString('vi-VN')}đ
        </div>
        <p className="text-xs text-slate-500 mt-3 flex items-center space-x-1.5">
          <span className="font-bold text-emerald-600">
            +{kpis.revenueComparisonPercent}%
          </span>
          <span>
            so với hôm qua ({kpis.yesterdayRevenue.toLocaleString('vi-VN')}đ)
          </span>
        </p>
      </div>

      {/* THẺ KPI 2: TỶ LỆ LẤP ĐẦY */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:shadow-xs transition-shadow">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          TỶ LỆ LẤP ĐẦY
        </span>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {kpis.occupancyRate}%
        </div>
        <p className="text-xs text-slate-500 mt-3">
          <span className="font-semibold text-slate-700">
            {kpis.completedSlots}/{kpis.totalSlots}
          </span>{' '}
          khung giờ đã hoàn tất giữ chỗ
        </p>
      </div>

      {/* THẺ KPI 3: ĐANG GIỮ CHỖ (REDIS LOCK) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs hover:shadow-xs transition-shadow">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          ĐANG GIỮ CHỖ (REDIS LOCK)
        </span>
        <div className="text-2xl sm:text-3xl font-extrabold text-amber-700 tracking-tight">
          {kpis.redisLocksCount} slot
        </div>
        <p className="text-xs text-slate-600 mt-3 flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
          <span className="truncate">
            Chờ quét VietQR (TTL: {ttlListString || '08:12, 04:35'})
          </span>
        </p>
      </div>
    </div>
  );
};
