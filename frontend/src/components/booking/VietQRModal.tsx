import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  Copy,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { getSocket } from '../../api/socket';
import { apiClient } from '../../api/client';

interface VietQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingCode: string;
  amount: number;
  courtName: string;
  timeSlot: string;
  isMatchmakingEnabled: boolean;
}

export const VietQRModal: React.FC<VietQRModalProps> = ({
  isOpen,
  onClose,
  bookingCode,
  amount,
  courtName,
  timeSlot,
  isMatchmakingEnabled,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [countdown, setCountdown] = useState(596); // ~09:56

  const bankAccountNo = '0912345678';
  const bankAccountName = 'SPORTSYNC HANOI';
  const cleanContent = bookingCode.replace('#', '');
  const qrUrl = `https://img.vietqr.io/image/970422-${bankAccountNo}-compact2.png?amount=${amount}&addInfo=${cleanContent}&accountName=${encodeURIComponent(
    bankAccountName
  )}`;

  // Đếm ngược TTL
  useEffect(() => {
    if (!isOpen || isPaid) return;
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, isPaid]);

  // Lắng nghe sự kiện thanh toán thời gian thực qua WebSocket Socket.io
  useEffect(() => {
    if (!isOpen) return;

    const socket = getSocket();
    const handleConfirmed = (data: { bookingCode: string }) => {
      if (data.bookingCode === bookingCode) {
        setIsPaid(true);
      }
    };

    socket.on('booking_confirmed', handleConfirmed);
    return () => {
      socket.off('booking_confirmed', handleConfirmed);
    };
  }, [isOpen, bookingCode]);

  if (!isOpen) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Nút Demo Webhook: Giả lập Ngân hàng gửi webhook xác nhận tiền về ngay lập tức
  const handleSimulatePayment = async () => {
    try {
      setIsSimulating(true);
      await apiClient.post('/bookings/webhook/vietqr', {
        bookingCode,
        amount,
        referenceCode: `MB${Date.now()}`,
      });
      setIsPaid(true);
    } catch (err) {
      console.error('Lỗi giả lập webhook:', err);
      // Fallback UI nếu backend offline
      setIsPaid(true);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 p-1.5 rounded-full transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {isPaid ? (
          /* TRẠNG THÁI 1: THANH TOÁN THÀNH CÔNG */
          <div className="p-8 text-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Thanh toán thành công</span>
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                Xác Nhận Đặt Sân Thành Công!
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Lịch đã được đồng bộ trực tiếp lên hệ thống CourtSync OS.
              </p>
            </div>

            {/* Chi tiết đặt sân */}
            <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-200/80 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Mã đơn đặt sân:</span>
                <span className="font-mono font-bold text-slate-900">{bookingCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sân con & Khung giờ:</span>
                <span className="font-semibold text-slate-900">{courtName} • {timeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Số tiền đã trả:</span>
                <span className="font-bold text-emerald-600">{amount.toLocaleString('vi-VN')}đ</span>
              </div>
              {isMatchmakingEnabled && (
                <div className="pt-2 border-t border-slate-200/80 text-emerald-700 flex items-center space-x-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Đã tự động mở phòng tại Sảnh Tìm Kèo</span>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm shadow-emerald-200 transition-all flex items-center justify-center space-x-2"
            >
              <span>Hoàn tất & Quay về lịch</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* TRẠNG THÁI 2: MÀN HÌNH QUÉT MÃ QR VIETQR */
          <div>
            {/* Header Dialog */}
            <div className="bg-slate-900 text-white p-5 text-center relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                <span className="font-bold tracking-wider text-emerald-400">VIETQR AUTOMATION</span>
                <div className="flex items-center space-x-1 text-amber-400 font-mono font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTimer(countdown)}</span>
                </div>
              </div>

              <div className="text-2xl font-black text-white">
                {amount.toLocaleString('vi-VN')}đ
              </div>
              <p className="text-2xs text-slate-400 mt-0.5">
                Mở ứng dụng ngân hàng bất kỳ để quét mã thanh toán tức thì
              </p>
            </div>

            {/* QR Image Box */}
            <div className="p-6 flex flex-col items-center">
              <div className="p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-md">
                <img
                  src={qrUrl}
                  alt="VietQR Payment Code"
                  className="w-48 h-48 object-contain rounded-lg"
                />
              </div>

              {/* Thông tin chuyển khoản sao chép */}
              <div className="w-full mt-4 space-y-2 text-xs">
                {/* Số tài khoản */}
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-2xs text-slate-400 block">Số tài khoản (MB Bank)</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">{bankAccountNo}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(bankAccountNo, 'acc')}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-medium text-2xs flex items-center space-x-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedField === 'acc' ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                </div>

                {/* Nội dung chuyển khoản */}
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-2xs text-slate-400 block">Nội dung chuyển khoản (bắt buộc)</span>
                    <span className="font-mono font-bold text-emerald-700 text-sm">{cleanContent}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(cleanContent, 'content')}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-medium text-2xs flex items-center space-x-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedField === 'content' ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                </div>
              </div>

              {/* Live Detection Pulse */}
              <div className="flex items-center space-x-2 text-2xs text-slate-500 mt-4 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Hệ thống tự động xác nhận ngay khi bạn chuyển tiền xong</span>
              </div>

              {/* Nút Demo Webhook: Test nhanh thanh toán thực tế */}
              <button
                onClick={handleSimulatePayment}
                disabled={isSimulating}
                className="w-full py-2.5 mt-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{isSimulating ? 'Đang gửi Webhook...' : '⚡ Giả Lập Quét QR Thành Công (Test Webhook)'}</span>
              </button>

              <div className="flex items-center space-x-1 text-3xs text-slate-400 mt-3">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Bảo mật giao dịch theo tiêu chuẩn ngân hàng Napas 247</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
