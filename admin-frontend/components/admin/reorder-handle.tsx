"use client";

import { GripVertical, Loader2 } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

type ReorderHandleProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isSaving?: boolean;
};

export const ReorderHandle = React.forwardRef<
  HTMLButtonElement,
  ReorderHandleProps
>(({ className, disabled, isSaving = false, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled || isSaving}
      className={cn(
        "grid size-8 place-items-center rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-muted)] transition-colors hover:border-[var(--admin-accent)] hover:bg-[var(--admin-accent-soft)] hover:text-[var(--admin-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-accent)] disabled:cursor-not-allowed disabled:opacity-45",
        className,
      )}
      {...props}
    >
      {isSaving ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        children ?? <GripVertical className="size-4" aria-hidden="true" />
      )}
    </button>
  );
});

ReorderHandle.displayName = "ReorderHandle";
