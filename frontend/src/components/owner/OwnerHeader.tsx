import React from 'react';
import {
  Bell,
  User,
  Plus,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { useOwnerStore } from '../../store/useOwnerStore';

interface OwnerHeaderProps {
  onOpenCounterBooking: () => void;
}

export const OwnerHeader: React.FC<OwnerHeaderProps> = ({
  onOpenCounterBooking,
}) => {
  const { activeShift, setActiveShift } = useOwnerStore();

  const handleToggleShift = () => {
    if (activeShift === 'evening') {
      setActiveShift('afternoon');
    } else {
      setActiveShift('evening');
    }
  };

  return (
    <div className="bg-white border-b border-slate-200">
      {/* 1. TOP BREADCRUMB & UTILITY BAR */}
      <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between">
        {/* Breadcrumb khớp 100% Mockup */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="font-semibold text-slate-800">
            Cụm Sân Cầu Lông Cầu Giấy
          </span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-500">Trung tâm điều hành</span>
        </div>

        {/* Right utility controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenCounterBooking}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Đặt sân tại quầy</span>
          </button>

          <button className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
          </button>

          <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs ring-2 ring-emerald-600/30">
            <User className="w-4 h-4 text-emerald-100" />
          </div>
        </div>
      </div>

      {/* 2. SUBHEADER WITH VENUE TITLE, STATUS & ACTION BUTTONS */}
      <div className="px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Cụm Sân Cầu Lông Cầu Giấy
            </h1>
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-sky-50 text-emerald-700 text-xs font-semibold border border-sky-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Đang mở cửa (06:00 - 23:00)</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Bảng điều phối ca vận hành & giám sát thanh toán tự động
          </p>
        </div>

        {/* Action Buttons Right Side khớp 100% Mockup */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Nút Chọn Ngày */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50/80 text-blue-700 hover:bg-blue-100/80 rounded-xl text-xs font-semibold border border-blue-100 transition-colors cursor-pointer">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Hôm nay, 24/10/2025</span>
          </div>

          {/* Nút Đổi Ca Trực */}
          <button
            onClick={handleToggleShift}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            title="Chuyển ca trực"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Đổi ca trực</span>
          </button>

          {/* Nút Primary: + Đặt sân tại quầy */}
          <button
            onClick={onOpenCounterBooking}
            className="flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Đặt sân tại quầy</span>
          </button>
        </div>
      </div>
    </div>
  );
};
