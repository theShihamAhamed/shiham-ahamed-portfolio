import { Sparkles } from "lucide-react";

import ProjectListSection from "@/components/projects/detail/project-points-section";

type Props = {
  items: string[];
};

const ProjectHighlights = ({ items }: Props) => {
  return (
    <ProjectListSection
      title="Key highlights"
      items={items}
      icon={Sparkles}
      marker="check"
    />
  );
};

export default ProjectHighlights;
