"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";

type CopyEmailProps = {
  email: string;
  className?: string;
  variant?: "terminal" | "compact";
};

export default function CopyEmail({
  email,
  className,
  variant = "terminal",
}: CopyEmailProps) {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);

      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }

      resetTimerRef.current = window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (error) {
      console.error("Failed to copy email:", error);
    }
  };

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          "inline-flex min-h-11 items-center gap-2 rounded-xl border border-border/60 bg-background/70 px-3.5 text-xs font-medium text-foreground shadow-sm outline-none transition-colors hover:bg-accent/70 focus-visible:ring-2 focus-visible:ring-ring/45",
          className,
        )}
        aria-label={
          copied
            ? `Copied email address ${email}`
            : `Copy email address ${email}`
        }
      >
        {copied ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
        <span>{copied ? "Copied" : "Copy email"}</span>
        <span className="sr-only" aria-live="polite">
          {copied ? "Email copied." : ""}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex cursor-pointer items-center gap-3 bg-transparent px-0 py-0 font-mono text-sm text-foreground/80 transition-none outline-none focus-visible:ring-2 focus-visible:ring-ring/45",
        className,
      )}
      aria-label={
        copied ? `Copied email address ${email}` : `Copy email address ${email}`
      }
    >
      <span className="select-none text-muted-foreground/70">{">"}</span>

      <span className="tracking-tight text-foreground/80">{email}</span>

      <span className="flex items-center justify-center text-muted-foreground/80">
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </span>

      <span className="sr-only" aria-live="polite">
        {copied ? "Email copied." : ""}
      </span>
    </button>
  );
}
