import type { Response } from "express";

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
};

export type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

type SuccessOptions = {
  message?: string;
  meta?: Record<string, unknown>;
};

export const buildSuccessResponse = <T>(
  data: T,
  options: SuccessOptions = {},
): ApiSuccessResponse<T> => ({
  success: true,
  data,
  ...(options.message ? { message: options.message } : {}),
  ...(options.meta ? { meta: options.meta } : {}),
});

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200,
  options: SuccessOptions = {},
): Response<ApiSuccessResponse<T>> => {
  return res.status(statusCode).json(buildSuccessResponse(data, options));
};
