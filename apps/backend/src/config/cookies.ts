import type { CookieOptions } from "express";

import { env } from "./env";

export const refreshCookieName = "refreshToken";

export type RefreshCookiePolicy = {
  sameSite: "lax" | "strict" | "none";
  secure: boolean;
  domain?: string;
};

export const createRefreshCookieOptions = (
  policy: RefreshCookiePolicy,
  expiresAt?: Date,
): CookieOptions => ({
  httpOnly: true,
  sameSite: policy.sameSite,
  secure: policy.secure,
  path: "/api/auth",
  ...(policy.domain ? { domain: policy.domain } : {}),
  ...(expiresAt
    ? {
        expires: expiresAt,
        maxAge: Math.max(0, expiresAt.getTime() - Date.now()),
      }
    : {}),
});

export const getRefreshCookieOptions = (expiresAt?: Date): CookieOptions =>
  createRefreshCookieOptions(
    {
      sameSite: env.AUTH_COOKIE_SAME_SITE,
      secure: env.AUTH_COOKIE_SECURE,
      domain: env.AUTH_COOKIE_DOMAIN,
    },
    expiresAt,
  );
