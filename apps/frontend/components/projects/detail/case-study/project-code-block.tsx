"use client";

import { Check, Copy } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import { getCaseStudyLanguageLabel } from "@portfolio/shared";

type Props = {
  code: string;
  className?: string;
  children: ReactNode;
};

const fallbackCopy = (value: string): boolean => {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  textarea.remove();
  return copied;
};

const copyCode = async (value: string): Promise<boolean> => {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      // Fall through to the legacy browser clipboard path.
    }
  }

  return fallbackCopy(value);
};

export function ProjectCodeBlock({ code, className, children }: Props) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const language = getCaseStudyLanguageLabel(className);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  const handleCopy = async () => {
    const copied = await copyCode(code);
    setStatus(copied ? "copied" : "failed");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setStatus("idle"), 1800);
  };

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-border/60 bg-zinc-950 text-zinc-100 shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2 text-[11px]">
        <span className="font-mono text-zinc-400">{language ?? "Code"}</span>
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          aria-label="Copy code"
        >
          {status === "copied" ? (
            <Check className="size-3.5" aria-hidden="true" />
          ) : (
            <Copy className="size-3.5" aria-hidden="true" />
          )}
          {status === "copied" ? "Copied" : status === "failed" ? "Copy failed" : "Copy code"}
        </button>
      </div>
      <div className="overflow-x-auto">{children}</div>
      <span className="sr-only" aria-live="polite">
        {status === "copied" ? "Code copied." : status === "failed" ? "Code could not be copied." : ""}
      </span>
    </div>
  );
}
