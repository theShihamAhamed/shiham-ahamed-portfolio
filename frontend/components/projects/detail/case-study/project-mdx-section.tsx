import ProjectExpandableDetails from "@/components/projects/detail/case-study/project-expandable-details";
import { getProjectMdx } from "@/lib/projects/mdx";

type Props = {
  mdxUrl?: string;
};

const ProjectMdxSection = async ({ mdxUrl }: Props) => {
  if (!mdxUrl) return null;

  const mdx = await getProjectMdx(mdxUrl);

  if (!mdx) return null;

  return (
    <section>
      <div className="w-full">
        <ProjectExpandableDetails>{mdx.content}</ProjectExpandableDetails>
      </div>
    </section>
  );
};

export default ProjectMdxSection;
