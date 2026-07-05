export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  message?: string;
  meta?: unknown;
};

export type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
