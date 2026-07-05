import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type SkeletonProps = {
  className?: string;
};

type SkeletonCardProps = SkeletonProps & {
  children?: ReactNode;
};

type SkeletonTextProps = SkeletonProps & {
  lines?: string[];
};

type SkeletonPageShellProps = SkeletonProps & {
  label: string;
  children: ReactNode;
};

export function SkeletonBlock({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("portfolio-loading-shimmer rounded-xl bg-muted/40", className)}
    />
  );
}

export function SkeletonText({
  className,
  lines = ["w-full", "w-5/6", "w-2/3"],
}: SkeletonTextProps) {
  return (
    <div className={cn("space-y-2.5", className)} aria-hidden="true">
      {lines.map((width, index) => (
        <SkeletonBlock key={`${width}-${index}`} className={cn("h-3", width)} />
      ))}
    </div>
  );
}

export function SkeletonCard({ children, className }: SkeletonCardProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-2xl border border-border/60 bg-background/70 p-5 shadow-sm backdrop-blur-xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SkeletonButton({ className }: SkeletonProps) {
  return <SkeletonBlock className={cn("h-11 w-32 rounded-lg", className)} />;
}

export function SkeletonMedia({ className }: SkeletonProps) {
  return (
    <SkeletonBlock
      className={cn(
        "aspect-video w-full rounded-[1.5rem] border border-border/60",
        className,
      )}
    />
  );
}

export function SkeletonPageShell({
  label,
  children,
  className,
}: SkeletonPageShellProps) {
  return (
    <main
      className={cn("relative overflow-hidden bg-background", className)}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <span className="sr-only">{label}</span>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_12%,rgba(59,130,246,0.08),transparent_32%),radial-gradient(circle_at_86%_18%,rgba(16,185,129,0.06),transparent_28%)] dark:bg-[radial-gradient(circle_at_14%_12%,rgba(96,165,250,0.10),transparent_32%),radial-gradient(circle_at_86%_18%,rgba(45,212,191,0.08),transparent_28%)]" />
      <div className="relative">{children}</div>
    </main>
  );
}

function PageHeadingSkeleton({
  centered = false,
}: {
  centered?: boolean;
}) {
  return (
    <div className={cn(centered && "mx-auto max-w-3xl text-center")}>
      <SkeletonBlock className={cn("h-3 w-24 rounded-full", centered && "mx-auto")} />
      <SkeletonBlock
        className={cn(
          "mt-4 h-11 w-full max-w-xl rounded-2xl sm:h-14",
          centered && "mx-auto",
        )}
      />
      <SkeletonText
        className={cn("mt-5 max-w-2xl", centered && "mx-auto")}
        lines={centered ? ["w-full", "mx-auto w-5/6"] : ["w-full", "w-4/5"]}
      />
    </div>
  );
}

function ProjectCardSkeleton() {
  return (
    <article
      aria-hidden="true"
      className="overflow-hidden rounded-2xl border border-border/60 bg-background/80 shadow-sm"
    >
      <SkeletonMedia className="rounded-none border-0" />
      <div className="space-y-4 p-5 sm:p-6">
        <SkeletonBlock className="h-5 w-2/3" />
        <SkeletonText lines={["w-full", "w-4/5"]} />
        <div className="flex flex-wrap gap-2">
          <SkeletonBlock className="h-7 w-16 rounded-full" />
          <SkeletonBlock className="h-7 w-20 rounded-full" />
          <SkeletonBlock className="h-7 w-14 rounded-full" />
        </div>
        <div className="flex items-center justify-between border-t border-border/40 pt-4">
          <SkeletonButton className="h-9 w-28" />
          <div className="flex gap-2">
            <SkeletonBlock className="size-9 rounded-lg" />
            <SkeletonBlock className="h-9 w-24 rounded-lg" />
          </div>
        </div>
      </div>
    </article>
  );
}

function SmallCardsGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} className="space-y-4">
          <SkeletonBlock className="h-5 w-2/3" />
          <SkeletonText lines={["w-full", "w-5/6", "w-3/5"]} />
        </SkeletonCard>
      ))}
    </div>
  );
}

export function AboutLoadingSkeleton() {
  return (
    <SkeletonPageShell label="Loading profile page" className="pb-20 sm:pb-24 lg:pb-28">
      <section className="border-b border-border/60">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-12 lg:items-center lg:px-8 lg:py-24">
          <div className="lg:col-span-7">
            <PageHeadingSkeleton />
          </div>
          <div className="lg:col-span-5">
            <div className="mx-auto max-w-sm lg:ml-auto lg:mr-0">
              <div className="rounded-[2rem] border border-border/60 bg-background/80 p-3 shadow-sm backdrop-blur-xl">
                <SkeletonBlock className="aspect-[4/5] rounded-[1.5rem]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SkeletonBlock className="h-3 w-32 rounded-full" />
            <SkeletonBlock className="mt-4 h-9 w-64 rounded-xl" />
          </div>
          <div className="space-y-5 lg:col-span-8">
            <SkeletonText lines={["w-full", "w-11/12", "w-4/5"]} />
            <SkeletonText lines={["w-full", "w-10/12", "w-2/3"]} />
          </div>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <SkeletonCard key={index} className="space-y-4 p-6">
              <SkeletonBlock className="h-6 w-2/5" />
              <SkeletonText lines={["w-full", "w-4/5"]} />
            </SkeletonCard>
          ))}
        </div>

        <SkeletonCard className="mt-10 grid gap-5 p-6 sm:grid-cols-[0.7fr_1.3fr]">
          <SkeletonBlock className="h-20 rounded-2xl" />
          <SkeletonText lines={["w-full", "w-5/6", "w-3/5"]} />
        </SkeletonCard>

        <section className="mt-14">
          <SkeletonBlock className="h-8 w-48 rounded-xl" />
          <SmallCardsGrid count={4} />
        </section>

        <section className="mt-14">
          <SkeletonBlock className="h-8 w-44 rounded-xl" />
          <SmallCardsGrid count={4} />
        </section>
      </section>
    </SkeletonPageShell>
  );
}

export function ContactLoadingSkeleton() {
  return (
    <SkeletonPageShell label="Loading contact page" className="pb-20 sm:pb-24 lg:pb-28">
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <PageHeadingSkeleton />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-12 lg:items-start lg:px-8 lg:py-20">
        <div className="space-y-4 lg:col-span-5">
          {Array.from({ length: 3 }, (_, index) => (
            <SkeletonCard key={index} className="flex items-center gap-4 p-5">
              <SkeletonBlock className="size-12 rounded-2xl" />
              <div className="flex-1">
                <SkeletonBlock className="h-4 w-20" />
                <SkeletonBlock className="mt-3 h-4 w-4/5" />
              </div>
              <SkeletonBlock className="h-9 w-24 rounded-lg" />
            </SkeletonCard>
          ))}
        </div>

        <SkeletonCard className="space-y-6 p-5 sm:p-7 lg:col-span-7">
          <div>
            <SkeletonBlock className="h-8 w-72 rounded-xl" />
            <SkeletonText className="mt-4 max-w-lg" lines={["w-full", "w-3/4"]} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SkeletonBlock className="h-12 rounded-xl" />
            <SkeletonBlock className="h-12 rounded-xl" />
          </div>
          <SkeletonBlock className="h-12 rounded-xl" />
          <SkeletonBlock className="h-32 rounded-xl" />
          <SkeletonButton className="w-40" />
        </SkeletonCard>
      </section>
    </SkeletonPageShell>
  );
}

export function ProjectsLoadingSkeleton() {
  return (
    <SkeletonPageShell label="Loading projects page" className="pb-20 sm:pb-24 lg:pb-28">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <PageHeadingSkeleton />

        <div className="mt-10 grid gap-4 lg:grid-cols-12">
          <SkeletonBlock className="h-12 rounded-2xl lg:col-span-4" />
          {Array.from({ length: 4 }, (_, index) => (
            <SkeletonBlock
              key={index}
              className="h-12 rounded-2xl lg:col-span-2"
            />
          ))}
        </div>

        <SkeletonBlock className="mt-5 h-4 w-28" />

        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <ProjectCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </SkeletonPageShell>
  );
}

export function ProjectDetailLoadingSkeleton() {
  return (
    <SkeletonPageShell
      label="Loading project details"
      className="pb-20 sm:pb-24 lg:pb-28"
    >
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="grid gap-8 xl:grid-cols-12 xl:items-start">
            <div className="space-y-6 xl:col-span-5">
              <div className="flex flex-wrap gap-3">
                <SkeletonBlock className="h-7 w-32 rounded-full" />
                <SkeletonBlock className="h-7 w-44 rounded-full" />
              </div>
              <div>
                <SkeletonBlock className="h-14 w-4/5 rounded-2xl sm:h-16" />
                <SkeletonText
                  className="mt-6 max-w-2xl"
                  lines={["w-full", "w-5/6", "w-2/3"]}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 5 }, (_, index) => (
                  <SkeletonBlock key={index} className="h-7 w-20 rounded-full" />
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <SkeletonButton />
                <SkeletonButton className="w-36" />
              </div>
            </div>

            <div className="xl:col-span-7">
              <div className="rounded-[2rem] border border-border/60 bg-background/80 p-3 shadow-sm backdrop-blur-xl sm:p-4">
                <SkeletonMedia className="aspect-[16/10]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-10 px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid gap-6 xl:grid-cols-12">
          <SkeletonCard className="space-y-5 p-6 xl:col-span-5">
            <SkeletonBlock className="h-5 w-24" />
            <SkeletonText lines={["w-full", "w-11/12", "w-4/5", "w-2/3"]} />
          </SkeletonCard>
          <SkeletonCard className="space-y-4 p-6 xl:col-span-7">
            <SkeletonBlock className="h-5 w-28" />
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 6 }, (_, index) => (
                <SkeletonBlock key={index} className="h-10 rounded-xl" />
              ))}
            </div>
          </SkeletonCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <div className="grid gap-4 sm:grid-cols-2 xl:col-span-7">
            {Array.from({ length: 4 }, (_, index) => (
              <SkeletonMedia key={index} className="aspect-[16/10]" />
            ))}
          </div>
          <SkeletonCard className="space-y-4 p-6 xl:col-span-5">
            <SkeletonBlock className="h-6 w-32" />
            <SkeletonText lines={["w-full", "w-11/12", "w-4/5"]} />
            <SkeletonText lines={["w-full", "w-3/4"]} />
          </SkeletonCard>
        </div>

        <SkeletonCard className="space-y-5 p-6">
          <SkeletonBlock className="h-7 w-56" />
          <SkeletonMedia className="aspect-[16/8]" />
        </SkeletonCard>
      </section>
    </SkeletonPageShell>
  );
}
