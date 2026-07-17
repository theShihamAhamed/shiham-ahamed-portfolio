import type { LucideIcon } from "lucide-react";

type ProjectDetailSectionHeaderAccent =
  | "cool"
  | "violet"
  | "warm"
  | "neutral";

type Props = {
  id?: string;
  title: string;
  icon: LucideIcon;
  accent?: ProjectDetailSectionHeaderAccent;
};

const ProjectDetailSectionHeader = ({
  id,
  title,
  icon: Icon,
  accent = "neutral",
}: Props) => {
  return (
    <div className="project-detail-section-header" data-accent={accent}>
      <span className="project-detail-section-header-icon" aria-hidden="true">
        <Icon className="size-[17px]" aria-hidden="true" />
      </span>

      <div className="min-w-0 pt-0.5">
        <h2 id={id} className="project-detail-section-header-title">
          {title}
        </h2>
        <span
          className="project-detail-section-header-rule"
          aria-hidden="true"
        />
      </div>
    </div>
  );
};

export default ProjectDetailSectionHeader;
