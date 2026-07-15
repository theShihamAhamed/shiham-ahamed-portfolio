import type { Metadata } from "next";
import { SectionReveal } from "@/components/motion/motion-primitives";
import ProjectsPageClient from "@/components/projects/listing/project-catalog";
import { mapPublicProjectToViewerProject } from "@/lib/mappers/projects";
import { getProjectsPageData } from "@/lib/server/queries/get-projects-page-data";
import type { Project } from "@/types/project";
import { getCanonicalUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected software projects and case studies by Shiham Ahamed.",
  alternates: { canonical: getCanonicalUrl("/projects").pathname },
};

export const revalidate = 86400;

type ProjectsPageState =
  | {
      projects: Project[];
      error: null;
    }
  | {
      projects: [];
      error: string;
    };

const getProjects = async (): Promise<ProjectsPageState> => {
  try {
    const projects = await getProjectsPageData();

    return {
      projects: projects.map((project, index) =>
        mapPublicProjectToViewerProject(project, index),
      ),
      error: null,
    };
  } catch (error) {
    console.error("Failed to load projects", error);

    return {
      projects: [],
      error: "Projects are temporarily unavailable.",
    };
  }
};

export default async function ProjectsPage() {
  const { projects, error } = await getProjects();

  return (
    <main className="pb-20 sm:pb-24 lg:pb-28">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {error ? (
          <SectionReveal>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              All projects
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-[-0.045em] text-foreground sm:text-4xl lg:text-[2.75rem]">
              Work I&apos;ve built and shipped.
            </h1>
            <div className="mt-8 rounded-[2rem] border border-border/60 bg-background/80 p-10 text-center shadow-sm backdrop-blur-xl">
              <h2 className="text-xl font-semibold tracking-[-0.03em] text-foreground">
                Projects unavailable
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {error}
              </p>
            </div>
          </SectionReveal>
        ) : (
          <ProjectsPageClient projects={projects} />
        )}
      </div>
    </main>
  );
}
