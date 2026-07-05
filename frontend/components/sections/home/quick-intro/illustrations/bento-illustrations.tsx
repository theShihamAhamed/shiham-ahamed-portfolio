"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type BentoIllustrationLayerProps = {
  children: ReactNode;
  className?: string;
};

export const BentoIllustrationLayer = ({
  children,
  className,
}: BentoIllustrationLayerProps) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute z-0 select-none transition-opacity duration-300",
        className,
      )}
      initial={reduceMotion ? false : { y: 8 }}
      whileInView={reduceMotion ? undefined : { y: 0 }}
      viewport={{ once: true, margin: "-20%" }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

export const GridPattern = ({ className }: { className?: string }) => (
  <svg className={cn("h-full w-full", className)} viewBox="0 0 320 220">
    <g fill="none" stroke="currentColor" strokeDasharray="2 3" strokeWidth="1">
      {Array.from({ length: 11 }).map((_, index) => (
        <line
          key={`h-${index}`}
          x1="0"
          x2="320"
          y1={20 + index * 18}
          y2={20 + index * 18}
        />
      ))}
      {Array.from({ length: 15 }).map((_, index) => (
        <line
          key={`v-${index}`}
          x1={16 + index * 20}
          x2={16 + index * 20}
          y1="0"
          y2="220"
        />
      ))}
    </g>
  </svg>
);

export const MiniBrowserWindow = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "overflow-hidden rounded-xl border border-foreground/10 bg-background/50 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.025] dark:shadow-[0_18px_60px_rgba(255,255,255,0.025)]",
      className,
    )}
  >
    <div className="flex h-7 items-center gap-1.5 border-b border-foreground/10 bg-muted/35 px-3 dark:border-white/10 dark:bg-white/[0.035]">
      <span className="h-2 w-2 rounded-full bg-foreground/15 dark:bg-white/20" />
      <span className="h-2 w-2 rounded-full bg-foreground/12 dark:bg-white/15" />
      <span className="h-2 w-2 rounded-full bg-foreground/10 dark:bg-white/10" />
    </div>
    <div className="grid grid-cols-[0.72fr_1fr] gap-3 p-4">
      <div className="space-y-2">
        <div className="h-14 rounded-lg border border-foreground/10 bg-muted/40 dark:border-white/10 dark:bg-white/[0.04]" />
        <div className="h-2 w-4/5 rounded-full bg-foreground/15 dark:bg-white/20" />
        <div className="h-2 w-2/3 rounded-full bg-foreground/10 dark:bg-white/15" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between gap-3">
          <div className="h-2 w-16 rounded-full bg-foreground/15 dark:bg-white/20" />
          <div className="h-3 w-10 rounded-full bg-cyan-500/25" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-8 rounded-md border border-foreground/10 bg-background/45 dark:border-white/10 dark:bg-white/[0.025]"
            />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const NodeDiagram = ({ className }: { className?: string }) => (
  <div className={cn("relative h-full w-full", className)}>
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 180 140">
      <g fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M42 72H88L124 34" opacity="0.14" />
        <path d="M42 72H96L130 104" opacity="0.14" />
        <path d="M88 72H142" opacity="0.12" />
      </g>
    </svg>
    {[
      "left-[10%] top-[43%]",
      "left-[47%] top-[43%]",
      "right-[14%] top-[14%]",
      "right-[10%] bottom-[15%]",
    ].map((position, index) => (
      <div
        key={position}
        className={cn(
          "absolute flex h-9 w-9 items-center justify-center rounded-xl border border-foreground/10 bg-background/55 text-[10px] font-semibold text-muted-foreground/80 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.03] dark:text-muted-foreground/75",
          position,
        )}
      >
        {["API", "DB", "UI", "Auth"][index]}
      </div>
    ))}
  </div>
);

export const StackTiles = ({ className }: { className?: string }) => (
  <div className={cn("grid grid-cols-3 gap-2", className)}>
    {["TS", "R", "NX", "DB", "API", "CSS"].map((item, index) => (
      <div
        key={item}
        className={cn(
          "rounded-lg border border-foreground/10 bg-background/55 px-2 py-2 text-center text-[10px] font-semibold text-muted-foreground/80 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.03] dark:text-muted-foreground/75",
          index % 2 === 0 && "translate-y-2",
        )}
      >
        {item}
      </div>
    ))}
  </div>
);

export const PipelineIllustration = ({ className }: { className?: string }) => (
  <div className={cn("relative h-full w-full", className)}>
    <div className="absolute left-6 right-6 top-1/2 h-px bg-foreground/10 dark:bg-white/10" />
    {["Idea", "Build", "Ship"].map((item, index) => (
      <div
        key={item}
        className={cn(
          "absolute top-1/2 w-20 -translate-y-1/2 rounded-xl border border-foreground/10 bg-background/55 px-3 py-2 text-center text-[10px] font-semibold text-muted-foreground/80 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.03] dark:text-muted-foreground/75",
          index === 0 && "left-0",
          index === 1 && "left-1/2 -translate-x-1/2",
          index === 2 && "right-0",
        )}
      >
        {item}
      </div>
    ))}
  </div>
);

const WorkflowSvgIcon = ({ src }: { src: string }) => (
  <span
    aria-hidden="true"
    className="size-5 bg-current"
    style={{
      WebkitMask: `url(${src}) center / contain no-repeat`,
      mask: `url(${src}) center / contain no-repeat`,
    }}
  />
);

const workflowSteps = [
  {
    title: "Problem",
    detail: "Understand the core issue",
    accent: "border-violet-400/45 bg-violet-500/5 text-violet-300",
    ring: "bg-violet-400/50 shadow-[0_0_22px_rgba(168,85,247,0.55)]",
    cardGlow:
      "before:bg-[radial-gradient(circle_at_20%_10%,rgba(168,85,247,0.22),transparent_42%)]",
    icon: "/grid/idea1.svg",
    connectorOut:
      "from-violet-400/75 to-sky-400/75 shadow-[0_0_18px_rgba(168,85,247,0.35)]",
    connectorDot:
      "border-violet-300/70 bg-violet-400/20 shadow-[0_0_18px_rgba(168,85,247,0.55)]",
    connectorSolid: "bg-sky-400/70 shadow-[0_0_18px_rgba(56,189,248,0.55)]",
  },
  {
    title: "Build",
    detail: "Create clean, scalable solutions",
    accent: "border-sky-400/45 bg-sky-500/5 text-sky-300",
    ring: "bg-sky-400/50 shadow-[0_0_22px_rgba(56,189,248,0.55)]",
    cardGlow:
      "before:bg-[radial-gradient(circle_at_20%_10%,rgba(56,189,248,0.2),transparent_42%)]",
    icon: "/grid/webProgramming.svg",
    connectorOut:
      "from-sky-400/75 to-emerald-400/75 shadow-[0_0_18px_rgba(56,189,248,0.35)]",
    connectorDot:
      "border-sky-300/70 bg-sky-400/20 shadow-[0_0_18px_rgba(56,189,248,0.55)]",
    connectorSolid: "bg-emerald-400/70 shadow-[0_0_18px_rgba(52,211,153,0.55)]",
  },
  {
    title: "Refine",
    detail: "Iterate and improve",
    accent: "border-emerald-400/45 bg-emerald-500/5 text-emerald-300",
    ring: "bg-emerald-400/50 shadow-[0_0_22px_rgba(52,211,153,0.55)]",
    cardGlow:
      "before:bg-[radial-gradient(circle_at_20%_10%,rgba(52,211,153,0.18),transparent_42%)]",
    icon: "/grid/signal.svg",
    connectorOut: "",
    connectorDot: "",
    connectorSolid: "",
  },
];

const WorkflowConnector = ({
  lineClassName,
  dotClassName,
  solidClassName,
}: {
  lineClassName: string;
  dotClassName: string;
  solidClassName: string;
}) => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute right-[-1.55rem] top-1/2 z-50 hidden h-5 w-[2.15rem] -translate-y-1/2 items-center lg:flex"
    >
      <span
        className={cn(
          "relative z-30 flex size-3.5 shrink-0 items-center justify-center rounded-full border bg-black/95",
          dotClassName,
        )}
      >
        <span className="size-1.5 rounded-full bg-current opacity-75" />
      </span>

      <span
        className={cn(
          "relative z-20 h-px flex-1 bg-gradient-to-r",
          lineClassName,
        )}
      />

      <span
        className={cn(
          "relative z-30 size-1.5 shrink-0 rounded-full ring-1 ring-white/70",
          solidClassName,
        )}
      />
    </div>
  );
};

export const WorkflowProcessIllustration = ({
  className,
}: {
  className?: string;
}) => {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-visible rounded-3xl",
        className,
      )}
    >
      {/* Ambient glow layer */}
      <div className="absolute inset-[-18%] rounded-[2rem] bg-[radial-gradient(circle_at_14%_50%,rgba(168,85,247,0.18),transparent_28%),radial-gradient(circle_at_48%_46%,rgba(56,189,248,0.16),transparent_30%),radial-gradient(circle_at_82%_50%,rgba(52,211,153,0.14),transparent_28%)] blur-xl" />

      {/* Subtle background grid */}
      <svg
        aria-hidden="true"
        className="absolute inset-[-12%] h-[124%] w-[124%] text-white/[0.15]"
        viewBox="0 0 560 240"
        preserveAspectRatio="none"
      >
        <g fill="none" stroke="currentColor" strokeDasharray="4 10">
          {Array.from({ length: 8 }).map((_, index) => (
            <line
              key={`workflow-h-${index}`}
              x1="0"
              x2="560"
              y1={24 + index * 28}
              y2={24 + index * 28}
            />
          ))}

          {Array.from({ length: 11 }).map((_, index) => (
            <line
              key={`workflow-v-${index}`}
              x1={36 + index * 48}
              x2={36 + index * 48}
              y1="0"
              y2="240"
            />
          ))}
        </g>
      </svg>

      {/* Cards */}
      <div className="absolute inset-x-0 top-[42%] z-[2] grid -translate-y-1/2 grid-cols-3 gap-5">
        {workflowSteps.map((step, index) => (
          <motion.div
            key={step.title}
            className={cn(
              "group/workflow-card relative min-h-[118px] overflow-visible",
              index === 0 && "z-30",
              index === 1 && "z-20",
              index === 2 && "z-10",
            )}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{
              duration: 0.5,
              delay: reduceMotion ? 0 : index * 0.08,
              ease: "easeOut",
            }}
          >
            <div
              className={cn(
                "relative h-full overflow-hidden rounded-2xl border border-white/12 bg-black/36 p-4 shadow-[0_18px_70px_rgba(0,0,0,0.32)] backdrop-blur-md",
                "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:opacity-100",
                "after:pointer-events-none after:absolute after:inset-0 after:rounded-2xl after:bg-[linear-gradient(180deg,rgba(255,255,255,0.055),transparent_58%)]",
                step.cardGlow,
              )}
            >
              <div
                className={cn(
                  "relative z-10 mb-4 flex size-10 items-center justify-center rounded-xl border",
                  step.accent,
                )}
              >
                <WorkflowSvgIcon src={step.icon} />
              </div>

              <p className="relative z-10 text-sm font-semibold leading-none text-white/90">
                {step.title}
              </p>

              <p className="relative z-10 mt-2 max-w-[8.8rem] text-xs leading-5 text-white/52">
                {step.detail}
              </p>
            </div>

            {index !== workflowSteps.length - 1 && (
              <WorkflowConnector
                lineClassName={step.connectorOut}
                dotClassName={step.connectorDot}
                solidClassName={step.connectorSolid}
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export const TimelinePath = ({ className }: { className?: string }) => (
  <div className={cn("relative h-full w-full", className)}>
    <div className="absolute bottom-6 right-9 top-6 w-px bg-foreground/10 dark:bg-white/10" />
    {[0, 1, 2, 3].map((item) => (
      <div
        key={item}
        className={cn(
          "absolute right-[29px] h-3.5 w-3.5 rounded-full border border-foreground/10 bg-background shadow-sm dark:border-white/10 dark:bg-white/[0.06]",
          item === 0 && "top-7",
          item === 1 && "top-[35%]",
          item === 2 && "top-[58%]",
          item === 3 && "bottom-7 bg-cyan-500/15",
        )}
      />
    ))}
  </div>
);

export const TextSafetyFade = ({ className }: { className?: string }) => (
  <div
    aria-hidden="true"
    className={cn("pointer-events-none absolute inset-0 z-[1]", className)}
  />
);
