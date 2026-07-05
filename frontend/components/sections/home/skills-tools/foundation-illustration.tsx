"use client";

import React, { useEffect, useId, useMemo, useRef } from "react";

type Point = { x: number; y: number };

type CardBox = {
  x: number;
  y: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
};

type PinGroups = {
  top: Point[];
  bottom: Point[];
  left: Point[];
  right: Point[];
};

export type FoundationLayoutData = {
  width: number;
  height: number;
  chip: { x: number; y: number; width: number; height: number };
  pins: PinGroups;
  cards: CardBox[];
} | null;

type PulsePathProps = {
  d: string;
  colors: [string, string?];
  duration?: number;
  delay?: number;
  strokeWidth?: number;
  baseStroke: string;
  reverse?: boolean;
};

type RouteGlow = {
  x: number;
  y: number;
  colors: [string, string?];
  width?: number;
};

type GlowBlendMode = "screen" | "multiply";

const round = (n: number) => Math.round(n * 100) / 100;
const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

function pointsToPath(points: Point[]) {
  return points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${round(point.x)} ${round(point.y)}`,
    )
    .join(" ");
}

function StaticPath({
  d,
  stroke,
  strokeWidth = 1.1,
}: {
  d: string;
  stroke: string;
  strokeWidth?: number;
}) {
  return (
    <path
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

function PulsePath({
  d,
  colors,
  duration = 3.6,
  delay = 0,
  strokeWidth = 2.15,
  baseStroke,
  reverse = false,
}: PulsePathProps) {
  const gradientId = useId().replace(/:/g, "");
  const pathRef = useRef<SVGPathElement>(null);
  const gradientRef = useRef<SVGLinearGradientElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    const gradient = gradientRef.current;
    if (!path || !gradient) return;

    const total = path.getTotalLength();
    const visibleSpan = Math.min(0.2, 120 / total);

    const pauseAtEnd = 0.08;
    const cycleLength = 1 + visibleSpan + pauseAtEnd;

    let raf = 0;

    const animate = (time: number) => {
      const rawProgress = (time / 1000 / duration + delay) % cycleLength;

      const head = Math.min(rawProgress, 1);
      const tail = Math.max(0, rawProgress - visibleSpan);

      const clampedTail = Math.min(tail, 1);
      const clampedHead = Math.min(Math.max(head, 0.001), 1);

      const from = reverse ? 1 - clampedHead : clampedTail;
      const to = reverse ? 1 - clampedTail : clampedHead;

      const p1 = path.getPointAtLength(from * total);
      const p2 = path.getPointAtLength(to * total);

      gradient.setAttribute("x1", `${p1.x}`);
      gradient.setAttribute("y1", `${p1.y}`);
      gradient.setAttribute("x2", `${p2.x}`);
      gradient.setAttribute("y2", `${p2.y}`);

      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [delay, duration, reverse]);

  const c1 = colors[0];
  const c2 = colors[1] ?? colors[0];

  return (
    <>
      <StaticPath d={d} stroke={baseStroke} strokeWidth={1.15} />

      <defs>
        <linearGradient
          id={gradientId}
          ref={gradientRef}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={c1} stopOpacity="0" />
          <stop offset="0.08" stopColor={c1} stopOpacity="1" />
          <stop offset="0.55" stopColor={c2} stopOpacity="1" />
          <stop offset="1" stopColor={c2} stopOpacity="0" />
        </linearGradient>
      </defs>

      <path
        ref={pathRef}
        d={d}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}

function Dot({ x, y, fill, stroke }: Point & { fill: string; stroke: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r="4" fill={fill} />
      <circle cx={x} cy={y} r="3.5" stroke={stroke} />
    </g>
  );
}

function CardGlow({
  x,
  y,
  colors,
  width = 72,
  blendMode,
}: {
  x: number;
  y: number;
  colors: [string, string?];
  width?: number;
  blendMode: GlowBlendMode;
}) {
  const gradientId = useId().replace(/:/g, "");
  const [c1, c2 = c1] = colors;

  return (
    <g
      pointerEvents="none"
      style={{ mixBlendMode: blendMode as React.CSSProperties["mixBlendMode"] }}
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1={x - width}
          y1={y}
          x2={x + width}
          y2={y}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={c1} stopOpacity="0" />
          <stop offset="18%" stopColor={c1} stopOpacity="0.34" />
          <stop offset="50%" stopColor={c2} stopOpacity="0.9" />
          <stop offset="82%" stopColor={c1} stopOpacity="0.34" />
          <stop offset="100%" stopColor={c1} stopOpacity="0" />
        </linearGradient>
      </defs>

      <ellipse
        cx={x}
        cy={y}
        rx={width}
        ry="18"
        fill={`url(#${gradientId})`}
        opacity="0.12"
        filter="url(#card-glow-blur)"
      />
      <ellipse
        cx={x}
        cy={y}
        rx={width * 0.55}
        ry="8"
        fill={`url(#${gradientId})`}
        opacity="0.2"
        filter="url(#card-glow-blur)"
      />
      <rect
        x={x - width * 0.7}
        y={y - 1.4}
        width={width * 1.4}
        height="2.8"
        rx="999"
        fill={`url(#${gradientId})`}
        opacity="0.9"
      />
    </g>
  );
}

function horizontalNodePath(start: Point, endX: number) {
  return pointsToPath([start, { x: endX, y: start.y }]);
}

function verticalNodePath(start: Point, endY: number) {
  return pointsToPath([start, { x: start.x, y: endY }]);
}

function bentLeftNodePath(start: Point, bendX: number, endY: number) {
  return pointsToPath([start, { x: bendX, y: start.y }, { x: bendX, y: endY }]);
}

function bottomToTopCardPath(
  start: Point,
  stemX: number,
  cardTop: number,
  elbowY: number,
) {
  return pointsToPath([
    start,
    { x: start.x, y: elbowY },
    { x: stemX, y: elbowY },
    { x: stemX, y: cardTop },
  ]);
}

function sideToCardPath(start: Point, stemX: number, cardTop: number) {
  return pointsToPath([
    start,
    { x: stemX, y: start.y },
    { x: stemX, y: cardTop },
  ]);
}

function bottomToBottomCardPath(
  start: Point,
  stemX: number,
  laneY: number,
  cardTop: number,
) {
  return pointsToPath([
    start,
    { x: start.x, y: laneY },
    { x: stemX, y: laneY },
    { x: stemX, y: cardTop },
  ]);
}

export default function FoundationIllustration({
  layout,
}: {
  layout: FoundationLayoutData;
}) {
  const scene = useMemo(() => {
    if (!layout) return null;

    const { pins, chip, width, height } = layout;

    if (
      pins.left.length < 2 ||
      pins.right.length < 2 ||
      pins.bottom.length < 6 ||
      layout.cards.length < 4
    ) {
      return null;
    }

    const cards = [...layout.cards].sort((a, b) => {
      const sameRow = Math.abs(a.top - b.top) < 48;
      if (!sameRow) return a.top - b.top;
      return a.left - b.left;
    }) as [CardBox, CardBox, CardBox, CardBox];

    const [card1, card2, card3, card4] = cards;
    const chipBottom = chip.y + chip.height;
    const isMobile = width < 768;

    const BLUE_BURN = [
      "var(--foundation-blue-start)",
      "var(--foundation-blue-end)",
    ] as [string, string];
    const GREEN_BURN = [
      "var(--foundation-green-start)",
      "var(--foundation-green-end)",
    ] as [string, string];
    const YELLOW_BURN = [
      "var(--foundation-yellow-start)",
      "var(--foundation-yellow-end)",
    ] as [string, string];
    const RED_BURN = [
      "var(--foundation-red-start)",
      "var(--foundation-red-end)",
    ] as [string, string];

    const staticStroke = "var(--foundation-static-stroke)";
    const dotFill = "var(--foundation-dot-fill)";
    const dotStroke = "var(--foundation-dot-stroke)";
    const glowBlendMode = "var(--foundation-glow-blend)";

    if (isMobile) {
      const mobileCards = [card1, card2, card3, card4];
      const mobileStarts = [
        pins.bottom[0],
        pins.bottom[1],
        pins.bottom[4],
        pins.bottom[5],
      ];
      const mobileColors = [
        BLUE_BURN,
        GREEN_BURN,
        YELLOW_BURN,
        RED_BURN,
      ] as const;

      const animatedRoutes = mobileCards.map((card, index) => {
        const start = mobileStarts[index] ?? pins.bottom[index];
        const stemX = round(
          clamp(card.left + card.width * 0.2, card.left + 24, card.right - 28),
        );
        const laneY = round(
          Math.min(card.top - 20, chipBottom + 24 + index * 16),
        );
        const glowX = round(clamp(stemX, card.left + 54, card.right - 54));

        return {
          d: bottomToBottomCardPath(start, stemX, laneY, card.top),
          colors: mobileColors[index],
          duration: 3.2 + index * 0.22,
          delay: index * 0.1,
          glow: {
            x: glowX,
            y: card.top + 10,
            colors: mobileColors[index],
            width: 52,
          } satisfies RouteGlow,
        };
      });

      return {
        width,
        height,
        staticRoutes: [] as { d: string; dot: Point }[],
        animatedRoutes,
        connectionDots: [] as Point[],
        glows: animatedRoutes.map((route) => route.glow),
        staticStroke,
        dotFill,
        dotStroke,
        glowBlendMode,
      };
    }

    const bottomCardLaneY = round(
      Math.min(card3.top, card4.top) -
        clamp((Math.min(card3.top, card4.top) - chipBottom) * 0.3, 34, 48),
    );

    const card1StemX = round(
      clamp(card1.left + card1.width * 0.56, card1.left + 46, card1.right - 46),
    );

    const card2StemX = round(
      clamp(card2.left + card2.width * 0.74, card2.left + 54, card2.right - 44),
    );

    const card3StemX = round(
      clamp(card1.left + card1.width * 0.31, card1.left + 36, card1.right - 60),
    );

    const card4StemX = round(
      clamp(card4.left + card4.width * 0.48, card4.left + 46, card4.right - 46),
    );

    const firstRowElbowY = round(
      card1.top - clamp((card1.top - chipBottom) * 0.34, 18, 30),
    );

    const leftTopNodeX = round(clamp(chip.x - 78, 68, width * 0.32));
    const leftTopNodeY = round(pins.left[0].y - 25);

    const rightTopNodeX = round(
      clamp(chip.x + chip.width + 88, width * 0.66, width - 72),
    );

    const bottomNodeY3 = round(chipBottom + 40);
    const bottomNodeY5 = round(chipBottom + 44);

    const staticRoutes = [
      {
        d: bentLeftNodePath(pins.left[0], leftTopNodeX, leftTopNodeY),
        dot: { x: leftTopNodeX, y: leftTopNodeY },
      },
      {
        d: horizontalNodePath(pins.right[0], rightTopNodeX),
        dot: { x: rightTopNodeX, y: pins.right[0].y },
      },
      {
        d: verticalNodePath(pins.bottom[2], bottomNodeY3),
        dot: { x: pins.bottom[2].x, y: bottomNodeY3 },
      },
      {
        d: verticalNodePath(pins.bottom[4], bottomNodeY5),
        dot: { x: pins.bottom[4].x, y: bottomNodeY5 },
      },
    ];

    const animatedRoutes = [
      {
        d: bottomToTopCardPath(
          pins.bottom[0],
          card1StemX,
          card1.top,
          firstRowElbowY,
        ),
        colors: BLUE_BURN,
        duration: 3.35,
        delay: 0.02,
        glow: {
          x: round(clamp(card1StemX, card1.left + 68, card1.right - 68)),
          y: card1.top + 10,
          colors: BLUE_BURN,
          width: 72,
        } satisfies RouteGlow,
      },
      {
        d: sideToCardPath(pins.left[1], card3StemX, card3.top),
        colors: GREEN_BURN,
        duration: 3.6,
        delay: 0.16,
        glow: {
          x: round(clamp(card3StemX, card3.left + 68, card3.right - 68)),
          y: card3.top + 10,
          colors: GREEN_BURN,
          width: 72,
        } satisfies RouteGlow,
      },
      {
        d: sideToCardPath(pins.right[1], card2StemX, card2.top),
        colors: YELLOW_BURN,
        duration: 3.85,
        delay: 0.3,
        glow: {
          x: round(clamp(card2StemX, card2.left + 68, card2.right - 68)),
          y: card2.top + 10,
          colors: YELLOW_BURN,
          width: 72,
        } satisfies RouteGlow,
      },
      {
        d: bottomToBottomCardPath(
          pins.bottom[5],
          card4StemX,
          bottomCardLaneY,
          card4.top,
        ),
        colors: RED_BURN,
        duration: 4.1,
        delay: 0.44,
        glow: {
          x: round(clamp(card4StemX, card4.left + 68, card4.right - 68)),
          y: card4.top + 10,
          colors: RED_BURN,
          width: 72,
        } satisfies RouteGlow,
      },
    ];

    return {
      width,
      height,
      staticRoutes,
      animatedRoutes,
      connectionDots: staticRoutes.map((item) => item.dot),
      glows: animatedRoutes.map((route) => route.glow),
      staticStroke,
      dotFill,
      dotStroke,
      glowBlendMode,
    };
  }, [layout]);

  if (!scene) return null;

  return (
    <svg
      viewBox={`0 0 ${scene.width} ${scene.height}`}
      className="h-full w-full"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <filter
          id="card-glow-blur"
          x="-200%"
          y="-200%"
          width="400%"
          height="400%"
        >
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>

      {scene.staticRoutes.map((route, index) => (
        <StaticPath
          key={`static-${index}`}
          d={route.d}
          stroke={scene.staticStroke}
        />
      ))}

      {scene.animatedRoutes.map((route, index) => (
        <PulsePath
          key={`animated-${index}`}
          d={route.d}
          colors={route.colors}
          duration={route.duration}
          delay={route.delay}
          strokeWidth={2.15}
          baseStroke={scene.staticStroke}
          reverse
        />
      ))}

      {scene.glows.map((glow, index) => (
        <CardGlow
          key={`glow-${index}`}
          x={glow.x}
          y={glow.y}
          colors={glow.colors}
          width={glow.width}
          blendMode={scene.glowBlendMode as GlowBlendMode}
        />
      ))}

      {scene.connectionDots.map((dot, index) => (
        <Dot
          key={`dot-${index}`}
          x={dot.x}
          y={dot.y}
          fill={scene.dotFill}
          stroke={scene.dotStroke}
        />
      ))}
    </svg>
  );
}
