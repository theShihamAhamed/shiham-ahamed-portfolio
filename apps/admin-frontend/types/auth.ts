export type AdminInfo = {
  email: string;
  role: "admin";
};

export type AuthSession = {
  accessToken: string;
  admin: AdminInfo;
};

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";
