import { Code2 } from "lucide-react";

import ProjectDetailSectionHeader from "@/components/projects/detail/project-detail-section-header";
import ProjectDetailSurface from "@/components/projects/detail/project-detail-surface";
import type { ProjectTechDisplayGroup } from "@/types/project";

type Props = {
  techGroups: ProjectTechDisplayGroup[];
};

const ProjectTechGroups = ({ techGroups }: Props) => {
  if (!techGroups.length) return null;

  return (
    <ProjectDetailSurface
      aria-labelledby="project-technologies-heading"
      accent="violet"
      intensity="secondary"
      className="p-5 sm:p-6"
    >
      <ProjectDetailSectionHeader
        id="project-technologies-heading"
        title="Technology stack"
        icon={Code2}
        accent="violet"
      />

      <div className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
        {techGroups.map((group) => {
          const headingId = `project-technology-group-${group.key}`;

          return (
            <section
              key={group.key}
              aria-labelledby={headingId}
              className="project-detail-tech-legend"
            >
              <h3
                id={headingId}
                className="project-detail-tech-legend-label"
              >
                {group.label}
              </h3>

              <ul className="project-detail-tech-list">
                {group.items.map((item, itemIndex) => {
                  const label = item.label;

                  return (
                    <li key={label} className="project-detail-tech-item">
                      <span className="project-detail-tech-name">{label}</span>
                      {itemIndex < group.items.length - 1 ? (
                        <span
                          aria-hidden="true"
                          className="project-detail-tech-separator"
                        />
                      ) : null}
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
