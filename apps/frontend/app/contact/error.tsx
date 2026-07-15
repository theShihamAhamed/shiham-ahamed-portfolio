"use client";

import { Button } from "@/components/ui/button";
import { HomeLink, RouteState } from "@/components/layout/route-state";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <RouteState
      eyebrow="Contact"
      title="Contact page unavailable"
      description="The contact page could not load its latest settings. Try again or return home."
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
