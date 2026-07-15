"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "mx-auto grid w-full grid-cols-1 gap-4 md:auto-rows-[14rem] md:grid-cols-8 lg:auto-rows-[15rem] lg:gap-5",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  children,
  interactiveHeader = false,
}: {
  className?: string;
  children?: React.ReactNode;
  interactiveHeader?: boolean;
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const cursorGlow = `radial-gradient(440px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(24, 24, 27, 0.075), transparent 42%)`;
  const cursorGlowBlur = `radial-gradient(1000px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(24, 24, 27, 0.11), transparent 32%)`;
  const borderGlow = `radial-gradient(300px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(24, 24, 27, 0.9), rgba(24, 24, 27, 0.4) 35%, transparent 65%)`;
  const borderGlowBlur = `radial-gradient(1000px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(24, 24, 27, 0.28), transparent 60%)`;

  const darkCursorGlow = `radial-gradient(440px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(245, 245, 245, 0.09), transparent 42%)`;
  const darkCursorGlowBlur = `radial-gradient(1000px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(245, 245, 245, 0.13), transparent 32%)`;
  const darkBorderGlow = `radial-gradient(300px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 0.95), rgba(212, 212, 216, 0.45) 35%, transparent 65%)`;
  const darkBorderGlowBlur = `radial-gradient(1000px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 0.3), transparent 60%)`;

  return (
    <div
      onMouseMove={interactiveHeader ? undefined : handleMouseMove}
      className={cn(
        "group/bento relative row-span-1 overflow-hidden rounded-2xl border border-border bg-background/80 shadow-sm backdrop-blur-xl transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(0,0,0,0.07)] dark:hover:shadow-[0_14px_34px_rgba(255,255,255,0.025)] flex flex-col",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-background/10 to-background/80 dark:to-background/85 z-0" />

      <div
        className="pointer-events-none absolute inset-0 z-[25] rounded-2xl opacity-0 mix-blend-multiply transition-opacity duration-250 group-hover/bento:opacity-100 dark:hidden"
        style={{
          background: cursorGlow,
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 z-[24] rounded-2xl opacity-0 mix-blend-multiply transition-opacity duration-250 group-hover/bento:opacity-100 dark:hidden"
        style={{
          background: cursorGlowBlur,
          filter: "blur(50px)",
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 z-[25] hidden rounded-2xl opacity-0 mix-blend-screen transition-opacity duration-250 group-hover/bento:opacity-100 dark:block"
        style={{
          background: darkCursorGlow,
        }}
      />

      <div
        className="pointer-events-none absolute inset-0 z-[24] hidden rounded-2xl opacity-0 mix-blend-screen transition-opacity duration-250 group-hover/bento:opacity-100 dark:block"
        style={{
          background: darkCursorGlowBlur,
          filter: "blur(50px)",
        }}
      />

      <div className="pointer-events-none absolute inset-0 z-30 rounded-2xl opacity-0 transition-opacity duration-250 group-hover/bento:opacity-100 dark:hidden">
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl p-px"
          style={{
            background: borderGlow,
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl p-px blur-md"
          style={{
            background: borderGlowBlur,
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 z-30 hidden rounded-2xl opacity-0 transition-opacity duration-250 group-hover/bento:opacity-100 dark:block">
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl p-px"
          style={{
            background: darkBorderGlow,
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl p-px blur-md"
          style={{
            background: darkBorderGlowBlur,
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
      </div>

      <div className="relative z-20 flex h-full flex-col">{children}</div>
    </div>
  );
};
