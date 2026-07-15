"use client";

import { CircleUserRound, LogOut, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/use-auth";

export function Topbar() {
  const { admin, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
  };

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--admin-border)] bg-[var(--admin-surface)] backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-4 px-5 sm:px-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-[var(--admin-muted)]">
            <ShieldCheck className="size-3.5 text-[var(--admin-accent)]" aria-hidden="true" />
            Admin workspace
          </div>
          <p className="mt-1 text-sm font-medium text-[var(--admin-text)]">
            Backend connected shell
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="green" className="hidden sm:inline-flex">
            Auth ready
          </Badge>
          <div className="hidden items-center gap-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-3 py-2 text-sm text-[var(--admin-text)] sm:flex">
            <CircleUserRound className="size-4 text-[var(--admin-muted)]" aria-hidden="true" />
            {admin?.email ?? "Admin"}
          </div>
          <Button
            variant="secondary"
            size="sm"
            disabled={isLoggingOut}
            onClick={handleLogout}
          >
            <LogOut className="size-4" aria-hidden="true" />
            {isLoggingOut ? "Logging out" : "Logout"}
          </Button>
        </div>
      </div>
    </header>
  );
}
