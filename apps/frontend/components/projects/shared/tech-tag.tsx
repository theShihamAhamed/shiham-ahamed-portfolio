import { resolveProjectTechnology } from "@portfolio/shared";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import type { ProjectTag } from "@/types/project";

type Props = { tag: ProjectTag; className?: string };
const neutralBrand = "#64748B";

const TechTag = ({ tag, className }: Props) => {
  const resolved = tag.technology ? resolveProjectTechnology(tag.technology) : undefined;
  const brand = resolved?.brandColor ?? tag.color ?? neutralBrand;

  return (
    <span
      className={cn(
        "tech-badge-theme inline-flex h-6 items-center rounded-full px-2.5 text-[11px] leading-none font-medium tracking-[-0.01em]",
        className,
      )}
      style={{ "--tech-brand": brand } as CSSProperties}
    >
      {tag.label}
    </span>
  );
};

export default TechTag;
