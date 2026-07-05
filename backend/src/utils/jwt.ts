import { randomUUID } from "node:crypto";

import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";

import { env } from "../config/env";
import { AppError } from "./app-error";
import type { AdminRole, AuthTokenPayload } from "../modules/auth/auth.types";

const adminPayload = (): AuthTokenPayload => ({
  sub: "single-admin",
  email: env.ADMIN_EMAIL,
  role: "admin",
});

const signToken = (
  payload: AuthTokenPayload,
  secret: string,
  expiresIn: string,
): string => {
  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions["expiresIn"],
    jwtid: randomUUID(),
  };

  return jwt.sign(payload, secret, options);
};

const parsePayload = (payload: string | JwtPayload): AuthTokenPayload => {
  if (
    typeof payload === "string" ||
    payload.sub !== "single-admin" ||
    typeof payload.email !== "string" ||
    payload.role !== "admin"
  ) {
    throw new AppError("Invalid token payload", 401, "INVALID_TOKEN");
  }

  return {
    sub: "single-admin",
    email: payload.email,
    role: payload.role as AdminRole,
  };
};

export const createAccessToken = (): string => {
  return signToken(adminPayload(), env.JWT_ACCESS_SECRET, env.ACCESS_TOKEN_EXPIRES_IN);
};

export const createRefreshToken = (): string => {
  return signToken(
    adminPayload(),
    env.JWT_REFRESH_SECRET,
    env.REFRESH_TOKEN_EXPIRES_IN,
  );
};

export const verifyAccessToken = (token: string): AuthTokenPayload => {
  try {
    return parsePayload(jwt.verify(token, env.JWT_ACCESS_SECRET));
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Access token is invalid or expired", 401, "INVALID_TOKEN");
  }
};

export const verifyRefreshToken = (token: string): AuthTokenPayload => {
  try {
    return parsePayload(jwt.verify(token, env.JWT_REFRESH_SECRET));
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Refresh token is invalid or expired", 401, "INVALID_REFRESH_TOKEN");
  }
};

export const getTokenExpiration = (token: string): Date => {
  const decoded = jwt.decode(token);

  if (!decoded || typeof decoded === "string" || typeof decoded.exp !== "number") {
    throw new AppError("Token expiration is missing", 500, "TOKEN_EXPIRATION_MISSING");
  }

  return new Date(decoded.exp * 1000);
};
