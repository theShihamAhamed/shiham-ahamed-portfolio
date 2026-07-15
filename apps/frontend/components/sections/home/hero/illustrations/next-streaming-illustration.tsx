"use client";

import {
  motion,
  useInView,
  type TargetAndTransition,
  type Transition,
} from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const basePulseTransition = {
  ease: "easeOut",
  duration: 4.8,
  repeat: Infinity,
  delay: 1,
} satisfies Transition;

const hoverPulseTransition = {
  delay: 0,
  repeatDelay: 0,
  duration: 2.35,
} satisfies Transition;

/**
 * The pulse should reach the end, stay for a little moment,
 * and only then fade out.
 */
const gradientTimes = [0, 0.72, 0.9, 1];
const opacityTimes = [0, 0.04, 0.92, 1];

const PULSE_WIDTH_SCALE = 1.28;
const PULSE_GLOW = "drop-shadow(0 0 5px rgba(50,145,255,0.65))";

type PulsePosition = "bottom-left" | "bottom-right" | "top-left" | "top-right";

type PulseConfig = {
  svg: {
    width: number;
    height: number;
    viewBox: string;
    className: string;
  };
  d: string;
  strokeWidth: number;
  gradientFrom: TargetAndTransition;
  gradientTo: TargetAndTransition;
  delayOffset: number;
  repeatDelay: number;
};

const pulseConfig = {
  "bottom-left": {
    svg: {
      width: 237,
      height: 35,
      viewBox: "0 0 237 35",
      className:
        "absolute bottom-8 left-0 z-[1] [mask:linear-gradient(90deg,#fff_60%,#0000)] [-webkit-mask:linear-gradient(90deg,#fff_60%,#0000)] [-webkit-mask-composite:destination-in]",
    },
    d: "M0.5 33.4999L59 33.5C59.5523 33.5 60 33.0619 60 32.5096C60 28.5146 60 13.282 60 2.49741C60 1.94512 60.4477 1.49997 61 1.49997L91 1.49997C91.5523 1.49997 92 1.94769 92 2.49997L92 10C92 14.1422 95.3579 17.5 99.5 17.5L236 17.5001",
    strokeWidth: 1.1808028200466651,
    gradientFrom: {
      x1: 0,
      x2: -60,
      y1: 40,
      y2: 120,
    },
    gradientTo: {
      x1: [0, 360, 360, 360],
      x2: [-60, 200, 200, 200],
      y1: [40, 200, 200, 200],
      y2: [120, 80, 80, 80],
    },
    delayOffset: 3,
    repeatDelay: 4,
  },

  "bottom-right": {
    svg: {
      width: 221,
      height: 67,
      viewBox: "0 0 221 67",
      className:
        "absolute bottom-12 right-0 z-[1] [mask:linear-gradient(270deg,#fff_60%,#0000)] [-webkit-mask:linear-gradient(270deg,#fff_60%,#0000)] [-webkit-mask-composite:destination-in]",
    },
    d: "M220.5 1.5H178C177.448 1.5 177 1.94772 177 2.5V32.5C177 33.0523 176.552 33.5 176 33.5H130C129.448 33.5 129 33.9477 129 34.5V58C129 62.1421 125.642 65.5 121.5 65.5H1",
    strokeWidth: 1.6722164629318286,
    gradientFrom: {
      x1: 220,
      x2: 259,
      y1: 0,
      y2: 0,
    },
    gradientTo: {
      x1: [220, 50, 50, 50],
      x2: [259, 80, 80, 80],
      y1: [0, 220, 220, 220],
      y2: [0, 40, 160, 160],
    },
    delayOffset: 0.5,
    repeatDelay: 2,
  },

  "top-left": {
    svg: {
      width: 237,
      height: 51,
      viewBox: "0 0 237 51",
      className:
        "absolute left-0 top-4 z-[1] [mask:linear-gradient(90deg,#fff_50%,#0000)] [-webkit-mask:linear-gradient(90deg,#fff_50%,#0000)] [-webkit-mask-composite:destination-in]",
    },
    d: "M0.5 1.5L43 1.5C43.5523 1.5 44 1.94772 44 2.5L44 48.5C44 49.0523 44.4477 49.5 45 49.5L91 49.5C91.5523 49.5 92 49.0523 92 48.5L92 41C92 36.8579 95.3579 33.5 99.5 33.5L236 33.5",
    strokeWidth: 1,
    gradientFrom: {
      x1: 0,
      x2: -40,
      y1: 0,
      y2: -40,
    },
    gradientTo: {
      x1: [0, 380, 380, 380],
      x2: [-40, 260, 260, 260],
      y1: [0, 0, 0, 0],
      y2: [-40, 50, 50, 50],
    },
    delayOffset: 2,
    repeatDelay: 2.5,
  },

  "top-right": {
    svg: {
      width: 130,
      height: 209,
      viewBox: "0 0 130 209",
      className:
        "absolute right-7 top-px z-[1] [mask:linear-gradient(270deg,#fff_50%,#0000)] [-webkit-mask:linear-gradient(270deg,#fff_50%,#0000)] [-webkit-mask-composite:destination-in]",
    },
    d: "M129 0.5V95C129 95.5523 128.552 96 128 96H66C65.4477 96 65 96.4477 65 97V200C65 204.142 61.6421 207.5 57.5 207.5H1",
    strokeWidth: 1.969113484461559,
    gradientFrom: {
      x1: 0,
      x2: 0,
      y1: 0,
      y2: -40,
    },
    gradientTo: {
      x1: [0, -220, -220, -220],
      x2: [0, -160, -160, -160],
      y1: [0, 160, 160, 160],
      y2: [-40, 80, 80, 80],
    },
    delayOffset: 4,
    repeatDelay: 6,
  },
} satisfies Record<PulsePosition, PulseConfig>;

const getPulseTransition = (
  hover: boolean,
  delayOffset: number,
  repeatDelay: number,
): Transition => {
  const baseDelay =
    typeof basePulseTransition.delay === "number"
      ? basePulseTransition.delay
      : 0;

  if (hover) {
    return {
      ...basePulseTransition,
      ...hoverPulseTransition,
      delay: 0,
      repeatDelay: 0,
      times: gradientTimes,
    };
  }

  return {
    ...basePulseTransition,
    delay: baseDelay + delayOffset,
    repeatDelay,
    times: gradientTimes,
  };
};

const getOpacityTransition = (
  hover: boolean,
  delayOffset: number,
  repeatDelay: number,
): Transition => {
  const baseDelay =
    typeof basePulseTransition.delay === "number"
      ? basePulseTransition.delay
      : 0;

  if (hover) {
    return {
      ease: "easeOut",
      duration: 2.35,
      repeat: Infinity,
      repeatDelay: 0,
      delay: 0,
      times: opacityTimes,
    };
  }

  return {
    ease: "easeOut",
    duration: 4.8,
    repeat: Infinity,
    repeatDelay,
    delay: baseDelay + delayOffset,
    times: opacityTimes,
  };
};

type StreamingPulseProps = {
  position: PulsePosition;
  hover: boolean;
  hoverRunId: number;
  isInView: boolean;
};

const StreamingPulse = ({
  position,
  hover,
  hoverRunId,
  isInView,
}: StreamingPulseProps) => {
  const rawId = useId();
  const id = `stream-${position}-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const config = pulseConfig[position];

  const gradientTransition = getPulseTransition(
    hover,
    config.delayOffset,
    config.repeatDelay,
  );

  const opacityTransition = getOpacityTransition(
    hover,
    config.delayOffset,
    config.repeatDelay,
  );

  return (
    <svg
      key={`${position}-${hover ? `hover-${hoverRunId}` : "normal"}`}
      data-position={position}
      className={config.svg.className}
      fill="none"
      height={config.svg.height}
      viewBox={config.svg.viewBox}
      width={config.svg.width}
      aria-hidden="true"
    >
      <motion.path
        d={config.d}
        stroke={`url(#${id})`}
        strokeLinecap="round"
        strokeWidth={config.strokeWidth * PULSE_WIDTH_SCALE}
        style={{ filter: PULSE_GLOW }}
        initial={{ opacity: 0 }}
        animate={
          isInView
            ? {
                opacity: [0, 1, 1, 0],
              }
            : {
                opacity: 0,
              }
        }
        transition={opacityTransition}
      />

      <defs>
        <motion.linearGradient
          id={id}
          gradientUnits="userSpaceOnUse"
          initial={config.gradientFrom}
          animate={isInView ? config.gradientTo : config.gradientFrom}
          transition={gradientTransition}
        >
          <stop offset="0" stopColor="#3291FF" stopOpacity="0" />
          <stop offset="0.42" stopColor="#3291FF" stopOpacity="1" />
          <stop offset="0.62" stopColor="#61DAFB" stopOpacity="1" />
          <stop offset="1" stopColor="#61DAFB" stopOpacity="0" />
        </motion.linearGradient>
      </defs>
    </svg>
  );
};

type StreamingIllustrationProps = {
  hover: boolean;
  hoverRunId: number;
  className?: string;
  windowClassName?: string;
};

const StreamingIllustration = ({
  hover,
  hoverRunId,
  className,
  windowClassName,
}: StreamingIllustrationProps) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const isInView = useInView(ref, {
    once: true,
    margin: "-35% 0px -35% 0px",
  });

  const [avatarSmall, setAvatarSmall] = useState(false);
  const [swapRects, setSwapRects] = useState(false);

  useEffect(() => {
    if (!isInView) return;

    const avatarTimer = window.setInterval(() => {
      setAvatarSmall((prev) => !prev);
    }, 5000);

    const rectTimer = window.setInterval(() => {
      setSwapRects((prev) => !prev);
    }, 8000);

    return () => {
      window.clearInterval(avatarTimer);
      window.clearInterval(rectTimer);
    };
  }, [isInView]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn(
        "relative h-[258px] w-[392px] max-w-full shrink-0 overflow-hidden [contain:strict]",
        className,
      )}
    >
      {/* Animated pulse lines */}
      <StreamingPulse
        key={`bottom-left-${hover}-${hoverRunId}`}
        hover={hover}
        hoverRunId={hoverRunId}
        isInView={isInView}
        position="bottom-left"
      />

      <StreamingPulse
        key={`bottom-right-${hover}-${hoverRunId}`}
        hover={hover}
        hoverRunId={hoverRunId}
        isInView={isInView}
        position="bottom-right"
      />

      <StreamingPulse
        key={`top-left-${hover}-${hoverRunId}`}
        hover={hover}
        hoverRunId={hoverRunId}
        isInView={isInView}
        position="top-left"
      />

      <StreamingPulse
        key={`top-right-${hover}-${hoverRunId}`}
        hover={hover}
        hoverRunId={hoverRunId}
        isInView={isInView}
        position="top-right"
      />

      {/* Window */}
      <div
        className={cn(
          "absolute left-1/2 top-1/2 z-[2] h-[161px] w-[209px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border border-[#e0e0e0] bg-white bg-clip-padding shadow-[0_2px_2px_rgba(0,0,0,0.04),0_0_24px_rgba(0,0,0,0.04)] dark:border-[#333] dark:bg-black dark:shadow-[0_0_24px_rgba(255,255,255,0.12)]",
          windowClassName,
        )}
      >
        {/* Toolbar */}
        <div
          data-toolbar="true"
          className="flex h-[17px] items-center gap-1 border-b border-[#e0e0e0] bg-[#fafafa] pl-2 dark:border-[#333] dark:bg-[#111]"
        >
          <div
            data-control="true"
            className="h-1 w-1 rounded-full shadow-[0_0_0_1px_rgba(0,0,0,0.1)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.2)]"
          />
          <div
            data-control="true"
            className="h-1 w-1 rounded-full shadow-[0_0_0_1px_rgba(0,0,0,0.1)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.2)]"
          />
          <div
            data-control="true"
            className="h-1 w-1 rounded-full shadow-[0_0_0_1px_rgba(0,0,0,0.1)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.2)]"
          />
        </div>

        {/* Content */}
        <div data-content="true" className="p-4">
          <div className="flex flex-row items-stretch justify-start gap-4">
            {/* First column */}
            <div
              data-column-first="true"
              className="flex h-full w-8 shrink-0 flex-col items-stretch justify-start gap-2"
            >
              <motion.div
                data-avatar="true"
                animate={{
                  borderRadius: avatarSmall ? 16 : 2,
                  width: avatarSmall ? 16 : 32,
                  height: avatarSmall ? 16 : 32,
                }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-center border border-black/10 shadow-[0_1px_1px_rgba(0,0,0,0.04)] dark:border-white/20"
              >
                <svg
                  aria-label="Vercel logomark"
                  height="10"
                  role="img"
                  viewBox="0 0 74 64"
                  className="h-[40%] w-[40%] overflow-visible text-[#444]"
                >
                  <path
                    d="M37.5896 0.25L74.5396 64.25H0.639648L37.5896 0.25Z"
                    fill="currentColor"
                  />
                </svg>
              </motion.div>

              <div className="flex flex-col items-stretch justify-start gap-1">
                <div
                  data-line="true"
                  data-size="full"
                  className="h-1 w-full rounded-[1px] bg-black/15 dark:bg-white/30"
                />
                <div
                  data-line="true"
                  data-size="half"
                  data-variant="dim"
                  className="h-1 w-1/2 rounded-[1px] bg-black/10 dark:bg-white/20"
                />
                <div
                  data-line="true"
                  data-variant="dim"
                  className="h-1 w-full rounded-[1px] bg-black/10 dark:bg-white/20"
                />
                <div
                  data-line="true"
                  data-variant="dim"
                  className="h-1 w-full rounded-[1px] bg-black/10 dark:bg-white/20"
                />
                <div
                  data-line="true"
                  data-size="half"
                  data-variant="dim"
                  className="h-1 w-1/2 rounded-[1px] bg-black/10 dark:bg-white/20"
                />
              </div>
            </div>

            {/* Second column */}
            <div data-column-second="true" className="h-full w-full">
              <div
                data-header="true"
                className="mb-2 flex h-2 flex-row items-center justify-between"
              >
                <div
                  data-avatar="true"
                  className="h-2 w-2 rounded-full bg-black/10 dark:bg-white/20"
                />
                <div
                  data-btn="true"
                  className="h-2 w-8 rounded-full bg-[#444] shadow-[0_1px_1px_rgba(0,0,0,0.04)]"
                />
              </div>

              <div
                data-nav="true"
                className="mb-3 flex h-1 flex-row items-center justify-start gap-1"
              >
                <div
                  data-line="true"
                  className="h-1 w-4 rounded-[1px] bg-black/15 dark:bg-white/30"
                />
                <div
                  data-line="true"
                  data-variant="dim"
                  className="h-1 w-full rounded-[1px] bg-black/10 dark:bg-white/20"
                />
              </div>

              <div data-rectangles="true" className="flex w-full gap-2">
                <div className="flex w-full flex-col gap-2">
                  {[0, 1, 2].map((item) => (
                    <motion.div
                      key={`left-${item}`}
                      data-rectangle="true"
                      animate={{ height: swapRects ? 48 : 32 }}
                      transition={{ duration: 0.8 }}
                      className="w-full rounded-[2px] border border-black/10 shadow-[0_1px_1px_rgba(0,0,0,0.04)] dark:border-white/20"
                    />
                  ))}
                </div>

                <div className="flex w-full flex-col gap-2">
                  {[0, 1, 2].map((item) => (
                    <motion.div
                      key={`right-${item}`}
                      data-rectangle="true"
                      data-size="large"
                      animate={{ height: swapRects ? 32 : 48 }}
                      transition={{ duration: 0.8 }}
                      className="w-full rounded-[2px] border border-black/10 shadow-[0_1px_1px_rgba(0,0,0,0.04)] dark:border-white/20"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NextStreamingFeatureCard = () => {
  const [hover, setHover] = useState(false);
  const [hoverRunId, setHoverRunId] = useState(0);

  return (
    <article
      onMouseEnter={() => {
        setHover(true);
        setHoverRunId((prev) => prev + 1);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
      className="z-0 group relative flex max-h-[380px] w-full flex-col overflow-hidden rounded-xl border border-border bg-transparent p-6 transition-[border-color,background] duration-150 hover:border-muted-foreground/30 hover:bg-muted/30 dark:hover:bg-white/[0.02]"
    >
      <div data-illustration="true" className="-mx-6 -mt-6 flex justify-center">
        <StreamingIllustration hover={hover} hoverRunId={hoverRunId} />
      </div>
    </article>
  );
};

export default NextStreamingFeatureCard;

type NextStreamingIlustrationProps = {
  hover?: boolean;
  hoverRunId?: number;
};

export const NextStreamingIlustration = ({
  hover = false,
  hoverRunId = 0,
}: NextStreamingIlustrationProps) => {
  return (
    <article className="z-0 group relative flex max-h-[380px] w-full flex-col overflow-hidden bg-transparent ">
      <div data-illustration="true" className="-mx-6 -mt-6 flex justify-center">
        <StreamingIllustration hover={hover} hoverRunId={hoverRunId} />
      </div>
    </article>
  );
};
