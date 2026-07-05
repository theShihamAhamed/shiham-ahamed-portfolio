import { requestApi } from "@/lib/api/client";
import type { LoginInput } from "@/schemas/auth.schema";
import type { AdminInfo, AuthSession } from "@/types/auth";

export const loginAdmin = async (input: LoginInput): Promise<AuthSession> => {
  const response = await requestApi<AuthSession>("/api/auth/login", {
    method: "POST",
    body: input,
    auth: false,
    credentials: "include",
    retryOnUnauthorized: false,
  });

  return response.data;
};

export const logoutAdmin = async (): Promise<void> => {
  await requestApi<{ loggedOut: boolean }>("/api/auth/logout", {
    method: "POST",
    body: {},
    auth: false,
    credentials: "include",
    retryOnUnauthorized: false,
  });
};

export const getCurrentAdmin = async (): Promise<AdminInfo> => {
  const response = await requestApi<AdminInfo>("/api/auth/me");

  return response.data;
};
