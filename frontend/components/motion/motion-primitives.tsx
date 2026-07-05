"use client";

import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Variants,
} from "motion/react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { motionTokens } from "@/components/motion/motion-tokens";

type Direction = "up" | "down" | "left" | "right" | "none";

type BaseMotionProps = Omit<
  HTMLMotionProps<"div">,
  "animate" | "children" | "initial" | "transition" | "variants" | "whileInView"
> & {
  children: ReactNode;
  delay?: number;
  direction?: Direction;
  distance?: number;
  duration?: number;
};

type StaggerContainerProps = BaseMotionProps & {
  delayChildren?: number;
  revealOnView?: boolean;
  staggerChildren?: number;
};

type SectionRevealProps = Omit<BaseMotionProps, "children"> & {
  children: ReactNode;
};

type MotionCardProps = Omit<
  HTMLMotionProps<"article">,
  "animate" | "children" | "initial" | "transition" | "variants" | "whileInView"
> & {
  children: ReactNode;
  delay?: number;
  direction?: Direction;
  distance?: number;
  duration?: number;
};

const viewport = {
  once: motionTokens.viewport.once,
  amount: motionTokens.viewport.amount,
};

const getOffset = (direction: Direction, distance: number) => {
  if (direction === "down") return { y: -distance };
  if (direction === "left") return { x: distance };
  if (direction === "right") return { x: -distance };
  if (direction === "none") return {};
  return { y: distance };
};

const getHiddenState = ({
  direction,
  distance,
  shouldReduceMotion,
}: {
  direction: Direction;
  distance: number;
  shouldReduceMotion: boolean;
}) => {
  if (shouldReduceMotion) {
    return { opacity: 0 };
  }

  return {
    opacity: 0,
    ...getOffset(direction, distance),
  };
};

const getVisibleState = ({
  shouldReduceMotion,
}: {
  shouldReduceMotion: boolean;
}) => {
  if (shouldReduceMotion) {
    return { opacity: 1 };
  }

  return {
    opacity: 1,
    x: 0,
    y: 0,
  };
};

const getTransition = ({
  delay = 0,
  duration = motionTokens.duration.base,
  shouldReduceMotion,
}: {
  delay?: number;
  duration?: number;
  shouldReduceMotion: boolean;
}) => ({
  delay: shouldReduceMotion ? 0 : delay,
  duration: shouldReduceMotion ? 0.01 : duration,
  ease: motionTokens.ease,
});

export function FadeIn({
  children,
  className,
  delay = 0,
  direction = "up",
  distance = motionTokens.distance.small,
  duration = motionTokens.duration.base,
  ...props
}: BaseMotionProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;

  return (
    <motion.div
      initial={getHiddenState({
        direction,
        distance,
        shouldReduceMotion,
      })}
      animate={getVisibleState({ shouldReduceMotion })}
      transition={getTransition({ delay, duration, shouldReduceMotion })}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function SectionReveal({
  children,
  className,
  delay = 0,
  direction = "up",
  distance = motionTokens.distance.small,
  duration = motionTokens.duration.base,
  ...props
}: SectionRevealProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;

  return (
    <motion.div
      initial={getHiddenState({
        direction,
        distance,
        shouldReduceMotion,
      })}
      whileInView={getVisibleState({ shouldReduceMotion })}
      viewport={viewport}
      transition={getTransition({ delay, duration, shouldReduceMotion })}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({
  children,
  className,
  delayChildren = 0,
  revealOnView = true,
  staggerChildren = motionTokens.stagger.medium,
  ...props
}: StaggerContainerProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;

  const variants: Variants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: shouldReduceMotion ? 0 : delayChildren,
        staggerChildren: shouldReduceMotion ? 0 : staggerChildren,
      },
    },
  };

  const motionProps = revealOnView
    ? {
        whileInView: "visible" as const,
        viewport,
      }
    : {
        animate: "visible" as const,
      };

  return (
    <motion.div
      initial="hidden"
      variants={variants}
      className={className}
      {...motionProps}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  direction = "up",
  distance = 6,
  duration = motionTokens.duration.base,
  ...props
}: BaseMotionProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;

  const variants: Variants = {
    hidden: getHiddenState({
      direction,
      distance,
      shouldReduceMotion,
    }),
    visible: {
      ...getVisibleState({ shouldReduceMotion }),
      transition: getTransition({ duration, shouldReduceMotion }),
    },
  };

  return (
    <motion.div variants={variants} className={className} {...props}>
      {children}
    </motion.div>
  );
}

export function MotionCard({
  children,
  className,
  delay = 0,
  direction = "up",
  distance = 6,
  duration = motionTokens.duration.base,
  ...props
}: MotionCardProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;

  return (
    <motion.article
      initial={getHiddenState({
        direction,
        distance,
        shouldReduceMotion,
      })}
      whileInView={getVisibleState({ shouldReduceMotion })}
      viewport={viewport}
      transition={getTransition({ delay, duration, shouldReduceMotion })}
      className={className}
      {...props}
    >
      {children}
    </motion.article>
  );
}

export function AnimatedPageHeader({
  children,
  className,
  delay = 0,
  ...props
}: BaseMotionProps) {
  return (
    <SectionReveal
      className={cn("max-w-3xl", className)}
      delay={delay}
      distance={motionTokens.distance.small}
      {...props}
    >
      {children}
    </SectionReveal>
  );
}
