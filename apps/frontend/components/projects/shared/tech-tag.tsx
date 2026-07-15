import { resolveProjectTechnology } from "@portfolio/shared";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import type { ProjectTag } from "@/types/project";

type Props = { tag: ProjectTag; className?: string };
const neutral = { bg: "#f1f5f9", text: "#17232b", border: "#94a3b8" };

const TechTag = ({ tag, className }: Props) => {
  const resolved = tag.technology ? resolveProjectTechnology(tag.technology) : undefined;
  const light = resolved?.light ?? neutral;
  const dark = resolved?.dark ?? { bg: "#17232b", text: "#f8fafc", border: "#94a3b8" };
  return <span className={cn("tech-badge-theme inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-[-0.01em] transition-colors duration-300", className)} style={{ "--tech-light-bg": light.bg, "--tech-light-text": light.text, "--tech-light-border": light.border, "--tech-dark-bg": dark.bg, "--tech-dark-text": dark.text, "--tech-dark-border": dark.border } as CSSProperties}>{tag.label}</span>;
};

export default TechTag;
