"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { swapSets } from "@/data/site/swapset";
import { cn } from "@/lib/utils";
import type { LogoItem, SwapSet, ToolsLogoCloudProps } from "@/types/skills";

export default function LogoCloudSwap({
  title = "Tools & Technologies",
  sets = swapSets,
  className,
  stepDelayMs = 65,
  settleDelayMs = 1800,
  transitionMs = 680,
  logoScale = 1,
}: ToolsLogoCloudProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const [setIndex, setSetIndex] = React.useState(0);
  const [phase, setPhase] = React.useState(0);

  const activeSets = sets.length > 0 ? sets : swapSets;

  const maxPerRow = React.useMemo(() => {
    return Math.max(
      ...activeSets.flatMap((set) => [set.top.length, set.bottom.length]),
      1,
    );
  }, [activeSets]);

  const current = activeSets[setIndex % activeSets.length] ?? activeSets[0];
  const next =
    activeSets[(setIndex + 1) % activeSets.length] ?? activeSets[0];

  React.useEffect(() => {
    if (activeSets.length <= 1) return;

    const currentSet =
      activeSets[setIndex % activeSets.length] ?? activeSets[0];
    const totalSteps = currentSet.top.length + currentSet.bottom.length;
    const activeTimers: number[] = [];
    const run = () => {
      for (let step = 1; step <= totalSteps; step += 1) {
        activeTimers.push(
          window.setTimeout(() => {
            setPhase(step);
          }, step * stepDelayMs),
        );
      }

      activeTimers.push(
        window.setTimeout(
          () => {
            setSetIndex((prev) => (prev + 1) % activeSets.length);
            setPhase(0);
          },
          totalSteps * stepDelayMs + transitionMs + settleDelayMs,
        ),
      );
    };

    run();

    return () => {
      activeTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [
    activeSets,
    setIndex,
    stepDelayMs,
    settleDelayMs,
    transitionMs,
  ]);

  return (
    <section className={cn("relative w-full px-0 py-0", className)}>
      <div className="mx-auto w-full">
        {title ? (
          <div className="mb-5 sm:mb-6">
            <h2 className="text-sm font-medium tracking-[0.08em] text-muted-foreground/90">
              {title}
            </h2>
          </div>
        ) : null}

        <div className="relative overflow-hidden">
          <div className="relative z-0 hidden gap-y-3 sm:grid sm:gap-y-4">
            <LogoRow
              current={current.top}
              next={next.top}
              row="top"
              phase={phase}
              maxPerRow={maxPerRow}
              transitionMs={transitionMs}
              logoScale={logoScale}
              shouldReduceMotion={shouldReduceMotion}
            />
            <LogoRow
              current={current.bottom}
              next={next.bottom}
              row="bottom"
              phase={phase}
              maxPerRow={maxPerRow}
              transitionMs={transitionMs}
              logoScale={logoScale}
              shouldReduceMotion={shouldReduceMotion}
            />
          </div>

          <div className="relative z-0 grid gap-2.5 sm:hidden">
            <MobileLogoGrid
              current={current}
              next={next}
              phase={phase}
              transitionMs={transitionMs}
              logoScale={logoScale}
              shouldReduceMotion={shouldReduceMotion}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

type LogoRowProps = {
  current: LogoItem[];
  next: LogoItem[];
  row: "top" | "bottom";
  phase: number;
  maxPerRow: number;
  transitionMs: number;
  logoScale: number;
  shouldReduceMotion: boolean;
};

function LogoRow({
  current,
  next,
  row,
  phase,
  maxPerRow,
  transitionMs,
  logoScale,
  shouldReduceMotion,
}: LogoRowProps) {
  return (
    <div
      className="grid items-center gap-x-2.5 md:gap-x-3 lg:gap-x-4"
      style={{
        gridTemplateColumns: `repeat(${maxPerRow}, minmax(0, 1fr))`,
      }}
    >
      {Array.from({ length: maxPerRow }).map((_, index) => {
        const currentLogo = current[index];
        const nextLogo = next[index] ?? currentLogo;
        const order = row === "top" ? index + 1 : current.length + index + 1;
        const shouldSwap = phase >= order;
        const visibleLogo = shouldSwap ? nextLogo : currentLogo;
        const tileLogo = currentLogo ?? visibleLogo;

        if (!visibleLogo) {
          return (
            <div
              key={`${row}-empty-${index}`}
              className="h-16 sm:h-24 lg:h-[6.5rem]"
            />
          );
        }

        return (
          <LogoSlot
            key={`${row}-${index}`}
            logo={visibleLogo}
            tileLogo={tileLogo}
            animateKey={shouldSwap ? nextLogo.id : currentLogo.id}
            transitionMs={transitionMs}
            logoScale={logoScale}
            shouldReduceMotion={shouldReduceMotion}
          />
        );
      })}
    </div>
  );
}

type MobileLogoGridProps = {
  current: SwapSet;
  next: SwapSet;
  phase: number;
  transitionMs: number;
  logoScale: number;
  shouldReduceMotion: boolean;
};

function MobileLogoGrid({
  current,
  next,
  phase,
  transitionMs,
  logoScale,
  shouldReduceMotion,
}: MobileLogoGridProps) {
  const flattenedCurrent = [...current.top, ...current.bottom];
  const flattenedNext = [...next.top, ...next.bottom];

  return (
    <div className="grid grid-cols-2 gap-2.5">
      {flattenedCurrent.map((logo, index) => {
        const shouldSwap = phase >= index + 1;
        const visibleLogo = shouldSwap ? (flattenedNext[index] ?? logo) : logo;

        return (
          <LogoSlot
            key={`mobile-${index}`}
            logo={visibleLogo}
            tileLogo={logo}
            animateKey={visibleLogo.id}
            transitionMs={transitionMs}
            logoScale={logoScale}
            shouldReduceMotion={shouldReduceMotion}
          />
        );
      })}
    </div>
  );
}

type LogoSlotProps = {
  logo: LogoItem;
  tileLogo: LogoItem;
  animateKey: string;
  transitionMs: number;
  logoScale: number;
  shouldReduceMotion: boolean;
};

function LogoSlot({
  logo,
  tileLogo,
  animateKey,
  transitionMs,
  logoScale,
  shouldReduceMotion,
}: LogoSlotProps) {
  return (
    <div
      className={cn(
        "relative flex h-16 min-w-0 items-center justify-center overflow-hidden px-2.5 py-2 sm:h-24 sm:px-4 lg:h-[6.5rem]",
        tileLogo.tileClassName,
      )}
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={animateKey}
          initial={
            shouldReduceMotion
              ? false
              : {
                  opacity: 0,
                  x: 10,
                  y: 6,
                  scale: 0.97,
                  filter: "blur(1px)",
                }
          }
          animate={{
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
          }}
          exit={
            shouldReduceMotion
              ? { opacity: 0, x: 0, y: 0, scale: 1, filter: "blur(0px)" }
              : {
                  opacity: 0,
                  x: -10,
                  y: -6,
                  scale: 0.97,
                  filter: "blur(1px)",
                }
          }
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : {
                  duration: transitionMs / 1000,
                  ease: [0.16, 1, 0.3, 1],
                }
          }
          className="absolute inset-0 flex items-center justify-center will-change-transform"
        >
          {logo.image ? (
            <>
              <span
                aria-hidden="true"
                className="flex items-center justify-center"
                style={{ transform: `scale(${logoScale})` }}
              >
                <span
                  style={{
                    WebkitMaskImage: `url(${logo.image})`,
                    maskImage: `url(${logo.image})`,
                    WebkitMaskPosition: "center",
                    maskPosition: "center",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    WebkitMaskSize: "contain",
                    maskSize: "contain",
                  }}
                  className={cn(
                    "block h-9 w-28 bg-zinc-800 opacity-90 transition-colors dark:bg-zinc-300 sm:h-10 sm:w-36 lg:h-12 lg:w-44",
                    logo.className,
                  )}
                />
              </span>
              <span className="sr-only">{logo.name}</span>
            </>
          ) : (
            <span
              style={{ transform: `scale(${logoScale})` }}
              className="flex items-center justify-center"
            >
              <span
                className={cn(
                  "select-none whitespace-nowrap text-center leading-none tracking-normal text-zinc-800 dark:text-zinc-300",
                  logo.className,
                )}
              >
                {logo.name}
              </span>
            </span>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
