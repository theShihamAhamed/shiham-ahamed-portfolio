"use client";

import { Button } from "@/components/ui/button";
import { HomeLink, RouteState } from "@/components/layout/route-state";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <RouteState
      eyebrow="Projects"
      title="Projects unavailable"
      description="The project catalog could not be loaded right now. Please try again in a moment."
    >
      <Button
        type="button"
        onClick={reset}
        className="h-10 rounded-lg bg-foreground px-4 text-background"
      >
        Retry
      </Button>
      <HomeLink />
    </RouteState>
  );
}
