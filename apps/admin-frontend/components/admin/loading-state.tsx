import { Loader2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type LoadingStateProps = {
  message?: string;
  className?: string;
};

export function LoadingState({
  message = "Loading admin data...",
  className,
}: LoadingStateProps) {
  return (
    <Card className={cn("shadow-none", className)}>
      <CardContent className="flex min-h-40 items-center justify-center p-5">
        <div className="flex items-center gap-2 text-sm text-[var(--admin-muted)]">
          <Loader2 className="size-4 animate-spin text-[var(--admin-accent)]" aria-hidden="true" />
          {message}
        </div>
      </CardContent>
    </Card>
  );
}
