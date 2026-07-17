import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

export const projectDetailSurfaceAccents = [
  "aurora",
  "cool",
  "violet",
  "warm",
  "neutral",
] as const;

export const projectDetailSurfaceIntensities = [
  "primary",
  "secondary",
  "subtle",
] as const;

export type ProjectDetailSurfaceAccent =
  (typeof projectDetailSurfaceAccents)[number];
export type ProjectDetailSurfaceIntensity =
  (typeof projectDetailSurfaceIntensities)[number];

type ProjectDetailSurfaceProps = HTMLAttributes<HTMLElement> & {
  as?: "section" | "div";
  accent?: ProjectDetailSurfaceAccent;
  intensity?: ProjectDetailSurfaceIntensity;
  children: ReactNode;
};

const ProjectDetailSurface = ({
  as: Element = "section",
  accent = "neutral",
  intensity = "secondary",
  className,
  children,
  ...props
}: ProjectDetailSurfaceProps) => {
  return (
    <Element
      {...props}
      className={cn("project-detail-surface", className)}
      data-accent={accent}
      data-intensity={intensity}
    >
      <div className="project-detail-surface-content">{children}</div>
    </Element>
  );
};

export default ProjectDetailSurface;
