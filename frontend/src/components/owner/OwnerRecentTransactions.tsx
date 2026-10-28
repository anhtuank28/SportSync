import React from 'react';
import { useOwnerStore } from '../../store/useOwnerStore';

export const OwnerRecentTransactions: React.FC = () => {
  const { recentTransactions, transactionTab, setTransactionTab } = useOwnerStore();

  const filteredTransactions = recentTransactions.filter((tx) => {
    if (transactionTab === 'vietqr') return tx.paymentMethod === 'VIETQR_AUTO';
    if (transactionTab === 'cash') return tx.paymentMethod === 'CASH_AT_COUNTER';
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
      {/* 1. Header with Filter Tabs khớp 100% Mockup */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-3">
        <div className="flex items-center space-x-2.5">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Giao dịch đặt sân gần nhất
          </h2>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
            {recentTransactions.length} đơn
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600">
          <button
            onClick={() => setTransactionTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              transactionTab === 'all'
                ? 'bg-white text-slate-900 font-bold shadow-2xs'
                : 'hover:text-slate-900'
            }`}
          >
            Tất cả ({recentTransactions.length})
          </button>
          <button
            onClick={() => setTransactionTab('vietqr')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              transactionTab === 'vietqr'
                ? 'bg-white text-slate-900 font-bold shadow-2xs'
                : 'hover:text-slate-900'
            }`}
          >
            VietQR tự động
          </button>
          <button
            onClick={() => setTransactionTab('cash')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              transactionTab === 'cash'
                ? 'bg-white text-slate-900 font-bold shadow-2xs'
                : 'hover:text-slate-900'
            }`}
          >
            Tiền mặt tại quầy
          </button>
        </div>
      </div>

      {/* 2. Table khớp 100% Mockup */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
              <th className="py-3 px-4 rounded-l-xl uppercase tracking-wider text-[11px]">
                MÃ ĐƠN
              </th>
              <th className="py-3 px-4 uppercase tracking-wider text-[11px]">
                KHÁCH HÀNG
              </th>
              <th className="py-3 px-4 uppercase tracking-wider text-[11px]">
                SÂN & KHUNG GIỜ
              </th>
              <th className="py-3 px-4 uppercase tracking-wider text-[11px]">
                SỐ TIỀN
              </th>
              <th className="py-3 px-4 rounded-r-xl uppercase tracking-wider text-[11px]">
                TRẠNG THÁI
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredTransactions.map((tx) => {
              const isGreen =
                tx.statusCode === 'CONFIRMED_VIETQR' ||
                tx.statusCode === 'CASH_PAID';

              return (
                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Mã đơn */}
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {tx.bookingCode}
                  </td>

                  {/* Khách hàng (che SĐT) */}
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-900">
                      {tx.customerName}
                    </span>
                    {tx.customerPhoneMasked && (
                      <span className="text-slate-400 ml-1.5 font-normal">
                        ({tx.customerPhoneMasked})
                      </span>
                    )}
                  </td>

                  {/* Sân & Khung giờ */}
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {tx.courtAndTime}
                  </td>

                  {/* Số tiền */}
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {tx.amount.toLocaleString('vi-VN')}đ
                  </td>

                  {/* Trạng thái */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isGreen ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                        }`}
                      />
                      <span
                        className={`font-semibold ${
                          isGreen ? 'text-slate-800' : 'text-amber-700'
                        }`}
                      >
                        {tx.statusText}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-8 text-xs text-slate-400">
            Không có giao dịch nào phù hợp với bộ lọc đã chọn.
          </div>
        )}
      </div>
    </div>
  );
};
