import Image from "next/image";
import { ProjectMedia } from "@/types/project";
import ProjectYouTubePlayer from "@/components/projects/detail/project-youtube-player";

type Props = {
  media: ProjectMedia;
  alt: string;
};

const ProjectMediaViewer = ({ media, alt }: Props) => {
  if (media.kind === "video") {
    return (
      <ProjectYouTubePlayer
        videoUrl={media.src}
        poster={media.poster}
        title={alt}
      />
    );
  }

  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-[1.5rem] border border-border/60 bg-muted/20">
      <Image
        src={media.src}
        alt={alt}
        fill
        sizes="(min-width: 1280px) 54vw, 100vw"
        className="object-cover"
      />
    </div>
  );
};

export default ProjectMediaViewer;
