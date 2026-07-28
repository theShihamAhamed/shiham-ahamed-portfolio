import Link from "next/link";
import { MoveRight } from "lucide-react";

import {
  AnimatedPageHeader,
  SectionReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/motion/motion-primitives";
import FeaturedProjectCard from "@/components/projects/shared/project-card";
import { Button } from "@/components/ui/button";
import { mapPublicProjectToViewerProject } from "@/lib/mappers/projects";
import type { PublicProject } from "@portfolio/shared";

type Props = {
  projects: PublicProject[];
  error?: string;
};

const FeaturedProjectsSection = ({ projects, error }: Props) => {
  const featuredProjects = projects
    .slice(0, 6)
    .map(mapPublicProjectToViewerProject);

  return (
    <section
      id="featured-projects"
      className="scroll-target relative py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedPageHeader className="mx-auto max-w-3xl text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Featured projects
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-[-0.045em] text-foreground sm:text-4xl lg:text-[2.75rem]">
            Selected work that reflects
            <span className="block text-muted-foreground">
              my skills, growth, and engineering mindset.
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-[0.95rem] sm:leading-8">
            A curated set of projects across full-stack development,
            microservices, authentication, real-time apps, and product-focused
            interfaces.
          </p>
        </AnimatedPageHeader>

        {featuredProjects.length > 0 ? (
          <StaggerContainer
            className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
            staggerChildren={0.035}
          >
            {featuredProjects.map((project) => (
              <StaggerItem key={project.id} className="h-full">
                <FeaturedProjectCard project={project} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <SectionReveal className="mt-12 rounded-2xl border border-border/60 bg-background/80 p-6 text-sm leading-7 text-muted-foreground shadow-sm backdrop-blur-xl">
            {error ?? "Featured projects are being curated."}
          </SectionReveal>
        )}

        {/* View All Projects button - moved to bottom */}
        <SectionReveal className="mt-12 flex justify-center">
          <Button
            asChild
            variant="outline"
            className="h-9 rounded-lg border-border/70 bg-transparent px-4 text-sm text-muted-foreground shadow-none transition-all duration-200 hover:-translate-y-px hover:border-border hover:bg-accent hover:text-foreground"
          >
            <Link href="/projects">
              View All Projects
              <MoveRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </SectionReveal>
      </div>
    </section>
  );
};

export default FeaturedProjectsSection;
