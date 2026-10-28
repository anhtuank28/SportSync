import React from 'react';
import {
  Zap,
  MapPin,
  ChevronDown,
  Search,
  CheckCircle2,
  Calendar,
  Compass,
  Trophy,
  BookmarkCheck,
  User,
} from 'lucide-react';
import { useBookingStore } from '../../store/useBookingStore';

interface HeaderProps {
  onSwitchVenue?: (slug: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSwitchVenue }) => {
  const { selectedVenueSlug, setSelectedVenueSlug } = useBookingStore();

  const handleVenueClick = (slug: string) => {
    setSelectedVenueSlug(slug);
    if (onSwitchVenue) onSwitchVenue(slug);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      {/* 1. TOP BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo & Facility Selector */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-200">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Sport<span className="text-emerald-600">Sync</span>
            </span>
          </div>

          <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>District 1 • SkyCourts Center</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1">
          <button className="px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center space-x-1.5 shadow-sm">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Court Schedule</span>
          </button>
          <button className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center space-x-1.5">
            <Compass className="w-4 h-4 text-slate-400" />
            <span>Browse Venues</span>
          </button>
          <button className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center space-x-1.5">
            <Trophy className="w-4 h-4 text-slate-400" />
            <span>Tournaments</span>
          </button>
          <button className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center space-x-1.5">
            <BookmarkCheck className="w-4 h-4 text-slate-400" />
            <span>My Bookings</span>
          </button>
        </nav>

        {/* Right: Instant Book & Profile Avatar */}
        <div className="flex items-center space-x-3">
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm px-4 py-2 rounded-xl flex items-center space-x-1.5 shadow-sm shadow-emerald-200 transition-all active:scale-95">
            <Zap className="w-4 h-4 fill-current" />
            <span>Instant Book</span>
          </button>

          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 cursor-pointer hover:bg-slate-200 transition-colors">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 2. SECONDARY QUICK SWITCHER BAR */}
      <div className="bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          {/* Left: District Switcher & Venue Name */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3">
            <button className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-800 shadow-2xs hover:border-slate-300">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Quận Cầu Giấy</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-900 text-sm sm:text-base">
                Cụm Sân Cầu Lông Cầu Giấy
              </span>
              <button className="text-xs text-slate-500 hover:text-emerald-600 font-medium transition-colors">
                (Đổi cơ sở ▾)
              </button>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>BWF Standard</span>
              </span>
            </div>
          </div>

          {/* Right: Search Box & Nearby Pills */}
          <div className="flex items-center flex-wrap gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:border-emerald-500 w-28 sm:w-36"
              />
            </div>

            <div className="hidden sm:flex items-center space-x-1.5">
              <button
                onClick={() => handleVenueClick('san-cau-long-dich-vong')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  selectedVenueSlug === 'san-cau-long-dich-vong'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                Dịch Vọng (800m)
              </button>
              <button
                onClick={() => handleVenueClick('clb-cau-long-yen-hoa')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  selectedVenueSlug === 'clb-cau-long-yen-hoa'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                Yên Hòa (1.2km)
              </button>
              <button
                onClick={() => handleVenueClick('clb-cau-long-nghia-tan')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  selectedVenueSlug === 'clb-cau-long-nghia-tan'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                Nghĩa Tân (1.8km)
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
