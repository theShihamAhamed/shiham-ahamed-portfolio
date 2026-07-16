import { getCaseStudyMdxValidationIssues } from "@portfolio/shared";

import ProjectExpandableDetails from "@/components/projects/detail/case-study/project-expandable-details";
import { ProjectReadmeRenderer } from "@/components/projects/detail/case-study/project-readme-renderer";

type Props = {
  caseStudyMdx?: string;
};

const ProjectReadmeSection = ({ caseStudyMdx }: Props) => {
  if (!caseStudyMdx) return null;

  const validationIssue = getCaseStudyMdxValidationIssues(caseStudyMdx)[0];

  return (
    <section
      id="project-case-study"
      aria-labelledby="project-case-study-title"
      className="overflow-hidden rounded-2xl border border-border/60 bg-background/50 p-5 text-foreground sm:p-8"
    >
      <p id="project-case-study-title" className="text-sm font-medium text-muted-foreground">
        Project case study
      </p>

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
    </section>
  );
};

export default ProjectReadmeSection;
