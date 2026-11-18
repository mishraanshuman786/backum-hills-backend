
import type { Response } from "express";

interface ApiResponseOptions<T> {
  message?: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  options: ApiResponseOptions<T>
) => {
  return res.status(statusCode).json({
    success: true,
    message: options.message || "Success",
    data: options.data ?? null,
    ...(options.meta && { meta: options.meta }),
  });
};
