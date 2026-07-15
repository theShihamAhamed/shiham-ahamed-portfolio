export type AdminRole = "admin";

export type AdminInfo = {
  email: string;
  role: AdminRole;
};

export type AuthTokenPayload = {
  sub: "single-admin";
  email: string;
  role: AdminRole;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RequestContext = {
  userAgent?: string;
  ip?: string;
};

export type AuthResult = {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
  admin: AdminInfo;
};
