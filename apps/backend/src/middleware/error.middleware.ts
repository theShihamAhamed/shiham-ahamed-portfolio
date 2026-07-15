import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";
import { ZodError } from "zod";

import { isProduction } from "../config/env";
import { AppError } from "../utils/app-error";
import type { ApiErrorResponse } from "../utils/response";

type NormalizedError = {
  statusCode: number;
  code: string;
  message: string;
  details?: unknown;
  isOperational: boolean;
};

const formatZodError = (error: ZodError) => {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
    code: issue.code,
  }));
};

const normalizeError = (error: unknown): NormalizedError => {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
      details: error.details,
      isOperational: error.isOperational,
    };
  }

  if (error instanceof ZodError) {
    return {
      statusCode: 422,
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      details: formatZodError(error),
      isOperational: true,
    };
  }

  if (error instanceof SyntaxError && "body" in error) {
    return {
      statusCode: 400,
      code: "INVALID_JSON",
      message: "Request body contains invalid JSON",
      isOperational: true,
    };
  }

  if (error instanceof Error) {
    return {
      statusCode: 500,
      code: "INTERNAL_SERVER_ERROR",
      message: isProduction ? "Internal server error" : error.message,
      details: isProduction ? undefined : error.stack,
      isOperational: false,
    };
  }

  return {
    statusCode: 500,
    code: "INTERNAL_SERVER_ERROR",
    message: "Internal server error",
    details: isProduction ? undefined : error,
    isOperational: false,
  };
};

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(
    new AppError(
      `Route ${req.method} ${req.originalUrl} was not found`,
      404,
      "ROUTE_NOT_FOUND",
    ),
  );
};

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req: Request,
  res: Response<ApiErrorResponse>,
  next: NextFunction,
) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  const normalizedError = normalizeError(error);

  if (!normalizedError.isOperational) {
    console.error(error);
  }

  const responseBody: ApiErrorResponse = {
    success: false,
    error: {
      code: normalizedError.code,
      message: normalizedError.message,
      ...(normalizedError.details !== undefined
        ? { details: normalizedError.details }
        : {}),
    },
  };

  res.status(normalizedError.statusCode).json(responseBody);
};
