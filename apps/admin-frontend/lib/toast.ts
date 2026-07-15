"use client";

import { toast } from "sonner";

import { ApiError } from "@/lib/api/client";

export const getToastErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
};

export const showSuccessToast = (message: string) => {
  toast.success(message);
};

export const showErrorToast = (error: unknown, fallback = "Request failed.") => {
  const message = getToastErrorMessage(error) || fallback;
  toast.error(message);
};

export const showWarningToast = (message: string) => {
  toast.warning(message);
};
