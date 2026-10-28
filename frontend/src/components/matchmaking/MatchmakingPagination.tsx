import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MatchmakingPaginationProps {
  currentPage: number;
  totalPages: number;
  totalRooms: number;
  showing: number;
  onPageChange: (page: number) => void;
}

export const MatchmakingPagination: React.FC<MatchmakingPaginationProps> = ({
  currentPage,
  totalPages,
  totalRooms,
  showing,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  // Tạo mảng số trang cần hiển thị
  const getPageNumbers = () => {
    const pages: (number | 'dots')[] = [];
    const maxVisible = 3;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 2) {
        pages.push(1, 2, 3);
        if (totalPages > 3) pages.push('dots', totalPages);
      } else if (currentPage >= totalPages - 1) {
        pages.push(1, 'dots', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, 'dots', currentPage - 1, currentPage, currentPage + 1);
        if (currentPage + 1 < totalPages) pages.push('dots', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pt-8 pb-4">
      {/* Left: Info text (khớp mockup: "Hiển thị 9 trên 38 phòng mở tại Hà Nội") */}
      <p className="text-sm text-slate-500">
        Hiển thị {showing} trên {totalRooms} phòng mở tại Hà Nội
      </p>

      {/* Right: Page Buttons */}
      <div className="flex items-center gap-1">
        {/* Prev button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Numbers */}
        {getPageNumbers().map((page, idx) =>
          page === 'dots' ? (
            <span key={`dots-${idx}`} className="w-10 h-10 flex items-center justify-center text-slate-400">
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                currentPage === page
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {page}
            </button>
          )
        )}

        {/* Next button (khớp mockup: "Tiếp →") */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-4 h-10 rounded-xl border border-slate-200 flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <span>Tiếp</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
