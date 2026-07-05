"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

import { motionTokens } from "@/components/motion/motion-tokens";

type HeroMotionStep = {
  y: number;
  duration: number;
  delay: number;
};

type HeroEntranceProps = {
  badge: ReactNode;
  title: ReactNode;
  description: ReactNode;
  actions: ReactNode;
  copyEmail?: ReactNode;
};

type HeroEntranceItemProps = HeroMotionStep & {
  children: ReactNode;
  shouldReduceMotion: boolean;
};

const heroMotion = {
  badge: {
    y: 5,
    duration: 0.34,
    delay: 0.04,
  },
  title: {
    y: 10,
    duration: 0.58,
    delay: 0.12,
  },
  description: {
    y: 7,
    duration: 0.44,
    delay: 0.26,
  },
  actions: {
    y: 5,
    duration: 0.42,
    delay: 0.38,
  },
  copyEmail: {
    y: 3,
    duration: 0.34,
    delay: 0.5,
  },
} as const satisfies Record<string, HeroMotionStep>;

function HeroEntranceItem({
  children,
  delay,
  duration,
  shouldReduceMotion,
  y,
}: HeroEntranceItemProps) {
  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y }}
      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{
        delay: shouldReduceMotion ? 0 : delay,
        duration: shouldReduceMotion ? 0.01 : duration,
        ease: motionTokens.ease,
      }}
    >
      {children}
    </motion.div>
  );
}

export function HeroEntrance({
  actions,
  badge,
  copyEmail,
  description,
  title,
}: HeroEntranceProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;

  return (
    <div className="w-full max-w-4xl text-center">
      <HeroEntranceItem
        {...heroMotion.badge}
        shouldReduceMotion={shouldReduceMotion}
      >
        {badge}
      </HeroEntranceItem>
      <HeroEntranceItem
        {...heroMotion.title}
        shouldReduceMotion={shouldReduceMotion}
      >
        {title}
      </HeroEntranceItem>
      <HeroEntranceItem
        {...heroMotion.description}
        shouldReduceMotion={shouldReduceMotion}
      >
        {description}
      </HeroEntranceItem>
      <HeroEntranceItem
        {...heroMotion.actions}
        shouldReduceMotion={shouldReduceMotion}
      >
        {actions}
      </HeroEntranceItem>
      {copyEmail ? (
        <HeroEntranceItem
          {...heroMotion.copyEmail}
          shouldReduceMotion={shouldReduceMotion}
        >
          {copyEmail}
        </HeroEntranceItem>
      ) : null}
    </div>
  );
}
