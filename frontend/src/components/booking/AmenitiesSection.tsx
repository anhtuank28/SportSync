import React from 'react';
import { Lightbulb, Droplets, Car } from 'lucide-react';

export const AmenitiesSection: React.FC = () => {
  const amenities = [
    {
      title: 'Đèn LED Chống Lóa',
      desc: 'Chuẩn thi đấu BWF, 500 Lux đồng đều',
      icon: Lightbulb,
    },
    {
      title: 'Phòng Tắm Nóng Lạnh',
      desc: 'Miễn phí cho mọi lượt đặt sân',
      icon: Droplets,
    },
    {
      title: 'Bãi Đỗ Xe Rộng Rãi',
      desc: 'Sức chứa ô tô và xe máy an ninh 24/7',
      icon: Car,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 my-4">
      {amenities.map((item, idx) => {
        const IconComponent = item.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200/90 p-4 flex items-start space-x-3 shadow-2xs hover:border-slate-300 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-snug">
                {item.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
