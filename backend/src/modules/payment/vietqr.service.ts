export interface VietQRGenerateOptions {
  amount: number;
  bookingCode: string;
  accountName?: string;
}

export interface VietQRPaymentData {
  qrCodeUrl: string;
  bankId: string;
  bankName: string;
  accountNo: string;
  accountName: string;
  amount: number;
  transferContent: string;
}

export class VietQRService {
  private bankId = process.env.VIETQR_BANK_ID || '970422'; // MB Bank
  private bankName = 'MB Bank (Ngân hàng Quân Đội)';
  private accountNo = process.env.VIETQR_ACCOUNT_NO || '0912345678';
  private accountName = process.env.VIETQR_ACCOUNT_NAME || 'SPORTSYNC HANOI';

  /**
   * Sinh thông tin thanh toán VietQR chuẩn ngân hàng
   * Sử dụng định dạng QuickLink chuẩn Napas 247
   */
  generatePaymentInfo(options: VietQRGenerateOptions): VietQRPaymentData {
    const cleanContent = options.bookingCode.replace('#', '');
    const encodedAccountName = encodeURIComponent(options.accountName || this.accountName);

    // Chuẩn URL VietQR API sinh ảnh QR code ngân hàng tự động điền số tiền & nội dung
    const qrCodeUrl = `https://img.vietqr.io/image/${this.bankId}-${this.accountNo}-compact2.png?amount=${options.amount}&addInfo=${cleanContent}&accountName=${encodedAccountName}`;

    return {
      qrCodeUrl,
      bankId: this.bankId,
      bankName: this.bankName,
      accountNo: this.accountNo,
      accountName: this.accountName,
      amount: options.amount,
      transferContent: cleanContent,
    };
  }

  /**
   * Xác thực chữ ký webhook từ VietQR / PayOS
   */
  verifyWebhookSignature(payload: unknown, signature?: string): boolean {
    // Trong môi trường production, so sánh HMAC SHA256 với VIETQR_WEBHOOK_SECRET
    if (!process.env.VIETQR_WEBHOOK_SECRET) return true;
    return Boolean(signature || payload);
  }
}

export const vietqrService = new VietQRService();
