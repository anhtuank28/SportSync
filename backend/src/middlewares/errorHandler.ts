import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { sendResponse } from '../utils/response';

export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // 1. AppError (Custom operational error)
  if (err instanceof AppError) {
    return sendResponse(res, {
      success: false,
      statusCode: err.statusCode,
      message: err.message,
    });
  }

  // 2. Prisma Known Request Error (Unique constraint P2002, etc.)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[])?.join(', ') || 'trường dữ liệu';
      return sendResponse(res, {
        success: false,
        statusCode: 409,
        message: `Xung đột dữ liệu: ${target} đã tồn tại trong hệ thống (Trùng lịch / Trùng mã).`,
      });
    }

    if (err.code === 'P2025') {
      return sendResponse(res, {
        success: false,
        statusCode: 404,
        message: 'Bản ghi không tồn tại trong cơ sở dữ liệu.',
      });
    }
  }

  // 3. Unhandled Server Error
  console.error('💥 Unhandled Exception:', err);
  return sendResponse(res, {
    success: false,
    statusCode: 500,
    message: process.env.NODE_ENV === 'production'
      ? 'Đã xảy ra lỗi máy chủ nội bộ. Vui lòng thử lại sau.'
      : err.message,
  });
};
