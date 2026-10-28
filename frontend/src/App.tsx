import { useState } from 'react';
import { Calendar, Users, LayoutDashboard } from 'lucide-react';
import { Header } from './components/shared/Header';
import { CourtScheduleMatrix } from './components/schedule/CourtScheduleMatrix';
import { AmenitiesSection } from './components/booking/AmenitiesSection';
import { NearbyVenuesMap } from './components/booking/NearbyVenuesMap';
import { BookingSidebar } from './components/booking/BookingSidebar';
import { Footer } from './components/shared/Footer';
import { MatchmakingLobby } from './components/matchmaking/MatchmakingLobby';
import { CourtSyncOS } from './components/owner/CourtSyncOS';

export default function App() {
  const [activeTab, setActiveTab] = useState<'screen1' | 'screen2' | 'screen3'>('screen1');

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 antialiased flex flex-col justify-between">
      {/* Top Development Switcher Bar */}
      <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-xs sticky top-0 z-50 shadow-md">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-emerald-400">SportSync (CourtSync OS)</span>
          <span className="text-slate-400 hidden sm:inline">• Hà Nội Multi-Venue Network</span>
        </div>

        <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setActiveTab('screen1')}
            className={`px-3 py-1 rounded transition-all font-medium flex items-center gap-1.5 ${
              activeTab === 'screen1'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Màn 1: Đặt Sân Player</span>
          </button>

          <button
            onClick={() => setActiveTab('screen2')}
            className={`px-3 py-1 rounded transition-all font-medium flex items-center gap-1.5 ${
              activeTab === 'screen2'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Màn 2: Sảnh Tìm Kèo</span>
          </button>

          <button
            onClick={() => setActiveTab('screen3')}
            className={`px-3 py-1 rounded transition-all font-medium flex items-center gap-1.5 ${
              activeTab === 'screen3'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Màn 3: CourtSync OS</span>
          </button>
        </div>
      </div>

      {/* Main Content View Switcher */}
      {activeTab === 'screen1' && (
        <div className="flex-1 flex flex-col">
          {/* Màn hình 1: Header */}
          <Header />

          {/* Màn hình 1: Grid Layout khớp 100% Mockup 1 */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* CỘT TRÁI (Lưới Lịch, Tiện ích, Bản đồ): 8 Cột (~67%) */}
              <div className="lg:col-span-8 space-y-4">
                <CourtScheduleMatrix />
                <AmenitiesSection />
                <NearbyVenuesMap />
              </div>

              {/* CỘT PHẢI (Sidebar Thanh toán VietQR & Ghép Kèo): 4 Cột (~33%) */}
              <div className="lg:col-span-4">
                <BookingSidebar />
              </div>
            </div>
          </main>

          {/* Màn hình 1: Footer */}
          <Footer />
        </div>
      )}

      {/* Màn hình 2: Sảnh Tìm Kèo Giao Lưu - ĐÃ TRIỂN KHAI ĐẦY ĐỦ */}
      {activeTab === 'screen2' && (
        <MatchmakingLobby onSwitchToBooking={() => setActiveTab('screen1')} />
      )}

      {/* Màn hình 3: CourtSync OS - Trung Tâm Điều Hành Chủ Sân (ĐÃ TRIỂN KHAI ĐẦY ĐỦ) */}
      {activeTab === 'screen3' && <CourtSyncOS />}
    </div>
  );
}
