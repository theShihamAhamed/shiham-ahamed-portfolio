"use client";

import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { createPortal } from "react-dom";

type Props = {
  children: React.ReactNode;
};

const NAV_OFFSET = 96;
const CONTENT_ID = "project-case-study-content";
const subscribeToMountState = () => () => undefined;

const getElementByHash = (hash: string): HTMLElement | null => {
  if (!hash.startsWith("#")) return null;
  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)));
  } catch {
    return null;
  }
};

const ProjectExpandableDetails = ({ children }: Props) => {
  const mounted = React.useSyncExternalStore(
    subscribeToMountState,
    () => true,
    () => false,
  );
  const [expanded, setExpanded] = React.useState(false);
  const sectionRef = React.useRef<HTMLDivElement | null>(null);
  const expandButtonRef = React.useRef<HTMLButtonElement | null>(null);

  const scrollToElement = React.useCallback((element: HTMLElement) => {
    const top = element.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
    window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
  }, []);

  const scrollToSectionTop = React.useCallback(() => {
    if (!sectionRef.current) return;
    scrollToElement(sectionRef.current);
  }, [scrollToElement]);

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

    event.preventDefault();
    window.history.pushState(null, "", link.hash);
    setExpanded(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => scrollToElement(targetElement));
    });
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
    <>
      <div ref={sectionRef} className="relative mt-6 min-w-0">
        <div className="relative min-w-0" onClick={handleContentClick}>
          <div
            id={CONTENT_ID}
            className={expanded ? "overflow-visible" : "max-h-[520px] overflow-hidden"}
          >
            <div className={expanded ? "pb-28 sm:pb-24" : ""}>{children}</div>
          </div>

          {!expanded ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background via-background/90 to-transparent" />
          ) : null}
        </div>

        {!expanded ? (
          <div className="mt-6 flex justify-center">
            <button
              ref={expandButtonRef}
              type="button"
              onClick={() => setExpanded(true)}
              aria-expanded="false"
              aria-controls={CONTENT_ID}
              className="inline-flex items-center rounded-full border border-border/60 bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
            >
              Show full details
              <ChevronDown className="ml-2 h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>

      {mounted && expanded
        ? createPortal(
            <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 pb-[env(safe-area-inset-bottom)] sm:bottom-6">
              <button
                type="button"
                onClick={handleCollapse}
                aria-expanded="true"
                aria-controls={CONTENT_ID}
                className="inline-flex items-center rounded-full border border-border/60 bg-background/95 px-4 py-2 text-sm font-medium text-foreground shadow-lg backdrop-blur transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              >
                Show less
                <ChevronUp className="ml-2 h-4 w-4" aria-hidden="true" />
              </button>
            </div>,
            document.body,
          )
        : null}
    </>
  );
};

export default ProjectExpandableDetails;
