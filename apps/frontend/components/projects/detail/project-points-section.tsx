import { Check, type LucideIcon } from "lucide-react";

import ProjectDetailSectionHeader from "@/components/projects/detail/project-detail-section-header";
import ProjectDetailSurface, {
  type ProjectDetailSurfaceAccent,
} from "@/components/projects/detail/project-detail-surface";

type Props = {
  title: string;
  items: string[];
  icon: LucideIcon;
  marker?: "dot" | "check";
  accent?: Exclude<ProjectDetailSurfaceAccent, "aurora">;
};

const ProjectListSection = ({
  title,
  items,
  icon,
  marker = "dot",
  accent = "neutral",
}: Props) => {
  if (!items.length) return null;

  const headingId = `project-${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}-heading`;

  return (
    <ProjectDetailSurface
      aria-labelledby={headingId}
      accent={accent}
      intensity="secondary"
      className="p-5 sm:p-6"
    >
      <ProjectDetailSectionHeader
        id={headingId}
        title={title}
        icon={icon}
        accent={accent}
      />

      <ul className="mt-5 divide-y divide-border/40">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0"
          >
            {marker === "check" ? (
              <Check
                aria-hidden="true"
                className="project-detail-list-check mt-1.5 size-3.5 shrink-0"
              />
            ) : (
              <span
                aria-hidden="true"
                className="project-detail-list-dot mt-[11px] size-1.5 shrink-0 rounded-full"
              />
            )}
            <span className="text-sm leading-6 text-foreground">{item}</span>
          </li>
        ))}
      </ul>
    </ProjectDetailSurface>
  );
};

export default ProjectListSection;
