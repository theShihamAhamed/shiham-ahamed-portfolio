"use client";

import Link from "next/link";
import { useState, type FocusEvent } from "react";

import {
  BentoIllustrationLayer,
  GridPattern,
  TextSafetyFade,
} from "../illustrations/bento-illustrations";
import { ArrowUpRight } from "lucide-react";
import { NextStreamingIlustration } from "../../hero/illustrations/next-streaming-illustration";

const AboutCard = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoverRunId, setHoverRunId] = useState(0);

  const triggerIllustrationHover = () => {
    setIsHovered(true);
    setHoverRunId((prev) => prev + 1);
  };

  const handleBlur = (event: FocusEvent<HTMLAnchorElement>) => {
    const nextFocus = event.relatedTarget;

    if (nextFocus instanceof Node && event.currentTarget.contains(nextFocus)) {
      return;
    }

    setIsHovered(false);
  };

  return (
    <Link
      href="/about"
      aria-label="About Me"
      onMouseEnter={triggerIllustrationHover}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={triggerIllustrationHover}
      onBlurCapture={handleBlur}
      className="group/about relative flex min-h-[34rem] h-full w-full flex-col overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background md:min-h-0"
    >
      <BentoIllustrationLayer className="inset-3 overflow-hidden rounded-xl opacity-[0.22] group-hover/bento:opacity-[0.3] dark:opacity-[0.3] dark:group-hover/bento:opacity-[0.24]">
        <GridPattern className="text-foreground dark:text-white" />
      </BentoIllustrationLayer>

      <TextSafetyFade className="bg-gradient-to-r from-background from-[48%] via-background/86 via-[66%] to-transparent dark:from-background dark:from-[50%] dark:via-background/82 dark:via-[68%]" />
      <BentoIllustrationLayer className="z-1 top-40 sm:left-25 left-5 overflow-hidden rounded-xl">
        <NextStreamingIlustration hover={isHovered} hoverRunId={hoverRunId} />
      </BentoIllustrationLayer>

      <span
        aria-hidden="true"
        className="absolute right-5 top-5 z-20 flex size-10 translate-y-1 scale-95 items-center justify-center rounded-lg border border-border bg-background/85 text-foreground opacity-0 shadow-sm backdrop-blur-md transition-all duration-200 ease-out group-hover/bento:translate-y-0 group-hover/bento:scale-100 group-hover/bento:opacity-100 group-focus-visible/about:translate-y-0 group-focus-visible/about:scale-100 group-focus-visible/about:opacity-100 dark:bg-background/70 sm:right-6 sm:top-6"
      >
        <ArrowUpRight className="size-4" />
      </span>

      <div className="absolute inset-0 z-10 flex h-full flex-col justify-between gap-6 p-5 sm:p-6 lg:p-7">
        <div className="max-w-[32rem]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            About me
          </p>
          <h3 className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.03em] text-foreground sm:text-3xl lg:text-[1.9rem]">
            Software Engineering undergraduate building practical web products
          </h3>
        </div>

        <div className="max-w-[34rem]">
          <p className="text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            I&apos;m Shiham Ahamed, a Software Engineering undergraduate at
            SLIIT focused on building full-stack applications with clean
            interfaces, reliable backend logic, and realistic project structure.
          </p>
        </div>
      </div>
    </Link>
  );
};

export default AboutCard;
