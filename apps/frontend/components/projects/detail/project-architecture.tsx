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
      <section className="rounded-2xl border border-border/50 bg-card p-5 sm:p-6">
        <h2 className="text-sm font-medium text-muted-foreground">
          Architecture
        </h2>

        <div className="mt-5 grid gap-6 xl:grid-cols-12 xl:items-start">
          <div className="flex flex-col gap-4 xl:col-span-5">
            {summary ? (
              <p className="text-sm leading-7 text-muted-foreground sm:text-base">
                {summary}
              </p>
            ) : null}

            {points?.length ? (
              <ul className="space-y-3">
                {points.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-[11px] size-1.5 shrink-0 rounded-full bg-muted-foreground/50"
                    />
                    <span className="text-sm leading-7 text-foreground">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
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
