import ProjectExpandableDetails from "@/components/projects/detail/case-study/project-expandable-details";
import { compileProjectMdx } from "@/lib/projects/mdx";

type Props = {
  caseStudyMdx?: string;
};

const ProjectMdxSection = async ({ caseStudyMdx }: Props) => {
  if (!caseStudyMdx) return null;

  const mdx = await compileProjectMdx(caseStudyMdx);

  if (!mdx) {
    return (
      <section className="rounded-[1.5rem] border border-border/60 bg-background/60 p-6 text-sm leading-7 text-muted-foreground">
        <p>Case study content is temporarily unavailable.</p>
      </section>
    );
  }

  return (
    <section className="rounded-[1.5rem] border border-border/60 bg-background/40 p-5 text-foreground shadow-sm sm:p-8">
      <div className="w-full">
        <ProjectExpandableDetails>{mdx.content}</ProjectExpandableDetails>
      </div>
    </section>
  );
};

export default ProjectMdxSection;
