"use client";

import { Button } from "@/components/ui/button";
import { HomeLink, RouteState } from "@/components/layout/route-state";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <RouteState
      eyebrow="Portfolio"
      title="Something went wrong"
      description="The portfolio could not finish loading. Try again, or head back home while the data source catches up."
    >
      <Button
        type="button"
        onClick={reset}
        className="h-10 rounded-lg bg-foreground px-4 text-background"
      >
        Try again
      </Button>
      <HomeLink />
    </RouteState>
  );
}
