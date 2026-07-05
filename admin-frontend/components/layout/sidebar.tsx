"use client";

import {
  Award,
  BadgeCheck,
  FolderKanban,
  Gauge,
  Hammer,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navigationItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: Gauge,
  },
  {
    label: "Projects",
    href: "/admin/projects",
    icon: FolderKanban,
  },
  {
    label: "Currently Building",
    href: "/admin/currently-building",
    icon: Hammer,
  },
  {
    label: "Certifications",
    href: "/admin/certifications",
    icon: BadgeCheck,
  },
  {
    label: "Achievements",
    href: "/admin/achievements",
    icon: Award,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

const isActiveRoute = (pathname: string, href: string) => {
  if (href === "/admin") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-5 shadow-sm lg:block">
      <Link href="/admin" className="mb-8 flex items-center gap-3 px-2">
        <span className="grid size-10 place-items-center rounded-lg border border-[rgba(92,126,143,0.24)] bg-[var(--admin-accent-soft)] text-sm font-semibold text-[var(--admin-accent)]">
          SA
        </span>
        <span>
          <span className="block text-sm font-semibold text-[var(--admin-text)]">
            Portfolio Admin
          </span>
          <span className="block text-xs text-[var(--admin-muted)]">Control center</span>
        </span>
      </Link>

      <nav className="space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActiveRoute(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-[var(--admin-muted)] transition-colors hover:bg-[var(--admin-accent-soft)] hover:text-[var(--admin-text)]",
                active &&
                  "bg-[var(--admin-accent-soft)] text-[var(--admin-accent)] ring-1 ring-inset ring-[rgba(92,126,143,0.24)]",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
