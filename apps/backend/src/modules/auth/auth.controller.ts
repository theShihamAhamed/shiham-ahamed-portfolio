import type { Request, Response } from "express";

import {
  getRefreshCookieOptions,
  refreshCookieName,
} from "../../config/cookies";
import { AppError } from "../../utils/app-error";
import { asyncHandler } from "../../utils/async-handler";
import { sendSuccess } from "../../utils/response";
import {
  getAdminInfo,
  loginAdmin,
  refreshAdminSession,
  revokeAdminSession,
} from "./auth.service";
import type { AuthResult, RequestContext } from "./auth.types";

const requestContext = (req: Request): RequestContext => ({
  userAgent: req.get("user-agent"),
  ip: req.ip,
});

const getRefreshTokenFromRequest = (req: Request): string => {
  const cookieToken = req.cookies?.[refreshCookieName];

  if (typeof cookieToken === "string" && cookieToken.length > 0) {
    return cookieToken;
  }

  throw new AppError("Refresh session cookie is required", 401, "REFRESH_TOKEN_REQUIRED");
};

const setRefreshCookie = (res: Response, result: AuthResult): void => {
  res.cookie(
    refreshCookieName,
    result.refreshToken,
    getRefreshCookieOptions(result.refreshTokenExpiresAt),
  );
};

const clearRefreshCookie = (res: Response): void => {
  res.clearCookie(refreshCookieName, getRefreshCookieOptions());
};

export const login = asyncHandler(async (req, res) => {
  const result = await loginAdmin(req.body, requestContext(req));

  setRefreshCookie(res, result);

  return sendSuccess(
    res,
    {
      accessToken: result.accessToken,
      admin: result.admin,
    },
    200,
    { message: "Logged in successfully" },
  );
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = getRefreshTokenFromRequest(req);
  const result = await refreshAdminSession(refreshToken, requestContext(req));

  setRefreshCookie(res, result);

  return sendSuccess(
    res,
    {
      accessToken: result.accessToken,
      admin: result.admin,
    },
    200,
    { message: "Session refreshed successfully" },
  );
});

export const logout = asyncHandler(async (req, res) => {
  const cookieToken = req.cookies?.[refreshCookieName];
  const refreshToken = typeof cookieToken === "string" && cookieToken.length > 0
    ? cookieToken
    : undefined;

  if (refreshToken) {
    await revokeAdminSession(refreshToken);
  }

  clearRefreshCookie(res);

  return sendSuccess(res, { loggedOut: true }, 200, {
    message: "Logged out successfully",
  });
});

export const me = asyncHandler(async (_req, res) => {
  return sendSuccess(res, getAdminInfo());
});
