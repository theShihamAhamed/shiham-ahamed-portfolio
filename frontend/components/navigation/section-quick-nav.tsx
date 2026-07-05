"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type MouseEvent,
} from "react";

import type { SectionNavItem } from "@/data/site/section-navigation";
import { cn } from "@/lib/utils";

type SectionQuickNavProps = {
  items: SectionNavItem[];
  className?: string;
};

const HEADER_OFFSET = 96;
const ACTIVE_PROBE_OFFSET = HEADER_OFFSET + 8;

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const getActiveSectionId = (elements: HTMLElement[]) => {
  if (elements.length === 0) {
    return "";
  }

  let lastPassedId = elements[0].id;

  for (const element of elements) {
    const rect = element.getBoundingClientRect();

    if (rect.top <= ACTIVE_PROBE_OFFSET && rect.bottom > ACTIVE_PROBE_OFFSET) {
      return element.id;
    }

    if (rect.top <= ACTIVE_PROBE_OFFSET) {
      lastPassedId = element.id;
    }
  }

  const nextSection = elements.find(
    (element) => element.getBoundingClientRect().top > ACTIVE_PROBE_OFFSET,
  );

  return nextSection?.id ?? lastPassedId;
};

export default function SectionQuickNav({
  items,
  className,
}: SectionQuickNavProps) {
  const [activeId, setActiveId] = useState(() => items[0]?.id ?? "");
  const itemKey = useMemo(() => items.map((item) => item.id).join("|"), [items]);

  useEffect(() => {
    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (elements.length === 0) {
      return;
    }

    let frameId: number | null = null;

    const updateActiveSection = () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = null;
        setActiveId(getActiveSectionId(elements));
      });
    };

    updateActiveSection();

    const observer = new IntersectionObserver(updateActiveSection, {
      rootMargin: `-${HEADER_OFFSET}px 0px -55% 0px`,
      threshold: [0, 0.2, 0.5, 0.8, 1],
    });

    elements.forEach((element) => observer.observe(element));
    const settleTimeoutId = window.setTimeout(updateActiveSection, 250);

    return () => {
      observer.disconnect();
      window.clearTimeout(settleTimeoutId);

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [itemKey, items]);

  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id);

    if (!element) {
      return;
    }

    const top = Math.max(
      0,
      element.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET,
    );

    window.scrollTo({
      top,
      left: 0,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, []);

  const handleItemClick = useCallback(
    (id: string, event: MouseEvent<HTMLButtonElement>) => {
      scrollToSection(id);

      if (event.detail > 0) {
        event.currentTarget.blur();
      }
    },
    [scrollToSection],
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Page sections"
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
