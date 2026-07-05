"use client";

import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { ApiError, configureApiClient, refreshAccessToken } from "@/lib/api/client";
import { loginAdmin, logoutAdmin } from "@/lib/api/auth";
import { AuthContext } from "@/lib/auth/auth-context";
import type { LoginInput } from "@/schemas/auth.schema";
import type { AdminInfo, AuthSession, AuthStatus } from "@/types/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const accessTokenRef = useRef<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const setSession = useCallback((session: AuthSession) => {
    accessTokenRef.current = session.accessToken;
    setAccessToken(session.accessToken);
    setAdmin(session.admin);
    setStatus("authenticated");
  }, []);

  const clearSession = useCallback(() => {
    accessTokenRef.current = null;
    setAccessToken(null);
    setAdmin(null);
    setStatus("unauthenticated");
  }, []);

  const onSessionExpired = useCallback(() => {
    clearSession();
    queryClient.clear();

    if (pathname !== "/admin/login") {
      toast.error("Session expired. Please sign in again.");
      router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [clearSession, pathname, queryClient, router]);

  useEffect(() => {
    configureApiClient({
      getAccessToken: () => accessTokenRef.current,
      setSession,
      clearSession,
      onSessionExpired,
    });
  }, [clearSession, onSessionExpired, setSession]);

  const refreshSession = useCallback(async () => {
    try {
      const session = await refreshAccessToken();
      setSession(session);
      return true;
    } catch {
      clearSession();
      return false;
    }
  }, [clearSession, setSession]);

  useEffect(() => {
    const refreshTimer = window.setTimeout(() => {
      void refreshSession();
    }, 0);

    return () => window.clearTimeout(refreshTimer);
  }, [refreshSession]);

  const login = useCallback(
    async (input: LoginInput) => {
      const session = await loginAdmin(input);
      setSession(session);
      toast.success("Logged in successfully.");
    },
    [setSession],
  );

  const logout = useCallback(async () => {
    try {
      await logoutAdmin();
      toast.success("Logged out successfully.");
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Logout failed, but the local session was cleared.";
      toast.error(message);
    } finally {
      clearSession();
      queryClient.clear();
      router.replace("/admin/login");
    }
  }, [clearSession, queryClient, router]);

  const value = useMemo(
    () => ({
      status,
      admin,
      accessToken,
      login,
      logout,
      refreshSession,
    }),
    [accessToken, admin, login, logout, refreshSession, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
