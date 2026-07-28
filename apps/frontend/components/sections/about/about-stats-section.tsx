"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useInView, useReducedMotion } from "motion/react";

import type { AboutStat } from "@/types/about";

type Props = {
  stats: AboutStat[];
};

const COUNT_DURATION_MS = 900;
const subscribeToHydrationState = () => () => undefined;

const getSemanticText = (stat: AboutStat) => {
  if (stat.value === null) {
    return (
      stat.unavailableLabel ??
      `${stat.label} count temporarily unavailable`
    );
  }

  return [stat.value, stat.suffix, stat.label, stat.note]
    .filter(Boolean)
    .join(" ");
};

const AnimatedStatValue = ({
  stat,
  isInView,
}: {
  stat: AboutStat;
  isInView: boolean;
}) => {
  const targetValue = stat.value;
  const hasHydrated = useSyncExternalStore(
    subscribeToHydrationState,
    () => true,
    () => false,
  );
  const shouldReduceMotion = useReducedMotion() ?? false;
  const [displayValue, setDisplayValue] = useState(0);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    if (targetValue === null || !hasHydrated) return;

    if (shouldReduceMotion) {
      hasCompletedRef.current = true;
      return;
    }

    if (!isInView || hasCompletedRef.current) return;

    const startTime = performance.now();
    let frameId = 0;

    const updateValue = (currentTime: number) => {
      const progress = Math.min(
        Math.max((currentTime - startTime) / COUNT_DURATION_MS, 0),
        1,
      );
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setDisplayValue(Math.round(targetValue * easedProgress));

      if (progress < 1) {
        frameId = requestAnimationFrame(updateValue);
        return;
      }

      setDisplayValue(targetValue);
      hasCompletedRef.current = true;
    };

    frameId = requestAnimationFrame(updateValue);

    return () => cancelAnimationFrame(frameId);
  }, [hasHydrated, isInView, shouldReduceMotion, targetValue]);

  const visualValue =
    targetValue === null
      ? "\u2014"
      : !hasHydrated || shouldReduceMotion
        ? targetValue
        : displayValue;

  return (
    <span>
      {visualValue}
      {targetValue !== null ? stat.suffix : null}
    </span>
  );
};

const AboutStatsSection = ({ stats }: Props) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(sectionRef, {
    once: true,
    amount: 0.35,
  });

  return (
    <section
      ref={sectionRef}
      aria-label="Portfolio statistics"
      className="border-y border-border/60 bg-background py-10 sm:py-12 lg:py-14"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-10 text-center sm:flex-row sm:gap-0 sm:divide-x sm:divide-border/50">
          {stats.map((item) => (
            <div
              key={item.id}
              className="flex min-w-[160px] flex-col items-center px-8 sm:px-12 lg:px-16"
            >
              <span className="sr-only">{getSemanticText(item)}</span>

              <div aria-hidden="true">
                <div className="text-[2.5rem] font-bold leading-none tracking-[-0.055em] text-foreground sm:text-[3rem] lg:text-[3.25rem]">
                  <AnimatedStatValue stat={item} isInView={isInView} />
                </div>

                <div className="mt-2.5 text-base font-semibold leading-none tracking-[-0.02em] text-foreground">
                  {item.label}
                </div>

                <div className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.note}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutStatsSection;
