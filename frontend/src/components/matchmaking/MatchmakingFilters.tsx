import React from 'react';
import { MapPin, ChevronDown, Zap } from 'lucide-react';
import { useMatchmakingStore } from '../../store/useMatchmakingStore';

export const MatchmakingFilters: React.FC = () => {
  const {
    districtSlug,
    sportType,
    skillLevel,
    dateFilter,
    setDistrictSlug,
    setSportType,
    setSkillLevel,
    setDateFilter,
  } = useMatchmakingStore();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      {/* Left: Dropdown Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Dropdown Quận */}
        <div className="relative">
          <select
            value={districtSlug}
            onChange={(e) => setDistrictSlug(e.target.value)}
            className="appearance-none inline-flex items-center pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-sm hover:border-slate-300 hover:shadow transition-all cursor-pointer focus:outline-none focus:border-emerald-500"
          >
            <option value="">Quận Cầu Giấy</option>
            <option value="quan-cau-giay">Quận Cầu Giấy</option>
            <option value="quan-ba-dinh">Quận Ba Đình</option>
            <option value="quan-dong-da">Quận Đống Đa</option>
            <option value="quan-nam-tu-liem">Quận Nam Từ Liêm</option>
          </select>
          <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Dropdown Môn thể thao */}
        <div className="relative">
          <select
            value={sportType}
            onChange={(e) => setSportType(e.target.value)}
            className="appearance-none inline-flex items-center px-4 py-2.5 pr-8 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-sm hover:border-slate-300 hover:shadow transition-all cursor-pointer focus:outline-none focus:border-emerald-500"
          >
            <option value="">🏸 Cầu lông</option>
            <option value="BADMINTON">🏸 Cầu lông</option>
            <option value="PICKLEBALL">🏓 Pickleball</option>
            <option value="FOOTBALL">⚽ Bóng đá 7</option>
            <option value="TENNIS">🎾 Tennis</option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Dropdown Trình độ */}
        <div className="relative">
          <select
            value={skillLevel}
            onChange={(e) => setSkillLevel(e.target.value)}
            className="appearance-none inline-flex items-center px-4 py-2.5 pr-8 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-sm hover:border-slate-300 hover:shadow transition-all cursor-pointer focus:outline-none focus:border-emerald-500"
          >
            <option value="">
              <Zap className="w-4 h-4 inline" />
              Trình độ: Tất cả
            </option>
            <option value="TB-Khá">TB-Khá</option>
            <option value="Mới chơi">Mới chơi</option>
            <option value="Bán chuyên">Bán chuyên</option>
            <option value="Trung bình">Trung bình</option>
            <option value="Vui khỏe">Vui khỏe</option>
            <option value="Giao lưu mở">Giao lưu mở</option>
            <option value="Đôi Nam Nữ">Đôi Nam Nữ</option>
            <option value="Tập luyện">Tập luyện</option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Right: Date Filter Pills (Hôm nay | Ngày mai | Cuối tuần) */}
      <div className="flex items-center">
        <div className="inline-flex bg-slate-100 rounded-xl p-1">
          <button
            onClick={() => setDateFilter('today')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              dateFilter === 'today'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Hôm nay
          </button>
          <button
            onClick={() => setDateFilter('tomorrow')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              dateFilter === 'tomorrow'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Ngày mai
          </button>
          <button
            onClick={() => setDateFilter('weekend')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              dateFilter === 'weekend'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Cuối tuần
          </button>
        </div>
      </div>
    </div>
  );
};
