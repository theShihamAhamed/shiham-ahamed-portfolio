"use client";

import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type Props = {
  children: React.ReactNode;
};

const NAV_OFFSET = 96;
const PREVIEW_MAX_HEIGHT = 520;
const CONTENT_ID = "project-case-study-content";
const COLLAPSED_DESCRIPTION_ID = "project-case-study-collapsed-description";

const getScrollBehavior = (): ScrollBehavior =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";

const getElementByHash = (hash: string): HTMLElement | null => {
  if (!hash.startsWith("#")) return null;
  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)));
  } catch {
    return null;
  }
};

const ProjectExpandableDetails = ({ children }: Props) => {
  const [expanded, setExpanded] = React.useState(false);
  const [hasOverflow, setHasOverflow] = React.useState(true);
  const sectionRef = React.useRef<HTMLDivElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const measurementRef = React.useRef<HTMLDivElement | null>(null);
  const expandButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const pendingExpandFocusRef = React.useRef(false);
  const isExpanded = expanded && hasOverflow;
  const previewState = isExpanded || !hasOverflow ? "expanded" : "collapsed";

  const scrollToElement = React.useCallback((element: HTMLElement) => {
    const top = element.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
    window.scrollTo({
      top: Math.max(top, 0),
      behavior: getScrollBehavior(),
    });
  }, []);

  const scrollToSectionTop = React.useCallback(() => {
    if (!sectionRef.current) return;
    scrollToElement(sectionRef.current);
  }, [scrollToElement]);

  React.useLayoutEffect(() => {
    const measurement = measurementRef.current;
    if (!measurement) return;

    const measure = () => {
      const nextHasOverflow =
        measurement.getBoundingClientRect().height > PREVIEW_MAX_HEIGHT + 1;
      setHasOverflow((current) =>
        current === nextHasOverflow ? current : nextHasOverflow,
      );
    };

    measure();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }

    const observer = new ResizeObserver(measure);
    observer.observe(measurement);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    if (!isExpanded || !pendingExpandFocusRef.current) return;

    pendingExpandFocusRef.current = false;
    const frame = requestAnimationFrame(() => {
      contentRef.current?.focus({ preventScroll: true });
    });

    return () => cancelAnimationFrame(frame);
  }, [isExpanded]);

  React.useEffect(() => {
    if (!sectionRef.current || !window.location.hash) return;
    const target = getElementByHash(window.location.hash);
    if (!target || !sectionRef.current.contains(target)) return;
    setExpanded(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => scrollToElement(target));
    });
  }, [scrollToElement]);

  const handleContentClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const link = target.closest("a[href^='#']");
    if (!(link instanceof HTMLAnchorElement)) return;
    const targetElement = getElementByHash(link.hash);
    if (!targetElement || !sectionRef.current?.contains(targetElement)) return;
    if (!hasOverflow) return;

    event.preventDefault();
    window.history.pushState(null, "", link.hash);
    setExpanded(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => scrollToElement(targetElement));
    });
  };

  const handleExpand = () => {
    pendingExpandFocusRef.current = true;
    setExpanded(true);
  };

  const handleCollapse = () => {
    setExpanded(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToSectionTop();
        expandButtonRef.current?.focus({ preventScroll: true });
      });
    });
  };

  return (
    <div ref={sectionRef} className="relative mt-6 min-w-0">
      <div className="grid min-w-0">
        {isExpanded ? (
          <div className="pointer-events-none sticky top-[calc(100dvh-3.75rem-env(safe-area-inset-bottom))] z-40 col-start-1 row-start-1 flex h-11 self-start justify-center px-4 sm:top-[calc(100dvh-4.25rem-env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={handleCollapse}
              aria-expanded="true"
              aria-controls={CONTENT_ID}
              className="pointer-events-auto inline-flex min-h-11 items-center rounded-full border border-border/60 bg-background/95 px-4 py-2 text-sm font-medium text-foreground shadow-lg backdrop-blur transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              Show less
              <ChevronUp className="ml-2 h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : null}

        <div
          className="relative col-start-1 row-start-1 min-w-0"
          onClick={handleContentClick}
        >
          <div
            id={CONTENT_ID}
            ref={contentRef}
            data-state={previewState}
            className="project-case-study-preview"
            inert={previewState === "collapsed" ? true : undefined}
            tabIndex={isExpanded ? -1 : undefined}
          >
            <div className={isExpanded ? "pb-28 sm:pb-24" : undefined}>
              <div ref={measurementRef} className="flow-root min-w-0">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>

      {hasOverflow && !isExpanded ? (
        <div className="mt-6 flex justify-center">
          <p id={COLLAPSED_DESCRIPTION_ID} className="sr-only">
            The case-study preview is collapsed. Activate the button to make
            the full content available.
          </p>
          <button
            ref={expandButtonRef}
            type="button"
            onClick={handleExpand}
            aria-expanded="false"
            aria-controls={CONTENT_ID}
            aria-describedby={COLLAPSED_DESCRIPTION_ID}
            className="inline-flex min-h-11 items-center rounded-full border border-border/60 bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            Show full details
            <ChevronDown className="ml-2 h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default ProjectExpandableDetails;
