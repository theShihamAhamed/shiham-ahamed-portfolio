import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

type ContactMethodCardProps = {
  title: string;
  value: string;
  href: string;
  action: string;
  icon: ComponentType<{ className?: string }>;
  secondaryAction?: ReactNode;
  className?: string;
};

export default function ContactMethodCard({
  title,
  value,
  href,
  action,
  icon: Icon,
  secondaryAction,
  className,
}: ContactMethodCardProps) {
  const isExternal = href.startsWith("http");

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/60 bg-background/60 p-5 shadow-sm backdrop-blur-xl transition-colors duration-200 hover:border-border sm:p-6",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent opacity-70" />

      <div className="relative flex items-start gap-4">
        <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-background/80 text-foreground shadow-sm">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold tracking-[-0.025em] text-foreground sm:text-lg">
            {title}
          </h2>

          <p className="mt-2 max-w-full break-all text-sm leading-6 text-muted-foreground">
            {value}
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href={href}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              className="inline-flex min-h-11 items-center rounded-xl text-sm font-medium text-foreground outline-none transition-colors hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/45"
            >
              {action}
              <ArrowUpRight className="ml-1.5 h-4 w-4" />
            </Link>

            {secondaryAction ? (
              <div className="flex sm:justify-end">{secondaryAction}</div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
