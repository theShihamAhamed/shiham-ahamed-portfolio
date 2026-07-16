import { Code2 } from "lucide-react";

import ProjectDetailSectionHeader from "@/components/projects/detail/project-detail-section-header";
import ProjectDetailSurface from "@/components/projects/detail/project-detail-surface";
import type { ProjectTag, TechGroups } from "@/types/project";

type Props = {
  techGroups: TechGroups;
};

const ProjectTechGroups = ({ techGroups }: Props) => {
  const groups = Object.entries(techGroups)
    .map(([title, items]) => ({ title, items }))
    .filter((group): group is { title: string; items: Array<ProjectTag | string> } =>
      Boolean(group.items?.length),
    );

  return (
    <ProjectDetailSurface
      aria-labelledby="project-technologies-heading"
      accent="violet"
      intensity="secondary"
      className="p-5 sm:p-6"
    >
      <ProjectDetailSectionHeader
        id="project-technologies-heading"
        title="Technologies, frameworks, and tools"
        icon={Code2}
        accent="violet"
      />

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {groups.map((group, index) => {
          const headingId = `project-technology-group-${index}`;

          return (
            <section
              key={group.title}
              aria-labelledby={headingId}
              className="project-detail-tech-legend"
            >
              <h3
                id={headingId}
                className="project-detail-tech-legend-label"
              >
                <span
                  aria-hidden="true"
                  className="size-[5px] shrink-0 rounded-full bg-muted-foreground/55"
                />
                {group.title}
              </h3>

              <ul className="flex flex-wrap gap-x-4 gap-y-2">
                {group.items.map((item) => {
                  const label = typeof item === "string" ? item : item.label;

                  return (
                    <li
                      key={label}
                      className="flex max-w-full min-w-0 items-start gap-2 text-sm leading-6 text-muted-foreground"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-[9px] size-1.5 shrink-0 rounded-full bg-muted-foreground/50"
                      />
                      <span className="min-w-0 break-words">{label}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </ProjectDetailSurface>
  );
};

export default ProjectTechGroups;
