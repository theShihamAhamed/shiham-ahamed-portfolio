import { ShieldCheck } from "lucide-react";

import { LoginForm } from "@/components/forms/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const normalizeNextPath = (next?: string | string[]) => {
  const value = Array.isArray(next) ? next[0] : next;

  if (!value || !value.startsWith("/admin") || value.startsWith("/admin/login")) {
    return "/admin";
  }

  return value;
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const nextPath = normalizeNextPath((await searchParams).next);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--admin-bg)] px-5 py-10 text-[var(--admin-text)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-3 grid size-11 place-items-center rounded-lg border border-[rgba(92,126,143,0.24)] bg-[var(--admin-accent-soft)] text-[var(--admin-accent)]">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </div>
          <CardTitle>Portfolio Admin</CardTitle>
          <CardDescription>
            Sign in to manage project, certification, and achievement content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm nextPath={nextPath} />
        </CardContent>
      </Card>
    </main>
  );
}
