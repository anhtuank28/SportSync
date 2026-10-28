import React from 'react';
import {
  CalendarDays,
  FileText,
  BadgeDollarSign,
  Settings,
  Disc,
} from 'lucide-react';

interface OwnerSidebarProps {
  currentTab?: string;
  onTabChange?: (tab: string) => void;
}

export const OwnerSidebar: React.FC<OwnerSidebarProps> = ({
  currentTab = 'schedule',
  onTabChange,
}) => {
  const menuItems = [
    { id: 'schedule', label: 'Lịch vận hành', icon: CalendarDays },
    { id: 'orders', label: 'Đơn đặt sân', icon: FileText },
    { id: 'pricing', label: 'Bảng giá giờ vàng', icon: BadgeDollarSign },
    { id: 'settings', label: 'Cài đặt sân', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col justify-between p-4 shrink-0">
      <div>
        {/* Brand CourtSync OS Logo khớp 100% Mockup */}
        <div className="flex items-center space-x-2.5 px-2 py-3 mb-6 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-xs">
            <Disc className="w-4 h-4 text-emerald-400 rotate-45" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">
              CourtSync <span className="text-emerald-600">OS</span>
            </h1>
          </div>
        </div>

        {/* Section Heading */}
        <div className="px-3 mb-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            QUẢN LÝ SÂN
          </span>
        </div>

        {/* Nav Menu */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange?.(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-slate-900' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Live Venue Badge Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-2xs">
        <div className="flex items-center space-x-1.5 mb-1">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">
            ĐANG HOẠT ĐỘNG
          </span>
        </div>
        <p className="text-xs font-bold text-slate-800 truncate">
          Cụm Sân Cầu Lông Cầu Giấy
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5">8 sân • Trực tiếp</p>
      </div>
    </aside>
  );
};
