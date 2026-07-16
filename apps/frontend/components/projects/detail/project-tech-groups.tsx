import { Code2 } from "lucide-react";

import ProjectDetailSectionHeader from "@/components/projects/detail/project-detail-section-header";
import ProjectDetailSurface from "@/components/projects/detail/project-detail-surface";
import type { ProjectTag, TechGroups } from "@/types/project";

type Props = {
  techGroups: TechGroups;
};

const technologyGroupLabelOverrides: Record<string, string> = {
  ai: "AI",
  api: "API",
  cdn: "CDN",
  "ci/cd": "CI/CD",
  cms: "CMS",
  css: "CSS",
  devops: "DevOps",
  html: "HTML",
  ide: "IDE",
  ml: "ML",
  orm: "ORM",
  qa: "QA",
  sdk: "SDK",
  ui: "UI",
  "ui/ux": "UI/UX",
  ux: "UX",
};

export const formatTechnologyGroupLabel = (value: string) => {
  return value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => {
      const normalizedWord = word.toLowerCase();

      return (
        technologyGroupLabelOverrides[normalizedWord] ??
        `${normalizedWord.charAt(0).toUpperCase()}${normalizedWord.slice(1)}`
      );
    })
    .join(" ");
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

      <div className="mt-5 grid gap-x-5 gap-y-7 md:grid-cols-2">
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
                {formatTechnologyGroupLabel(group.title)}
              </h3>

              <ul className="project-detail-tech-list">
                {group.items.map((item, itemIndex) => {
                  const label = typeof item === "string" ? item : item.label;

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
