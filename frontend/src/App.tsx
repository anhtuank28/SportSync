import { useState } from 'react';
import { Calendar, Users, LayoutDashboard, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'screen1' | 'screen2' | 'screen3'>('screen1');

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Development Switcher Bar */}
      <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-xs sticky top-0 z-50 shadow-md">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-emerald-400">SportSync (CourtSync OS)</span>
          <span className="text-slate-400">• Hà Nội Multi-Venue Platform (Sprint 1)</span>
        </div>
        <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setActiveTab('screen1')}
            className={`px-3 py-1 rounded transition-all font-medium flex items-center gap-1.5 ${
              activeTab === 'screen1' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Màn 1: Đặt Sân Player
          </button>
          <button
            onClick={() => setActiveTab('screen2')}
            className={`px-3 py-1 rounded transition-all font-medium flex items-center gap-1.5 ${
              activeTab === 'screen2' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Màn 2: Sảnh Tìm Kèo
          </button>
          <button
            onClick={() => setActiveTab('screen3')}
            className={`px-3 py-1 rounded transition-all font-medium flex items-center gap-1.5 ${
              activeTab === 'screen3' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Màn 3: CourtSync OS (Chủ Sân)
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-full mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Hạ Tầng Dự Án Đã Sẵn Sàng (Tuần 1 - Sprint 1)
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto mb-6 text-sm">
            Monorepo TypeScript đã được khởi tạo thành công với kiến trúc 3-Layer backend, PostgreSQL 16 + Prisma ORM, Redis 7 Distributed Lock, và Tailwind CSS Design Tokens khớp 100% với 3 màn hình mockups.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-3xl mx-auto">
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
              <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">Database & ORM</div>
              <div className="text-sm font-bold text-slate-800">Prisma Schema</div>
              <div className="text-xs text-slate-500 mt-1">Đánh Composite Unique Index chống trùng lịch vật lý</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
              <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">Hạ Tầng Docker</div>
              <div className="text-sm font-bold text-slate-800">PostgreSQL 16 & Redis 7</div>
              <div className="text-xs text-slate-500 mt-1">Đóng gói sẵn sàng qua docker-compose.yml</div>
            </div>
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
              <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">Dữ Liệu Mẫu</div>
              <div className="text-sm font-bold text-slate-800">15 Cụm Sân Hà Nội</div>
              <div className="text-xs text-slate-500 mt-1">Cầu Giấy, Dịch Vọng, Yên Hòa, Nghĩa Tân...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
