import { Loader2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { UNSAVED_CHANGES_MESSAGE } from "@/hooks/use-unsaved-changes";

type FormActionsProps = {
  cancelHref: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  isUploadPending?: boolean;
  isDirty?: boolean;
};

export function FormActions({
  cancelHref,
  submitLabel = "Save changes",
  isSubmitting = false,
  isUploadPending = false,
  isDirty = false,
}: FormActionsProps) {
  const isBlocked = isSubmitting || isUploadPending;

  return (
    <div className="sticky bottom-0 z-10 flex flex-col gap-3 border-t border-[var(--admin-border)] bg-[color:var(--admin-bg)]/95 py-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-[var(--admin-muted)]" role="status" aria-live="polite">
        {isUploadPending
          ? "Finish the active media upload before saving."
          : isDirty
            ? "You have unsaved changes."
            : "All form changes are saved or unchanged."}
      </p>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Link
        href={cancelHref}
        className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 text-sm font-medium text-[var(--admin-text)] transition-colors hover:bg-[var(--admin-surface-muted)]"
        onClick={(event) => {
          if (isDirty && !window.confirm(UNSAVED_CHANGES_MESSAGE)) {
            event.preventDefault();
          }
        }}
      >
        Cancel
      </Link>
      <Button type="submit" disabled={isBlocked} aria-disabled={isBlocked}>
        {isSubmitting ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : null}
        {isSubmitting ? "Saving…" : submitLabel}
      </Button>
      </div>
    </div>
  );
}
