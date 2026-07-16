"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";

import type { SectionNavItem } from "@/data/site/section-navigation";
import {
  getActiveSectionId,
  getSectionScrollOffset,
} from "@/lib/section-navigation";
import { cn } from "@/lib/utils";

type SectionQuickNavProps = {
  items: readonly SectionNavItem[];
  className?: string;
};

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function SectionQuickNav({
  items,
  className,
}: SectionQuickNavProps) {
  const [activeId, setActiveId] = useState(() => items[0]?.id ?? "");
  const itemKey = useMemo(() => items.map((item) => item.id).join("|"), [items]);
  const pendingTargetRef = useRef<string | null>(null);
  const settleTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (elements.length === 0) return;

    let frameId: number | null = null;

    const updateActiveSection = () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId);

      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        const offset = getSectionScrollOffset(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--section-scroll-offset",
          ),
        );
        const candidate = getActiveSectionId(
          elements.map((element) => ({
            id: element.id,
            top: element.getBoundingClientRect().top,
          })),
          offset + 8,
          window.scrollY,
          window.innerHeight,
          document.documentElement.scrollHeight,
        );
        const pendingTarget = pendingTargetRef.current;

        if (!pendingTarget || candidate === pendingTarget) {
          setActiveId(candidate);
        } else {
          const targetIndex = elements.findIndex(
            (element) => element.id === pendingTarget,
          );
          const candidateIndex = elements.findIndex(
            (element) => element.id === candidate,
          );

          if (candidateIndex >= targetIndex) setActiveId(candidate);
        }
      });
    };

    const settlePendingTarget = () => {
      pendingTargetRef.current = null;
      if (settleTimeoutRef.current !== null) {
        window.clearTimeout(settleTimeoutRef.current);
        settleTimeoutRef.current = null;
      }
      updateActiveSection();
    };

    const onScroll = () => {
      updateActiveSection();
      if (pendingTargetRef.current !== null) {
        if (settleTimeoutRef.current !== null) {
          window.clearTimeout(settleTimeoutRef.current);
        }
        settleTimeoutRef.current = window.setTimeout(
          settlePendingTarget,
          prefersReducedMotion() ? 80 : 900,
        );
      }
    };

    updateActiveSection();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    window.addEventListener("scrollend", settlePendingTarget);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("scrollend", settlePendingTarget);
      if (settleTimeoutRef.current !== null) {
        window.clearTimeout(settleTimeoutRef.current);
      }
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, [itemKey, items]);

  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (!element) return;

    const offset = getSectionScrollOffset(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--section-scroll-offset",
      ),
    );
    const top = Math.max(
      0,
      element.getBoundingClientRect().top + window.scrollY - offset,
    );

    pendingTargetRef.current = id;
    setActiveId(id);
    window.scrollTo({
      top,
      left: 0,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, []);

  const handleItemClick = useCallback(
    (id: string, event: MouseEvent<HTMLButtonElement>) => {
      scrollToSection(id);
      if (event.detail > 0) event.currentTarget.blur();
    },
    [scrollToSection],
  );

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="On this page"
      className={cn(
        "fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 lg:block xl:right-6 2xl:right-8",
        className,
      )}
    >
      <ol className="w-11 overflow-visible rounded-full border border-border/40 bg-background/70 p-1 shadow-sm shadow-black/5 backdrop-blur-md transition-[border-color,background-color] duration-150 ease-out hover:border-border/60 focus-within:border-ring/50 supports-[backdrop-filter]:bg-background/30 motion-reduce:transition-none dark:shadow-black/20 dark:supports-[backdrop-filter]:bg-background/35">
        {items.map((item) => {
          const isActive = item.id === activeId;

          return (
            <li key={item.id}>
              <button
                type="button"
                aria-label={`Jump to ${item.label}`}
                aria-current={isActive ? "location" : undefined}
                onClick={(event) => handleItemClick(item.id, event)}
                className={cn(
                  "group/item relative flex size-9 cursor-pointer items-center justify-center rounded-full text-left transition-colors duration-150 ease-out hover:bg-accent/35 focus-visible:z-10 focus-visible:bg-accent/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "shrink-0 rounded-full transition-[height,width,background-color,box-shadow,opacity] duration-150 ease-out motion-reduce:transition-none",
                    isActive
                      ? "h-4 w-1.5 bg-foreground ring-2 ring-foreground/10"
                      : "size-[5px] bg-muted-foreground/45 group-hover/item:bg-foreground/65 group-focus-visible/item:bg-foreground/65",
                  )}
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-full top-1/2 mr-2.5 -translate-y-1/2 translate-x-1 whitespace-nowrap rounded-md border border-border/40 bg-background/90 px-2 py-1 text-xs font-medium text-foreground opacity-0 shadow-sm backdrop-blur-md transition-[opacity,transform] duration-150 ease-out group-hover/item:translate-x-0 group-hover/item:opacity-100 group-focus-visible/item:translate-x-0 group-focus-visible/item:opacity-100 supports-[backdrop-filter]:bg-background/70 motion-reduce:translate-x-0 motion-reduce:transition-none dark:supports-[backdrop-filter]:bg-background/75"
                >
                  {item.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
