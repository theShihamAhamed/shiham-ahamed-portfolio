"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { AnimatedPageHeader } from "@/components/motion/motion-primitives";
import { skillCategories } from "@/data/site/skills";
import { swapSets } from "@/data/site/swapset";
import SkillCategoryCard from "./skill-category-card";
import ToolsLogoCloud from "./tools-logo-cloud";
import PoweredByNode from "./powered-by-node";
import FoundationIllustration, {
  type FoundationLayoutData,
} from "./foundation-illustration";

type Point = { x: number; y: number };

const round = (n: number) => Math.round(n * 100) / 100;

const SkillsToolsSection = () => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const chipRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [layout, setLayout] = useState<FoundationLayoutData>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const sceneEl = sceneRef.current;
      const chipRoot = chipRef.current;
      if (!sceneEl || !chipRoot) return;

      const sceneRect = sceneEl.getBoundingClientRect();

      const chipBodyEl =
        chipRoot.dataset?.chipBody === "true"
          ? chipRoot
          : ((chipRoot.querySelector?.(
              '[data-chip-body="true"]',
            ) as HTMLDivElement) ?? chipRoot);

      const chipRect = chipBodyEl.getBoundingClientRect();

      const cards = cardRefs.current
        .map((el) => {
          if (!el) return null;

          const rect = el.getBoundingClientRect();
          const left = rect.left - sceneRect.left;
          const top = rect.top - sceneRect.top;

          return {
            left,
            top,
            right: left + rect.width,
            bottom: top + rect.height,
            width: rect.width,
            height: rect.height,
            x: left + rect.width / 2,
            y: top,
          };
        })
        .filter(Boolean);

      const pinGroups: {
        top: Point[];
        bottom: Point[];
        left: Point[];
        right: Point[];
      } = {
        top: [],
        bottom: [],
        left: [],
        right: [],
      };

      chipBodyEl
        .querySelectorAll<HTMLElement>("[data-pin-side][data-pin-index]")
        .forEach((pinEl) => {
          const side = pinEl.dataset.pinSide as
            | "top"
            | "bottom"
            | "left"
            | "right";
          const index = Number(pinEl.dataset.pinIndex ?? -1);

          if (!side || Number.isNaN(index) || index < 0) return;

          const rect = pinEl.getBoundingClientRect();

          let x = rect.left - sceneRect.left + rect.width / 2;
          let y = rect.top - sceneRect.top + rect.height / 2;

          if (side === "left") x = rect.left - sceneRect.left;
          if (side === "right") x = rect.right - sceneRect.left;
          if (side === "top") y = rect.top - sceneRect.top;
          if (side === "bottom") y = rect.bottom - sceneRect.top;

          pinGroups[side][index] = { x: round(x), y: round(y) };
        });

      setLayout({
        width: sceneRect.width,
        height: sceneRect.height,
        chip: {
          x: chipRect.left - sceneRect.left,
          y: chipRect.top - sceneRect.top,
          width: chipRect.width,
          height: chipRect.height,
        },
        pins: {
          top: pinGroups.top.filter(Boolean),
          bottom: pinGroups.bottom.filter(Boolean),
          left: pinGroups.left.filter(Boolean),
          right: pinGroups.right.filter(Boolean),
        },
        cards: cards as NonNullable<FoundationLayoutData>["cards"],
      });
    };

    const runMeasure = () => requestAnimationFrame(measure);
    runMeasure();

    const ro = new ResizeObserver(() => {
      runMeasure();
    });

    if (sceneRef.current) ro.observe(sceneRef.current);
    if (chipRef.current) ro.observe(chipRef.current);
    cardRefs.current.forEach((el) => el && ro.observe(el));

    window.addEventListener("resize", runMeasure);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", runMeasure);
    };
  }, []);

  return (
    <section
      id="skills"
      className="scroll-target relative border-t border-border/60 py-12 sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedPageHeader className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium tracking-[0.08em] text-muted-foreground/90">
            Skills &amp; Tools
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-foreground sm:text-4xl lg:text-[2.9rem] lg:leading-[1.05]">
            Technologies I use to design, build, and ship reliable software.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            A structured overview of my core development stack, supporting
            tools, and workflow technologies across frontend, backend,
            databases, APIs, and project delivery.
          </p>
        </AnimatedPageHeader>

        <div
          ref={sceneRef}
          className="relative mt-20 min-h-[700px] md:min-h-[760px]"
        >
          <div className="pointer-events-none absolute inset-0 z-0">
            <FoundationIllustration layout={layout} />
          </div>

          <div className="relative z-20 flex justify-center">
            <PoweredByNode ref={chipRef} />
          </div>

          <div className="relative z-10 mt-16 grid grid-cols-1 gap-6 md:mt-20 md:grid-cols-2 lg:gap-8">
            {skillCategories.map((category, index) => (
              <div
                key={category.id}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                className="relative"
              >
                <SkillCategoryCard category={category} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-hidden ">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ToolsLogoCloud
            title="Supporting tools"
            sets={swapSets}
            stepDelayMs={60}
            settleDelayMs={1850}
            transitionMs={550}
            logoScale={0.8}
          />
        </div>
      </div>
    </section>
  );
};

export default SkillsToolsSection;
