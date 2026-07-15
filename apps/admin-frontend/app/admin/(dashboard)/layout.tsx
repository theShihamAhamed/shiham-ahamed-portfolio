import type { ReactNode } from "react";

import { AuthGuard } from "@/components/layout/auth-guard";
import { AdminShell } from "@/components/layout/admin-shell";

export default function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthGuard>
      <AdminShell>{children}</AdminShell>
    </AuthGuard>
  );
}
