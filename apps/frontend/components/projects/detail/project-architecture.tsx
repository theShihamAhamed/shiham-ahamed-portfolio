"use client";

import * as React from "react";
import Image from "next/image";
import { Expand, Network } from "lucide-react";

import { ProjectImageLightbox } from "@/components/projects/detail/project-image-lightbox";
import ProjectDetailSectionHeader from "@/components/projects/detail/project-detail-section-header";
import ProjectDetailSurface from "@/components/projects/detail/project-detail-surface";
import { cn } from "@/lib/utils";

type Props = {
  image?: string;
  summary?: string;
  points?: string[];
};

const ProjectArchitecture = ({ image, summary, points }: Props) => {
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const hasText = Boolean(summary || points?.length);

  if (!image && !hasText) return null;

  return (
    <>
      <section aria-labelledby="project-architecture-heading">
        <div
          className={cn(
            "grid gap-6",
            hasText && image && "xl:grid-cols-12 xl:items-start",
          )}
        >
          {hasText ? (
            <ProjectDetailSurface
              as="div"
              accent="warm"
              intensity="secondary"
              className={cn("p-5 sm:p-6", image && "xl:col-span-5")}
            >
              <ProjectDetailSectionHeader
                id="project-architecture-heading"
                title="Architecture"
                icon={Network}
                accent="warm"
              />

              <div className="mt-4 flex flex-col gap-3">
                {summary ? (
                  <p className="text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                    {summary}
                  </p>
                ) : null}

                {points?.length ? (
                  <ul className="space-y-2.5">
                    {points.map((point) => (
                      <li key={point} className="flex items-start gap-3">
                        <span
                          aria-hidden="true"
                          className="project-detail-list-dot mt-[11px] size-1.5 shrink-0 rounded-full"
                        />
                        <span className="text-sm leading-6 text-foreground">
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </ProjectDetailSurface>
          ) : null}

          {image ? (
            <ProjectDetailSurface
              as="div"
              accent="violet"
              intensity="primary"
              className={cn(
                hasText ? "p-2 sm:p-3 xl:col-span-7" : "p-5 sm:p-6",
              )}
            >
              {!hasText ? (
                <ProjectDetailSectionHeader
                  id="project-architecture-heading"
                  title="Architecture"
                  icon={Network}
                  accent="violet"
                />
              ) : null}

              <div className={cn(!hasText && "mt-5")}>
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="group relative block w-full overflow-hidden rounded-[1.5rem] border border-border/60 bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 cursor-pointer"
                  aria-label="Preview architecture diagram"
                >
                  <div className="relative aspect-[16/10] max-h-[520px] w-full">
                    <Image
                      src={image}
                      alt="Architecture diagram"
                      fill
                      sizes="(min-width: 1280px) 54vw, 100vw"
                      className="object-contain"
                    />
                  </div>
                  <span className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white opacity-0 backdrop-blur transition-all duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                    <Expand className="h-4 w-4" aria-hidden="true" />
                  </span>
                </button>
              </div>
            </ProjectDetailSurface>
          ) : null}
        </div>
      </section>

      {image ? (
        <ProjectImageLightbox
          images={[{ src: image, alt: "Architecture diagram" }]}
          activeIndex={0}
          open={lightboxOpen}
          title="Architecture diagram preview"
          onIndexChange={() => undefined}
          onOpenChange={setLightboxOpen}
        />
      ) : null}
    </>
  );
};

export default ProjectArchitecture;
