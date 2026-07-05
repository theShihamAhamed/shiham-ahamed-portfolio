import type { ReactNode } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--admin-bg)] text-[var(--admin-text)]">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(92,126,143,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(92,126,143,0.055)_1px,transparent_1px)] bg-[size:48px_48px] opacity-60" />
      <div className="relative flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 px-5 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
