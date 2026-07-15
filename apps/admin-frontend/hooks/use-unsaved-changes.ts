"use client";

import { useEffect } from "react";

export const UNSAVED_CHANGES_MESSAGE =
  "You have unsaved project changes. Leave without saving?";

export function useUnsavedChanges(shouldWarn: boolean) {
  useEffect(() => {
    if (!shouldWarn) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = true;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [shouldWarn]);
}
