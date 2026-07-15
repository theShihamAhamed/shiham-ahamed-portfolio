import type { RequestHandler } from "express";

import { AppError } from "../utils/app-error";
import { verifyAccessToken } from "../utils/jwt";

const getBearerToken = (authorizationHeader?: string): string => {
  if (!authorizationHeader) {
    throw new AppError("Access token is required", 401, "ACCESS_TOKEN_REQUIRED");
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new AppError("Authorization header must use Bearer token", 401, "INVALID_AUTH_HEADER");
  }

  return token;
};

export const requireAuth: RequestHandler = (req, res, next) => {
  try {
    const token = getBearerToken(req.get("authorization"));
    const payload = verifyAccessToken(token);

    res.locals.admin = {
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};
