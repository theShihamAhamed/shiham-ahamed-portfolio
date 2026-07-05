"use client";

import { Loader2, ShieldCheck } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/lib/auth/use-auth";

function AuthStatusScreen({ message }: { message: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--admin-bg)] px-5 text-[var(--admin-text)]">
      <div className="flex flex-col items-center text-center">
        <span className="grid size-12 place-items-center rounded-lg border border-[rgba(92,126,143,0.24)] bg-[var(--admin-accent-soft)] text-[var(--admin-accent)]">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </span>
        <div className="mt-5 flex items-center gap-2 text-sm text-[var(--admin-muted)]">
          <Loader2 className="size-4 animate-spin text-[var(--admin-accent)]" aria-hidden="true" />
          {message}
        </div>
      </div>
    </main>
  );
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router, status]);

  if (status === "loading") {
    return <AuthStatusScreen message="Checking your admin session..." />;
  }

  if (status === "unauthenticated") {
    return <AuthStatusScreen message="Redirecting to login..." />;
  }

  return children;
}
