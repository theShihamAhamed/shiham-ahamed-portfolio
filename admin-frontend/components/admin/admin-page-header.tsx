import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

type AdminPageHeaderProps = {
  title: string;
  description?: string;
  badge?: string;
  actions?: ReactNode;
};

export function AdminPageHeader({
  title,
  description,
  badge,
  actions,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {badge ? <Badge variant="cyan">{badge}</Badge> : null}
        <h1 className="mt-3 text-2xl font-semibold tracking-normal text-[var(--admin-text)] sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--admin-muted)]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
