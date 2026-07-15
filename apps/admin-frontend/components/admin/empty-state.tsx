import { Inbox } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
};

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
}: EmptyStateProps) {
  return (
    <Card className="border-dashed shadow-none">
      <CardContent className="flex flex-col items-center px-5 py-10 text-center">
        <span className="grid size-11 place-items-center rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] text-[var(--admin-accent)]">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-base font-semibold tracking-normal text-[var(--admin-text)]">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-md text-sm leading-6 text-[var(--admin-muted)]">
            {description}
          </p>
        ) : null}
        {action ? <div className="mt-5">{action}</div> : null}
      </CardContent>
    </Card>
  );
}
