import { env } from "../../config/env";
import { AppError } from "../../utils/app-error";
import { comparePassword, hashToken } from "../../utils/hash";
import {
  createAccessToken,
  createRefreshToken,
  getTokenExpiration,
  verifyRefreshToken,
} from "../../utils/jwt";
import { AdminSession } from "./admin-session.model";
import type { AdminInfo, AuthResult, LoginInput, RequestContext } from "./auth.types";

const adminInfo = (): AdminInfo => ({
  email: env.ADMIN_EMAIL,
  role: "admin",
});

const invalidCredentialsError = () => {
  return new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
};

const createRefreshSession = async (
  refreshToken: string,
  context: RequestContext,
): Promise<Date> => {
  const expiresAt = getTokenExpiration(refreshToken);

  await AdminSession.create({
    refreshTokenHash: hashToken(refreshToken),
    expiresAt,
    userAgent: context.userAgent,
    ip: context.ip,
  });

  return expiresAt;
};

export const loginAdmin = async (
  input: LoginInput,
  context: RequestContext,
): Promise<AuthResult> => {
  if (input.email.toLowerCase() !== env.ADMIN_EMAIL.toLowerCase()) {
    throw invalidCredentialsError();
  }

  const passwordMatches = await comparePassword(
    input.password,
    env.ADMIN_PASSWORD_HASH,
  );

  if (!passwordMatches) {
    throw invalidCredentialsError();
  }

  const accessToken = createAccessToken();
  const refreshToken = createRefreshToken();
  const refreshTokenExpiresAt = await createRefreshSession(refreshToken, context);

  return {
    accessToken,
    refreshToken,
    refreshTokenExpiresAt,
    admin: adminInfo(),
  };
};

export const refreshAdminSession = async (
  refreshToken: string,
  context: RequestContext,
): Promise<AuthResult> => {
  verifyRefreshToken(refreshToken);

  const existingSession = await AdminSession.findOne({
    refreshTokenHash: hashToken(refreshToken),
  });

  if (
    !existingSession ||
    existingSession.revokedAt ||
    existingSession.expiresAt.getTime() <= Date.now()
  ) {
    throw new AppError("Refresh session is invalid or expired", 401, "INVALID_REFRESH_SESSION");
  }

  existingSession.revokedAt = new Date();
  await existingSession.save();

  const nextRefreshToken = createRefreshToken();
  const refreshTokenExpiresAt = await createRefreshSession(nextRefreshToken, context);

  return {
    accessToken: createAccessToken(),
    refreshToken: nextRefreshToken,
    refreshTokenExpiresAt,
    admin: adminInfo(),
  };
};

export const revokeAdminSession = async (refreshToken: string): Promise<void> => {
  const refreshTokenHash = hashToken(refreshToken);

  await AdminSession.findOneAndUpdate(
    {
      refreshTokenHash,
      revokedAt: { $exists: false },
    },
    {
      $set: {
        revokedAt: new Date(),
      },
    },
  );
};

export const getAdminInfo = (): AdminInfo => adminInfo();
