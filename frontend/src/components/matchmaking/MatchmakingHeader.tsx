import React from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  User,
  Command,
} from 'lucide-react';

interface MatchmakingHeaderProps {
  onSwitchToBooking?: () => void;
}

export const MatchmakingHeader: React.FC<MatchmakingHeaderProps> = ({ onSwitchToBooking }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-8 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2 cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-200">
              <span className="text-sm font-bold">S</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Sport<span className="text-emerald-600">Sync</span>
            </span>
          </div>

          {/* Navigation Links - theo mockup Màn hình 2 */}
          <nav className="hidden md:flex items-center space-x-1">
            <button className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-900 bg-slate-100 transition-colors">
              Tìm Kèo Giao Lưu
            </button>
            <button
              onClick={onSwitchToBooking}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              Đặt Sân
            </button>
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors">
              Giải Đấu
            </button>
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors">
              Cộng Đồng
            </button>
          </nav>
        </div>

        {/* Right: Search + Notification + Profile */}
        <div className="flex items-center space-x-3">
          {/* Search Bar với phím tắt ⌘K */}
          <div className="relative hidden sm:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm sân, kèo..."
              className="pl-9 pr-16 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white w-52 lg:w-64 transition-colors"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center space-x-0.5 text-slate-300">
              <Command className="w-3 h-3" />
              <span className="text-xs font-medium">K</span>
            </div>
          </div>

          {/* Notification Bell */}
          <button className="relative w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              3
            </span>
          </button>

          {/* Profile Avatar + Name */}
          <button className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-emerald-700" />
            </div>
            <span className="text-sm font-medium text-slate-700 hidden lg:inline">Minh Nhật</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
