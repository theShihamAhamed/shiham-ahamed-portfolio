"use client";

import { Button } from "@/components/ui/button";
import { ProjectsLink, RouteState } from "@/components/layout/route-state";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <RouteState
      eyebrow="Project details"
      title="Project unavailable"
      description="This project could not be loaded right now. Retry the request or return to the project catalog."
    >
      <Button
        type="button"
        onClick={reset}
        className="h-10 rounded-lg bg-foreground px-4 text-background"
      >
        Retry
      </Button>
      <ProjectsLink />
    </RouteState>
  );
}
