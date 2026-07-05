"use client";

import * as React from "react";
import Image from "next/image";
import { Expand } from "lucide-react";

import { ProjectImageLightbox } from "@/components/projects/detail/project-image-lightbox";

type Props = {
  image?: string;
  summary?: string;
  points?: string[];
};

const ProjectArchitecture = ({ image, summary, points }: Props) => {
  const [lightboxOpen, setLightboxOpen] = React.useState(false);

  if (!image && !summary && !points?.length) return null;

  return (
    <>
      <section className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-background/80 p-5 shadow-sm backdrop-blur-xl sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.06),transparent_28%)]" />

        <div className="relative z-10">
          <p className="text-sm font-medium text-muted-foreground">
            Architecture
          </p>

          <div className="mt-5 grid gap-6 xl:grid-cols-12 xl:items-start">
            <div className="flex flex-col gap-4 xl:col-span-5">
              {summary ? (
                <p className="text-sm leading-7 text-muted-foreground sm:text-base">
                  {summary}
                </p>
              ) : null}

              {points?.length ? (
                <div className="grid gap-3">
                  {points.map((point) => (
                    <div
                      key={point}
                      className="rounded-[1.25rem] border border-border/60 bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm backdrop-blur-sm"
                    >
                      {point}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="min-w-0 xl:col-span-7">
              {image ? (
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
              ) : null}
            </div>
          </div>
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
