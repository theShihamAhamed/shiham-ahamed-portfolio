import { NextResponse } from "next/server";

import type {
  PublicApiErrorResponse,
  PublicApiSuccessResponse,
} from "@/types/public-api";

type SuccessOptions = {
  message?: string;
  meta?: Record<string, unknown>;
};

export const publicApiSuccess = <T>(
  data: T,
  options: SuccessOptions = {},
) => {
  const body: PublicApiSuccessResponse<T> = {
    success: true,
    data,
    ...(options.message ? { message: options.message } : {}),
    ...(options.meta ? { meta: options.meta } : {}),
  };

  return NextResponse.json(body);
};

export const publicApiError = (
  status: number,
  code: string,
  message: string,
) => {
  const body: PublicApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
    },
  };

  return NextResponse.json(body, { status });
};

export const publicApiTemporaryError = (
  context: string,
  error: unknown,
) => {
  console.error(context, error);

  return publicApiError(
    500,
    "PUBLIC_DATA_UNAVAILABLE",
    "Public data is temporarily unavailable.",
  );
};
