"use client";

import * as React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type Props = {
  children: React.ReactNode;
};

const NAV_OFFSET = 96;

const ProjectExpandableDetails = ({ children }: Props) => {
  const [expanded, setExpanded] = React.useState(false);
  const sectionRef = React.useRef<HTMLElement | null>(null);

  const scrollToSectionTop = React.useCallback(() => {
    if (!sectionRef.current) return;

    const top =
      sectionRef.current.getBoundingClientRect().top +
      window.scrollY -
      NAV_OFFSET;

    window.scrollTo({
      top: Math.max(top, 0),
      behavior: "smooth",
    });
  }, []);

  const handleExpand = () => {
    setExpanded(true);
  };

  const handleCollapse = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    setExpanded(false);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToSectionTop();
      });
    });
  };

  return (
    <section
      ref={sectionRef}
      className="relative rounded-[2rem] border border-border/60 bg-background/80 p-5 shadow-sm backdrop-blur-xl sm:p-6"
    >
      <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.06),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.05),transparent_30%)]" />

      <div className="relative z-10">
        <p className="text-sm font-medium text-muted-foreground">
          Detailed case study
        </p>

        <div className="mt-5">
          <div className="relative">
            <div
              className={
                expanded ? "overflow-visible" : "max-h-[520px] overflow-hidden"
              }
            >
              <div className={expanded ? "pb-24" : ""}>{children}</div>
            </div>

            {!expanded ? (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background via-background/90 to-transparent" />
            ) : null}
          </div>

          {expanded ? (
            <div className="sticky bottom-4 z-20 mt-6 flex justify-center">
              <div className="rounded-full border border-border/60 bg-background/90 p-1 shadow-lg backdrop-blur-xl">
                <button
                  type="button"
                  onClick={handleCollapse}
                  className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                >
                  Show less
                  <ChevronUp className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={handleExpand}
                className="inline-flex items-center rounded-full border border-border/60 bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                Show full details
                <ChevronDown className="ml-2 h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProjectExpandableDetails;
