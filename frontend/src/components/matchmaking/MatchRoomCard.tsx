import React, { useState } from 'react';
import { MapPin, Clock } from 'lucide-react';
import { MatchRoomCard as MatchRoomCardType } from '../../store/useMatchmakingStore';

interface MatchRoomCardProps {
  room: MatchRoomCardType;
  onJoin: (roomId: string) => void;
}

export const MatchRoomCard: React.FC<MatchRoomCardProps> = ({ room, onJoin }) => {
  const [isJoining, setIsJoining] = useState(false);

  const isAvailable = room.status === 'OPEN' && room.availableSlots > 0;

  // Tách sportTag để lấy emoji và text
  const sportTagParts = room.sportTag.split(' ');
  const emoji = sportTagParts[0] || '🏅';
  const tagText = sportTagParts.slice(1).join(' ') || room.sportTag;

  // Format giá tiền
  const formattedPrice = new Intl.NumberFormat('vi-VN').format(room.pricePerPerson);

  // Tách timeSlot thành thời gian và ngày
  const timeSlotParts = room.timeSlot.split(', ');
  const timeRange = timeSlotParts[0] || room.timeSlot;
  const dateDisplay = timeSlotParts[1] || room.dateLabel;

  const handleJoinClick = async () => {
    setIsJoining(true);
    try {
      await onJoin(room.id);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Top Row: Sport Tag + Price */}
        <div className="flex items-start justify-between mb-3">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 gap-1.5">
            <span>{emoji}</span>
            <span>{tagText}</span>
          </span>
          <div className="text-right flex-shrink-0">
            <span className="text-base font-bold text-slate-900">{formattedPrice}đ</span>
            <span className="text-xs text-slate-400 font-medium"> / người</span>
          </div>
        </div>

        {/* Venue Name */}
        <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug group-hover:text-emerald-700 transition-colors">
          {room.title}
        </h3>

        {/* Time & Location */}
        <div className="flex items-center text-sm text-slate-500 mb-1 gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>
            {timeRange}, {dateDisplay}
          </span>
        </div>
        <div className="flex items-center text-sm text-slate-500 gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>{room.address}</span>
        </div>
      </div>

      {/* Card Footer: Status + Action Button */}
      <div className="px-5 pb-5 pt-2">
        <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
          {/* Slots Status */}
          <div className="flex items-center gap-2 text-sm">
            {isAvailable ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-600 font-medium">
                  Còn {room.availableSlots} chỗ ({room.currentPlayers}/{room.maxPlayers})
                </span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span className="text-slate-500 font-medium">
                  Đã đủ {room.currentPlayers}/{room.maxPlayers}
                  {room.waitlistCount > 0 && (
                    <> • Chờ ({room.waitlistCount})</>
                  )}
                  {room.waitlistCount === 0 && ' • Đầy'}
                </span>
              </>
            )}
          </div>

          {/* Action Button */}
          {isAvailable ? (
            <button
              onClick={handleJoinClick}
              disabled={isJoining}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-wait"
            >
              {isJoining ? 'Đang...' : 'Tham gia'}
            </button>
          ) : (
            <button
              onClick={handleJoinClick}
              disabled={isJoining}
              className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold rounded-xl border border-slate-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-wait"
            >
              {isJoining ? 'Đang...' : 'Hàng chờ'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
