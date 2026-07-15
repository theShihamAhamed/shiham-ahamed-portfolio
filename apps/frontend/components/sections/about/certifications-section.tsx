"use client";

import { useMemo, useState } from "react";

import {
  StaggerContainer,
  StaggerItem,
} from "@/components/motion/motion-primitives";
import { Button } from "@/components/ui/button";
import type { Certification } from "@/types/about";
import CertificationCard from "./certification-card";

type CertificationsSectionProps = {
  items: Certification[];
};

const INITIAL_VISIBLE_COUNT = 4;
const GRID_ID = "certifications-grid";

export default function CertificationsSection({
  items,
}: CertificationsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const canToggle = items.length > INITIAL_VISIBLE_COUNT;

  const visibleItems = useMemo(() => {
    return isExpanded ? items : items.slice(0, INITIAL_VISIBLE_COUNT);
  }, [isExpanded, items]);

  return (
    <>
      <StaggerContainer
        id={GRID_ID}
        className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2"
        staggerChildren={0.035}
      >
        {visibleItems.map((item) => (
          <StaggerItem key={item.id} direction="none">
            <CertificationCard item={item} />
          </StaggerItem>
        ))}
      </StaggerContainer>

      {canToggle ? (
        <div className="mt-8 flex justify-center">
          <Button
            type="button"
            variant="outline"
            aria-expanded={isExpanded}
            aria-controls={GRID_ID}
            onClick={() => setIsExpanded((current) => !current)}
            className="h-11 rounded-xl border-border/70 bg-background/70 px-5 shadow-sm backdrop-blur-sm"
          >
            {isExpanded
              ? "Show less certifications"
              : "Show more certifications"}
          </Button>
        </div>
      ) : null}
    </>
  );
}
