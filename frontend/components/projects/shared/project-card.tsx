import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MoveRight } from "lucide-react";
import { GitHubLogoIcon } from "@radix-ui/react-icons";

import { Project } from "@/types/project";
import { Button } from "@/components/ui/button";
import TechTag from "./tech-tag";
import { cn, formatProjectDateRange } from "@/lib/utils";

type Props = {
  project: Project;
};

const FeaturedProjectCard = ({ project }: Props) => {
  const dateRange = formatProjectDateRange(
    project.startDate,
    project.endDate,
    project.status === "In Progress",
  );

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm transition-all duration-200 ease-out",
        "hover:-translate-y-0.5 hover:border-border hover:shadow-[0_18px_48px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_18px_48px_rgba(255,255,255,0.035)]",
      )}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/10] overflow-hidden bg-muted/20">
        <Image
          src={project.thumbnail}
          alt={project.title}
          fill
          sizes="(min-width: 1280px) 392px, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.025]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-background/10 to-transparent" />

        {/* Status badge */}
        <div className="absolute left-3.5 top-3.5">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase backdrop-blur-md",
              project.status === "In Progress"
                ? "border-amber-500/25 bg-amber-500/15 text-amber-400"
                : "border-emerald-500/25 bg-emerald-500/15 text-emerald-400",
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                project.status === "In Progress"
                  ? "bg-amber-400"
                  : "bg-emerald-400",
              )}
            />
            {project.status}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex-1">
          <h3 className="text-[1.05rem] font-semibold tracking-[-0.025em] text-foreground leading-snug">
            {project.title}
          </h3>

          {/* Project date range */}
          {dateRange && (
            <p className="mt-1.5 text-xs font-medium text-muted-foreground/75">
              {dateRange}
            </p>
          )}

          <p className="mt-2.5 text-sm leading-6 text-muted-foreground line-clamp-2">
            {project.shortDescription}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.techStack.slice(0, 5).map((tag) => (
            <TechTag key={`${project.title}-${tag.label}`} tag={tag} />
          ))}
          {project.techStack.length > 5 && (
            <span className="inline-flex items-center rounded-full border border-border/60 px-2.5 py-1 text-xs font-medium text-muted-foreground">
              +{project.techStack.length - 5}
            </span>
          )}
        </div>

        {/* Divider + Actions */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-4">
          <Button
            asChild
            className="h-9 flex-1 rounded-lg bg-foreground px-3.5 text-sm font-medium text-background shadow-sm transition-all duration-200 ease-out hover:-translate-y-px hover:bg-foreground/90 sm:flex-none"
          >
            <Link href={`/projects/${project.slug}`}>
              View details
              <MoveRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>

          <div className="flex items-center gap-1.5">
            {project.links.github && (
              <Button
                asChild
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-lg border-border/60 bg-background/60 text-muted-foreground transition-all duration-200 ease-out hover:-translate-y-px hover:border-border hover:bg-accent hover:text-foreground"
              >
                <Link
                  href={project.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View ${project.title} source code on GitHub`}
                >
                  <GitHubLogoIcon className="h-4 w-4" />
                </Link>
              </Button>
            )}

            {project.links.live && (
              <Button
                asChild
                variant="outline"
                className="h-9 rounded-lg border-border/60 bg-background/60 px-3 text-sm text-muted-foreground transition-all duration-200 ease-out hover:-translate-y-px hover:border-border hover:bg-accent hover:text-foreground"
              >
                <Link
                  href={project.links.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open live demo for ${project.title}`}
                >
                  <span>Live demo</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default FeaturedProjectCard;
