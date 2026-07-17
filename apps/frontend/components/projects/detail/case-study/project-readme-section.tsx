import { getCaseStudyMdxValidationIssues } from "@portfolio/shared";

import ProjectExpandableDetails from "@/components/projects/detail/case-study/project-expandable-details";
import { ProjectReadmeRenderer } from "@/components/projects/detail/case-study/project-readme-renderer";
import ProjectDetailSurface from "@/components/projects/detail/project-detail-surface";

type Props = {
  caseStudyMdx?: string;
};

const ProjectReadmeSection = ({ caseStudyMdx }: Props) => {
  if (!caseStudyMdx) return null;

  const validationIssue = getCaseStudyMdxValidationIssues(caseStudyMdx)[0];

  return (
    <ProjectDetailSurface
      id="project-case-study"
      aria-labelledby="project-case-study-title"
      accent="neutral"
      intensity="subtle"
      className="p-5 text-foreground sm:p-8"
    >
      <div>
        <h2
          id="project-case-study-title"
          className="text-lg font-semibold tracking-[-0.025em] text-foreground sm:text-xl"
        >
          Project case study
        </h2>
        <span className="project-detail-quiet-accent" aria-hidden="true" />
      </div>

      {validationIssue ? (
        <div role="alert" className="mt-5 rounded-xl border border-border/60 bg-background/70 p-5 text-sm leading-7 text-muted-foreground">
          <p>Case study content is temporarily unavailable.</p>
          <p className="mt-2 text-xs">{validationIssue.message}</p>
        </div>
      ) : (
        <ProjectExpandableDetails>
          <ProjectReadmeRenderer source={caseStudyMdx} />
        </ProjectExpandableDetails>
      )}
    </ProjectDetailSurface>
  );
};

export default ProjectReadmeSection;
