"use client";

import React, { forwardRef } from "react";

type PoweredByNodeProps = React.HTMLAttributes<HTMLDivElement>;

const topBottomPinPositions = [15, 29, 43, 57, 71, 85] as const;
const sidePinPositions = [36, 64] as const;

function Pin({
  className = "",
  style,
  side,
  index,
}: {
  className?: string;
  style?: React.CSSProperties;
  side: "top" | "bottom" | "left" | "right";
  index: number;
}) {
  return (
    <span
      aria-hidden="true"
      data-pin-side={side}
      data-pin-index={index}
      className={`absolute rounded-[2px] border ${className}`}
      style={{
        ...style,
        borderColor: "var(--foundation-pin-border)",
        background: "var(--foundation-pin-bg)",
        boxShadow: "0 0 10px var(--foundation-pin-shadow)",
      }}
    />
  );
}

const PoweredByNode = forwardRef<HTMLDivElement, PoweredByNodeProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <div
        aria-hidden="true"
        className={`relative inline-block ${className}`}
        style={{ width: 212, height: 86 }}
        {...props}
      >
        <div
          ref={ref}
          data-chip-body="true"
          className="absolute left-1/2 top-1/2 flex h-[64px] w-[200px] -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-visible rounded-[16px] border"
          style={{
            borderColor: "var(--foundation-chip-border)",
            background: "var(--foundation-chip-bg)",
            boxShadow: "var(--foundation-chip-shadow)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 rounded-[16px]"
            style={{ background: "var(--foundation-chip-top-glow)" }}
          />
          <div
            className="pointer-events-none absolute inset-x-4 top-0 h-px"
            style={{ background: "var(--foundation-chip-top-line)" }}
          />
          <div
            className="pointer-events-none absolute inset-x-5 top-2 h-6 rounded-full blur-md"
            style={{ background: "var(--foundation-chip-upper-bloom)" }}
          />

          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[16px]">
            <div
              className="chip-shimmer"
              style={{ background: "var(--foundation-chip-shimmer)" }}
            />
          </div>

          <div
            data-connectors="true"
            data-side="top"
            className="pointer-events-none absolute inset-x-0 -top-[10px]"
          >
            {topBottomPinPositions.map((left, index) => (
              <Pin
                key={`top-${left}`}
                side="top"
                index={index}
                className="h-[10px] w-[7px] -translate-x-1/2"
                style={{ left: `${left}%` }}
              />
            ))}
          </div>

          <div
            data-connectors="true"
            data-side="bottom"
            className="pointer-events-none absolute inset-x-0 -bottom-0"
          >
            {topBottomPinPositions.map((left, index) => (
              <Pin
                key={`bottom-${left}`}
                side="bottom"
                index={index}
                className="h-[10px] w-[7px] -translate-x-1/2"
                style={{ left: `${left}%` }}
              />
            ))}
          </div>

          <div
            data-connectors="true"
            data-side="left"
            className="pointer-events-none absolute inset-y-0 -left-[10px]"
          >
            {sidePinPositions.map((top, index) => (
              <Pin
                key={`left-${top}`}
                side="left"
                index={index}
                className="h-[7px] w-[10px] -translate-y-1/2"
                style={{ top: `${top}%` }}
              />
            ))}
          </div>

          <div
            data-connectors="true"
            data-side="right"
            className="pointer-events-none absolute inset-y-0 -right-0"
          >
            {sidePinPositions.map((top, index) => (
              <Pin
                key={`right-${top}`}
                side="right"
                index={index}
                className="h-[7px] w-[10px] -translate-y-1/2"
                style={{ top: `${top}%` }}
              />
            ))}
          </div>

          <span
            className="relative z-[1] text-[14px] font-semibold tracking-[-0.04em]"
            style={{ color: "var(--foundation-chip-text)" }}
          >
            Powered By
          </span>
        </div>

        <style jsx>{`
          .chip-shimmer {
            position: absolute;
            inset: -30%;
            transform: translateX(-130%) skewX(-22deg);
            animation: chipShimmer 3.8s cubic-bezier(0.22, 1, 0.36, 1) infinite;
          }

          @keyframes chipShimmer {
            0%,
            14% {
              transform: translateX(-130%) skewX(-22deg);
              opacity: 0;
            }
            20% {
              opacity: 1;
            }
            54% {
              transform: translateX(130%) skewX(-22deg);
              opacity: 0.9;
            }
            100% {
              transform: translateX(130%) skewX(-22deg);
              opacity: 0;
            }
          }
        `}</style>
      </div>
    );
  },
);

PoweredByNode.displayName = "PoweredByNode";

export default PoweredByNode;
