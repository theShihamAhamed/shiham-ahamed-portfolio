"use client";

import { createContext } from "react";

import type { LoginInput } from "@/schemas/auth.schema";
import type { AdminInfo, AuthStatus } from "@/types/auth";

export type AuthContextValue = {
  status: AuthStatus;
  admin: AdminInfo | null;
  accessToken: string | null;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
