"use client";

import * as React from "react";

const statusMessages = [
  "Initializing portfolio",
  "Loading project data",
  "Preparing interface",
  "Almost there",
];

export default function RootLoading() {
  const [statusIndex, setStatusIndex] = React.useState(0);

  React.useEffect(() => {
    const intervalId = window.setInterval(() => {
      setStatusIndex((currentIndex) => (currentIndex + 1) % statusMessages.length);
    }, 1400);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <section
      className="relative grid min-h-[calc(100svh-56px)] overflow-hidden border-b border-border/60 bg-background sm:min-h-[calc(100svh-64px)]"
      role="status"
      aria-live="polite"
      aria-label="Loading portfolio"
      aria-atomic="true"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(59,130,246,0.12),transparent_32%),radial-gradient(circle_at_82%_26%,rgba(16,185,129,0.10),transparent_30%),radial-gradient(circle_at_50%_92%,rgba(168,85,247,0.08),transparent_34%)] dark:bg-[radial-gradient(circle_at_18%_18%,rgba(96,165,250,0.14),transparent_32%),radial-gradient(circle_at_82%_26%,rgba(45,212,191,0.10),transparent_30%),radial-gradient(circle_at_50%_92%,rgba(168,85,247,0.10),transparent_34%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(120,120,120,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(120,120,120,0.10)_1px,transparent_1px)] bg-[size:56px_56px] opacity-35 [mask-image:radial-gradient(circle_at_center,black,transparent_74%)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)]" />
        <div className="portfolio-loading-glow absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-7xl items-center justify-center px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="w-full max-w-3xl text-center">
          <div className="mx-auto mb-8 grid size-24 place-items-center sm:size-28">
            <div className="portfolio-loading-orbit relative size-24 rounded-full border border-border/70 bg-background/35 shadow-sm backdrop-blur-xl motion-reduce:animate-none sm:size-28">
              <span className="absolute inset-3 rounded-full border border-border/60" />
              <span className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground" />
              <span className="absolute left-1/2 top-1 size-2.5 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_30px_hsl(var(--primary)/0.55)]" />
            </div>
          </div>

          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Portfolio
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-[-0.06em] text-foreground sm:text-5xl lg:text-6xl">
            Loading Shiham&apos;s portfolio
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            Preparing the latest projects, skills, and contact paths with a
            quiet production-ready polish.
          </p>

          <div className="mx-auto mt-9 max-w-sm">
            <div className="h-1 overflow-hidden rounded-full bg-muted/70">
              <div className="portfolio-loading-progress h-full w-1/2 rounded-full bg-foreground/80" />
            </div>
            <p className="mt-4 min-h-6 text-sm font-medium text-foreground">
              {statusMessages[statusIndex]}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Projects {"\u00B7"} Skills {"\u00B7"} Contact
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
