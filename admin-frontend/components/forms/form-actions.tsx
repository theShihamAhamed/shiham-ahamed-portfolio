import Link from "next/link";

import { Button } from "@/components/ui/button";

type FormActionsProps = {
  cancelHref: string;
  submitLabel?: string;
  isSubmitting?: boolean;
};

export function FormActions({
  cancelHref,
  submitLabel = "Save changes",
  isSubmitting = false,
}: FormActionsProps) {
  return (
    <div className="sticky bottom-0 z-10 flex flex-col-reverse gap-2 border-t border-[var(--admin-border)] bg-[var(--admin-bg)] py-4 backdrop-blur-xl sm:flex-row sm:justify-end">
      <Link
        href={cancelHref}
        className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 text-sm font-medium text-[var(--admin-text)] transition-colors hover:bg-[var(--admin-surface-muted)]"
      >
        Cancel
      </Link>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving" : submitLabel}
      </Button>
    </div>
  );
}
