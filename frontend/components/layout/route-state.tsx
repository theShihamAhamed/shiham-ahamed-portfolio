import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

type RouteStateProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export function RouteState({
  eyebrow,
  title,
  description,
  children,
}: RouteStateProps) {
  return (
    <section className="min-h-[calc(100svh-56px)] border-b border-border/60 sm:min-h-[calc(100svh-64px)]">
      <div className="mx-auto flex min-h-[calc(100svh-56px)] max-w-7xl items-center px-4 py-16 sm:min-h-[calc(100svh-64px)] sm:px-6 sm:py-20 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-[-0.055em] text-foreground sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 text-base leading-8 text-muted-foreground">
            {description}
          </p>
          {children ? (
            <div className="mt-8 flex flex-wrap gap-3">{children}</div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function HomeLink() {
  return (
    <Button
      asChild
      className="h-10 rounded-lg bg-foreground px-4 text-background"
    >
      <Link href="/">Back home</Link>
    </Button>
  );
}

export function ProjectsLink() {
  return (
    <Button
      asChild
      variant="outline"
      className="h-10 rounded-lg border-border bg-background px-4"
    >
      <Link href="/projects">View projects</Link>
    </Button>
  );
}
