import { Response } from 'express';

export interface ApiResponseOptions<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T | null;
  meta?: Record<string, unknown> | null;
}

export function sendResponse<T>(
  res: Response,
  { success, statusCode, message, data = null, meta = null }: ApiResponseOptions<T>
) {
  return res.status(statusCode).json({
    success,
    statusCode,
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  });
}
