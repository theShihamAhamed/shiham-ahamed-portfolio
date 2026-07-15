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
        "fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 lg:block xl:right-8",
        className,
      )}
    >
      <ol className="group rounded-2xl border border-border/60 bg-background/75 p-1.5 shadow-lg shadow-black/5 backdrop-blur-xl transition-all duration-200 ease-out hover:bg-background/85 focus-within:bg-background/85 motion-reduce:transition-none dark:shadow-black/30">
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
                  "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-2.5 py-1.5 text-left transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 motion-reduce:transition-none",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "shrink-0 rounded-full transition-all duration-200 ease-out motion-reduce:transition-none",
                    isActive
                      ? "h-8 w-1.5 bg-foreground shadow-[0_0_14px_rgba(0,0,0,0.22)] dark:shadow-[0_0_16px_rgba(255,255,255,0.28)]"
                      : "h-5 w-1 bg-muted-foreground/35",
                  )}
                />
                <span
                  className={cn(
                    "max-w-0 translate-x-1 overflow-hidden whitespace-nowrap text-xs font-medium opacity-0 transition-all duration-200 ease-out group-hover:max-w-36 group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:max-w-36 group-focus-within:translate-x-0 group-focus-within:opacity-100 motion-reduce:transition-none",
                    isActive ? "text-foreground" : "text-muted-foreground",
                  )}
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
