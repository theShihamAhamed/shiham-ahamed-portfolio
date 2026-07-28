import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  Calendar,
  FileText,
  Mountain,
  TrendingUp,
} from "lucide-react";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { getProjectTypeLabel } from "@portfolio/shared";

import {
  AnimatedPageHeader,
  SectionReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/motion/motion-primitives";
import { Button } from "@/components/ui/button";
import FeaturedProjectCard from "@/components/projects/shared/project-card";
import ProjectMediaViewer from "@/components/projects/detail/project-media";
import ProjectHighlights from "@/components/projects/detail/project-highlights";
import ProjectTechGroups from "@/components/projects/detail/project-tech-groups";
import ProjectGallery from "@/components/projects/detail/project-gallery";
import ProjectArchitecture from "@/components/projects/detail/project-architecture";
import ProjectListSection from "@/components/projects/detail/project-points-section";
import ProjectDetailSectionHeader from "@/components/projects/detail/project-detail-section-header";
import ProjectDetailSurface from "@/components/projects/detail/project-detail-surface";
import TechTag from "@/components/projects/shared/tech-tag";
import ProjectReadmeSection from "@/components/projects/detail/case-study/project-readme-section";
import { formatProjectDateRange } from "@/lib/utils";
import {
  getProjectDetailData,
  getProjectForRequest,
} from "@/lib/server/queries/get-project-detail-data";
import { mapPublicProjectToViewerProject } from "@/lib/mappers/projects";
import { getAbsoluteUrl, getCanonicalUrl, getMetadataDescription } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 86400;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const project = await getProjectForRequest(slug);

    if (!project) {
      return {
        title: "Project not found",
        robots: { index: false, follow: false },
      };
    }

    const canonical = getCanonicalUrl(`/projects/${project.slug}`);
    const description = getMetadataDescription(project.shortDescription);

    return {
      title: project.title,
      description,
      alternates: { canonical: canonical.pathname },
      openGraph: {
        type: "article",
        url: canonical.toString(),
        title: project.title,
        description,
        images: [{ url: getAbsoluteUrl(project.thumbnail.url), alt: project.thumbnail.alt }],
      },
      twitter: {
        card: "summary_large_image",
        title: project.title,
        description,
        images: [getAbsoluteUrl(project.thumbnail.url)],
      },
    };
  } catch {
    return {
      title: "Project unavailable",
      robots: { index: false, follow: false },
    };
  }
}

const ProjectDetailError = () => (
  <main className="pb-20 sm:pb-24 lg:pb-28">
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-muted-foreground">
            Project details
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-5xl">
            Project unavailable
          </h1>
          <p className="mt-5 text-base leading-8 text-muted-foreground">
            This project could not be loaded right now.
          </p>
        </div>
      </div>
    </section>
  </main>
);

export default async function ProjectDetailsPage({ params }: Props) {
  const { slug } = await params;
  let detailData;

  try {
    detailData = await getProjectDetailData(slug);
  } catch (error) {
    console.error("Failed to load project detail", error);
    return <ProjectDetailError />;
  }

  if (!detailData) {
    notFound();
  }

  const project = mapPublicProjectToViewerProject(detailData.project);
  const relatedProjects = detailData.relatedProjects.map(
    mapPublicProjectToViewerProject,
  );

  return (
    <main className="project-detail-page pb-20 sm:pb-24 lg:pb-28">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="grid gap-8 xl:grid-cols-12 xl:items-start">
            <StaggerContainer
              revealOnView={false}
              delayChildren={0.04}
              className="space-y-6 xl:col-span-5"
            >
              <StaggerItem>
                <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
                  {getProjectTypeLabel(project.projectType)}
                </div>

                {/* Project timeline info */}
                <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {formatProjectDateRange(
                      project.startDate,
                      project.endDate,
                      project.status === "in-progress",
                    )}
                  </span>
                </div>
                </div>
              </StaggerItem>

              <StaggerItem distance={8}>
                <div>
                <h1 className="text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-5xl lg:text-6xl">
                  {project.title}
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                  {project.shortDescription}
                </p>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="flex flex-wrap gap-2">
                {project.techStack.map((tag) => (
                  <TechTag key={`${project.slug}-${tag.label}`} tag={tag} />
                ))}
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="flex flex-wrap gap-3">
                {project.links.github ? (
                  <Button
                    asChild
                    className="h-11 rounded-lg bg-foreground px-5 text-background hover:opacity-90"
                  >
                    <Link
                      href={project.links.github}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <GitHubLogoIcon className="mr-2 h-4 w-4" />
                      GitHub
                    </Link>
                  </Button>
                ) : null}

                {project.links.live ? (
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 rounded-lg border-border bg-background/80 px-5 hover:bg-accent"
                  >
                    <Link
                      href={project.links.live}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ArrowUpRight className="mr-2 h-4 w-4" />
                      Live Demo
                    </Link>
                  </Button>
                ) : null}

                </div>
              </StaggerItem>
            </StaggerContainer>

            <div className="xl:col-span-7">
              <SectionReveal
                distance={6}
                delay={0.08}
              >
                <ProjectDetailSurface
                  as="div"
                  accent="aurora"
                  intensity="primary"
                  className="p-3 sm:p-4"
                >
                  <ProjectMediaViewer
                    media={project.heroMedia}
                    alt={project.title}
                  />
                </ProjectDetailSurface>
              </SectionReveal>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl space-y-14 px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          {/* Overview + Tech */}
          <div className="grid gap-6 xl:grid-cols-12 xl:items-start">
            <SectionReveal className="h-full xl:col-span-5">
              <ProjectDetailSurface
                aria-labelledby="project-overview-heading"
                accent="warm"
                intensity="secondary"
                className="h-full p-5 sm:p-6"
              >
                <ProjectDetailSectionHeader
                  id="project-overview-heading"
                  title="Overview"
                  icon={FileText}
                  accent="warm"
                />

                <div className="mt-4 space-y-3">
                  {project.overview.map((paragraph, index) => (
                    <p
                      key={index}
                      className="text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </ProjectDetailSurface>
            </SectionReveal>

            <SectionReveal className="xl:col-span-7" delay={0.08}>
              <ProjectTechGroups techGroups={project.techGroups} />
            </SectionReveal>
          </div>

          {/* Gallery + Highlights */}
          <div className="grid gap-6 xl:grid-cols-12 xl:items-start">
            <SectionReveal className="xl:col-span-7">
              <ProjectGallery items={project.gallery} />
            </SectionReveal>

            <SectionReveal className="xl:col-span-5" delay={0.08}>
              <ProjectHighlights items={project.highlights} />
            </SectionReveal>
          </div>

          <ProjectArchitecture
            image={project.architectureImage}
            summary={project.architectureSummary}
            points={project.architecturePoints}
          />

          <ProjectReadmeSection caseStudyMdx={project.caseStudyMdx} />

          <div className="grid gap-6 lg:grid-cols-2">
            <ProjectListSection
              title="Challenges & learnings"
              items={project.challenges}
              icon={Mountain}
              marker="dot"
              accent="cool"
            />
            <ProjectListSection
              title="Future improvements"
              items={project.futureImprovements}
              icon={TrendingUp}
              marker="dot"
              accent="violet"
            />
          </div>
        </div>
      </section>

      {/* Related */}
      <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
        <AnimatedPageHeader className="max-w-2xl">
          <p className="text-sm font-medium text-muted-foreground">
            Related projects
          </p>
          <span className="project-detail-related-accent" aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-foreground sm:text-3xl">
            More work to explore
          </h2>
        </AnimatedPageHeader>

        {relatedProjects.length > 0 ? (
          <StaggerContainer
            className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
            staggerChildren={0.035}
          >
            {relatedProjects.map((relatedProject) => (
              <StaggerItem key={relatedProject.id} className="h-full">
                <FeaturedProjectCard project={relatedProject} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <p className="mt-8 rounded-2xl border border-border/60 bg-background/80 p-6 text-sm text-muted-foreground">
            {detailData.relatedProjectsError ?? "No related projects yet."}
          </p>
        )}
      </section>
    </main>
  );
}
