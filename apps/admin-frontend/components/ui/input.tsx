import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "h-10 w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-sm text-[var(--admin-text)] outline-none transition-colors placeholder:text-[var(--admin-subtle)] focus:border-[var(--admin-accent)] focus:ring-2 focus:ring-[rgba(92,126,143,0.14)] disabled:cursor-not-allowed disabled:bg-[var(--admin-surface-muted)] disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
  },
);

Input.displayName = "Input";
