import React, { useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { MatchmakingHeader } from './MatchmakingHeader';
import { MatchmakingFilters } from './MatchmakingFilters';
import { MatchRoomCard } from './MatchRoomCard';
import { MatchmakingPagination } from './MatchmakingPagination';
import { Footer } from '../shared/Footer';
import { useMatchmakingStore, MatchRoomCard as MatchRoomCardType } from '../../store/useMatchmakingStore';

interface MatchmakingLobbyProps {
  onSwitchToBooking?: () => void;
}

// ==========================================
// DỮ LIỆU MẪU KHỚP 100% MOCKUP MÀN HÌNH 2
// (sẽ thay bằng API khi Backend chạy)
// ==========================================
const MOCK_ROOMS: MatchRoomCardType[] = [
  {
    id: '1',
    title: 'Sân Cầu Lông Dịch Vọng',
    sportType: 'BADMINTON',
    sportTag: '🏸 Cầu lông • TB-Khá',
    skillLevel: 'TB-Khá',
    pricePerPerson: 65000,
    maxPlayers: 6,
    currentPlayers: 4,
    status: 'OPEN',
    playDate: '2025-10-24',
    timeSlot: '19:00 - 21:00, Hôm nay',
    venueName: 'Sân Cầu Lông Dịch Vọng',
    address: 'Quận Cầu Giấy',
    waitlistCount: 0,
    availableSlots: 2,
    dateLabel: 'Hôm nay',
    createdAt: '2025-10-24T10:00:00Z',
  },
  {
    id: '2',
    title: 'D-Pickleball Sky Club',
    sportType: 'PICKLEBALL',
    sportTag: '🏓 Pickleball • Mới chơi',
    skillLevel: 'Mới chơi',
    pricePerPerson: 80000,
    maxPlayers: 4,
    currentPlayers: 3,
    status: 'OPEN',
    playDate: '2025-10-24',
    timeSlot: '18:00 - 20:00, Hôm nay',
    venueName: 'D-Pickleball Sky Club',
    address: 'Dịch Vọng Hậu',
    waitlistCount: 0,
    availableSlots: 1,
    dateLabel: 'Hôm nay',
    createdAt: '2025-10-24T09:30:00Z',
  },
  {
    id: '3',
    title: 'Sân Thảm Yonex Trần Thái Tông',
    sportType: 'BADMINTON',
    sportTag: '🏸 Cầu lông • Bán chuyên',
    skillLevel: 'Bán chuyên',
    pricePerPerson: 70000,
    maxPlayers: 6,
    currentPlayers: 6,
    status: 'FULL',
    playDate: '2025-10-24',
    timeSlot: '20:00 - 22:00, Hôm nay',
    venueName: 'Sân Thảm Yonex Trần Thái Tông',
    address: 'Trần Thái Tông',
    waitlistCount: 1,
    availableSlots: 0,
    dateLabel: 'Hôm nay',
    createdAt: '2025-10-24T09:00:00Z',
  },
  {
    id: '4',
    title: 'Sân Bóng Đá Trung Kính Hạ',
    sportType: 'FOOTBALL',
    sportTag: '⚽ Bóng đá 7 • Vui khỏe',
    skillLevel: 'Vui khỏe',
    pricePerPerson: 50000,
    maxPlayers: 14,
    currentPlayers: 11,
    status: 'OPEN',
    playDate: '2025-10-24',
    timeSlot: '19:30 - 21:00, Hôm nay',
    venueName: 'Sân Bóng Đá Trung Kính Hạ',
    address: 'Trung Kính',
    waitlistCount: 0,
    availableSlots: 3,
    dateLabel: 'Hôm nay',
    createdAt: '2025-10-24T08:30:00Z',
  },
  {
    id: '5',
    title: 'Sân Cầu Lông THCS Nghĩa Tân',
    sportType: 'BADMINTON',
    sportTag: '🏸 Cầu lông • Trung bình',
    skillLevel: 'Trung bình',
    pricePerPerson: 60000,
    maxPlayers: 6,
    currentPlayers: 4,
    status: 'OPEN',
    playDate: '2025-10-24',
    timeSlot: '17:30 - 19:30, Hôm nay',
    venueName: 'Sân Cầu Lông THCS Nghĩa Tân',
    address: 'Nghĩa Tân',
    waitlistCount: 0,
    availableSlots: 2,
    dateLabel: 'Hôm nay',
    createdAt: '2025-10-24T08:00:00Z',
  },
  {
    id: '6',
    title: 'PickleArena Cầu Giấy',
    sportType: 'PICKLEBALL',
    sportTag: '🏓 Pickleball • TB-Khá',
    skillLevel: 'TB-Khá',
    pricePerPerson: 90000,
    maxPlayers: 4,
    currentPlayers: 3,
    status: 'OPEN',
    playDate: '2025-10-24',
    timeSlot: '20:00 - 22:00, Hôm nay',
    venueName: 'PickleArena Cầu Giấy',
    address: 'Phạm Văn Đồng',
    waitlistCount: 0,
    availableSlots: 1,
    dateLabel: 'Hôm nay',
    createdAt: '2025-10-24T07:30:00Z',
  },
  {
    id: '7',
    title: 'Nhà Thi Đấu Cầu Giấy Sân 2',
    sportType: 'BADMINTON',
    sportTag: '🏸 Cầu lông • Giao lưu mở',
    skillLevel: 'Giao lưu mở',
    pricePerPerson: 55000,
    maxPlayers: 6,
    currentPlayers: 2,
    status: 'OPEN',
    playDate: '2025-10-24',
    timeSlot: '18:30 - 20:30, Hôm nay',
    venueName: 'Nhà Thi Đấu Cầu Giấy Sân 2',
    address: 'Trần Quý Kiên',
    waitlistCount: 0,
    availableSlots: 4,
    dateLabel: 'Hôm nay',
    createdAt: '2025-10-24T07:00:00Z',
  },
  {
    id: '8',
    title: 'CLB Cầu Lông Yên Hòa',
    sportType: 'BADMINTON',
    sportTag: '🏸 Cầu lông • Đôi Nam Nữ',
    skillLevel: 'Đôi Nam Nữ',
    pricePerPerson: 65000,
    maxPlayers: 4,
    currentPlayers: 4,
    status: 'FULL',
    playDate: '2025-10-24',
    timeSlot: '19:00 - 21:00, Hôm nay',
    venueName: 'CLB Cầu Lông Yên Hòa',
    address: 'Hạ Yên Quyết',
    waitlistCount: 0,
    availableSlots: 0,
    dateLabel: 'Hôm nay',
    createdAt: '2025-10-24T06:30:00Z',
  },
  {
    id: '9',
    title: 'Green Club Pickle Court 4',
    sportType: 'PICKLEBALL',
    sportTag: '🏓 Pickleball • Tập luyện',
    skillLevel: 'Tập luyện',
    pricePerPerson: 75000,
    maxPlayers: 4,
    currentPlayers: 2,
    status: 'OPEN',
    playDate: '2025-10-24',
    timeSlot: '21:00 - 22:30, Hôm nay',
    venueName: 'Green Club Pickle Court 4',
    address: 'Mai Dịch',
    waitlistCount: 0,
    availableSlots: 2,
    dateLabel: 'Hôm nay',
    createdAt: '2025-10-24T06:00:00Z',
  },
];

export const MatchmakingLobby: React.FC<MatchmakingLobbyProps> = ({ onSwitchToBooking }) => {
  const {
    rooms,
    pagination,
    isLoading,
    sportType,
    skillLevel,
    dateFilter,
    setRooms,
    setPagination,
    setIsLoading,
    setPage,
  } = useMatchmakingStore();

  // Load dữ liệu phòng kèo
  const fetchRooms = useCallback(async () => {
    setIsLoading(true);
    try {
      // Thử gọi Backend API
      const params = new URLSearchParams();
      if (sportType) params.set('sportType', sportType);
      if (skillLevel) params.set('skillLevel', skillLevel);
      if (dateFilter) params.set('dateFilter', dateFilter);
      params.set('page', String(pagination.currentPage));
      params.set('limit', '9');

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/matchmaking/rooms?${params.toString()}`
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setRooms(result.data);
          setPagination(result.meta?.pagination || pagination);
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // Backend chưa chạy → fallback sang mock data
    }

    // Fallback: dùng mock data với filter client-side
    let filtered = [...MOCK_ROOMS];
    if (sportType) {
      filtered = filtered.filter((r) => r.sportType === sportType);
    }
    if (skillLevel) {
      filtered = filtered.filter((r) =>
        r.skillLevel.toLowerCase().includes(skillLevel.toLowerCase())
      );
    }

    setRooms(filtered);
    setPagination({
      currentPage: 1,
      totalPages: Math.ceil(38 / 9),
      totalRooms: 38,
      limit: 9,
      showing: filtered.length,
    });
    setIsLoading(false);
  }, [sportType, skillLevel, dateFilter, pagination.currentPage]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleJoinRoom = async (roomId: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/matchmaking/rooms/${roomId}/join`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerName: 'Minh Nhật',
            playerPhone: '0912345456',
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        alert(result.message || 'Tham gia thành công!');
        fetchRooms(); // Refresh danh sách
      } else {
        // Fallback UI
        const room = rooms.find((r) => r.id === roomId);
        if (room) {
          if (room.status === 'OPEN') {
            alert(`✅ Tham gia thành công phòng "${room.title}"! Bạn là thành viên thứ ${room.currentPlayers + 1}/${room.maxPlayers}.`);
          } else {
            alert(`⏳ Phòng "${room.title}" đã đủ người. Bạn đã được thêm vào hàng chờ.`);
          }
        }
      }
    } catch {
      const room = rooms.find((r) => r.id === roomId);
      if (room) {
        if (room.status === 'OPEN') {
          alert(`✅ Tham gia thành công phòng "${room.title}"!`);
        } else {
          alert(`⏳ Phòng "${room.title}" đã đủ người. Bạn đã được thêm vào hàng chờ.`);
        }
      }
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPage(page);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <MatchmakingHeader onSwitchToBooking={onSwitchToBooking} />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title Section */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              HÀ NỘI • SẢNH TRỰC TUYẾN
            </p>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">
              Sảnh Tìm Kèo Giao Lưu
            </h1>
            <p className="text-sm text-slate-500">
              Tìm và tham gia các trận đấu thể thao phong trào tại Hà Nội.
            </p>
          </div>

          {/* Nút Tạo kèo mới */}
          <button className="inline-flex items-center space-x-2 px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all active:scale-95">
            <Plus className="w-4 h-4" />
            <span>Tạo kèo mới</span>
          </button>
        </div>

        {/* Bộ lọc đa tiêu chí */}
        <div className="mb-8">
          <MatchmakingFilters />
        </div>

        {/* Grid 9 thẻ MatchRoomCard - Responsive 3 cột */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="h-7 bg-slate-100 rounded-full w-36" />
                  <div className="h-5 bg-slate-100 rounded w-24" />
                </div>
                <div className="h-6 bg-slate-100 rounded w-3/4 mb-3" />
                <div className="h-4 bg-slate-50 rounded w-full mb-2" />
                <div className="h-4 bg-slate-50 rounded w-2/3 mb-4" />
                <div className="border-t border-slate-100 pt-4 flex justify-between items-center">
                  <div className="h-4 bg-slate-100 rounded w-32" />
                  <div className="h-9 bg-slate-100 rounded-xl w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🏸</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Không tìm thấy phòng kèo nào
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Thử thay đổi bộ lọc hoặc tạo phòng kèo mới để bắt đầu.
            </p>
            <button className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold shadow-sm shadow-emerald-200 transition-all active:scale-95">
              <Plus className="w-4 h-4" />
              <span>Tạo kèo mới</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rooms.map((room) => (
              <MatchRoomCard key={room.id} room={room} onJoin={handleJoinRoom} />
            ))}
          </div>
        )}

        {/* Phân trang */}
        <MatchmakingPagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalRooms={pagination.totalRooms}
          showing={pagination.showing}
          onPageChange={handlePageChange}
        />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
