import React, { useEffect } from 'react';
import { OwnerSidebar } from './OwnerSidebar';
import { OwnerHeader } from './OwnerHeader';
import { OwnerKpiCards } from './OwnerKpiCards';
import { OwnerScheduleMatrix } from './OwnerScheduleMatrix';
import { OwnerRecentTransactions } from './OwnerRecentTransactions';
import { WalkInBookingModal } from './WalkInBookingModal';
import { useOwnerStore } from '../../store/useOwnerStore';
import { ownerApi } from '../../api/ownerApi';

export const CourtSyncOS: React.FC = () => {
  const {
    venueSlug,
    selectedDate,
    setDashboardData,
    setIsCounterModalOpen,
  } = useOwnerStore();

  useEffect(() => {
    // Fetch live data from backend if running
    const fetchData = async () => {
      const data = await ownerApi.getDashboard(venueSlug, selectedDate);
      if (data) {
        setDashboardData(data);
      }
    };
    fetchData();
  }, [venueSlug, selectedDate, setDashboardData]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row antialiased">
      {/* 1. LEFT NAVIGATION SIDEBAR KHỚP 100% MOCKUP 3 */}
      <OwnerSidebar currentTab="schedule" />

      {/* 2. MAIN OPERATING CENTER AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header & Venue Overview */}
        <OwnerHeader onOpenCounterBooking={() => setIsCounterModalOpen(true)} />

        {/* Content Container */}
        <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Section 1: 3 Thẻ KPI Realtime */}
          <OwnerKpiCards />

          {/* Section 2: Ma Trận Lịch Sân Trực Tiếp */}
          <OwnerScheduleMatrix />

          {/* Section 3: Bảng Giao Dịch Gần Nhất */}
          <OwnerRecentTransactions />
        </main>
      </div>

      {/* 3. MODAL ĐẶT SÂN TẠI QUẦY (THU TIỀN MẶT) */}
      <WalkInBookingModal />
    </div>
  );
};
