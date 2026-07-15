"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";

import { ProjectGalleryItem } from "@/types/project";
import { cn } from "@/lib/utils";
import {
  ProjectImageLightbox,
  type LightboxImage,
} from "@/components/projects/detail/project-image-lightbox";

type Props = {
  items: ProjectGalleryItem[];
};

const ProjectGallery = ({ items }: Props) => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);

  const thumbnailStripRef = React.useRef<HTMLDivElement | null>(null);
  const thumbnailRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const activeImage = items[activeIndex] ?? items[0];
  const lightboxImages = React.useMemo<LightboxImage[]>(
    () =>
      items.map((item) => ({
        src: item.src,
        alt: item.alt,
        caption: item.caption,
      })),
    [items],
  );

  const goNext = React.useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const goPrev = React.useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  React.useEffect(() => {
    const strip = thumbnailStripRef.current;
    const activeThumb = thumbnailRefs.current[activeIndex];

    if (!strip || !activeThumb) return;

    const stripWidth = strip.clientWidth;
    const thumbLeft = activeThumb.offsetLeft;
    const thumbWidth = activeThumb.clientWidth;

    const targetScrollLeft = thumbLeft - stripWidth / 2 + thumbWidth / 2;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    strip.scrollTo({
      left: Math.max(0, targetScrollLeft),
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [activeIndex]);

  if (!items.length) return null;

  return (
    <>
      <section className="relative max-w-full overflow-hidden rounded-[2rem] border border-border/60 bg-background/80 p-5 shadow-sm backdrop-blur-xl sm:p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.10),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.08),transparent_30%)]" />

        <div className="relative z-10">
          <p className="text-sm font-medium text-muted-foreground">Gallery</p>

          <div className="mt-5">
            <div className="relative overflow-hidden rounded-[1.5rem] border border-border/60 bg-muted/20">
              <div className="relative aspect-[16/10] w-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeImage.id}
                    initial={{ opacity: 0.9 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.1, ease: "easeOut" }}
                    className="absolute inset-0"
                  >
                    <button
                      type="button"
                      onClick={() => setLightboxOpen(true)}
                      className="group relative h-full w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 cursor-pointer"
                      aria-label={`Preview ${activeImage.alt}`}
                    >
                      <Image
                        src={activeImage.src}
                        alt={activeImage.alt}
                        fill
                        className="object-contain"
                        sizes="(min-width: 1280px) 54vw, 100vw"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                      <div className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white opacity-0 backdrop-blur transition-all duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                        <Expand className="h-4 w-4" />
                      </div>
                    </button>
                  </motion.div>
                </AnimatePresence>

                {items.length > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={goPrev}
                      className="absolute left-4 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 cursor-pointer"
                      aria-label="Previous screenshot"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={goNext}
                      className="absolute right-4 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 cursor-pointer"
                      aria-label="Next screenshot"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                ) : null}
              </div>
            </div>

            <div
              ref={thumbnailStripRef}
              className="gallery-scrollbar mt-4 flex max-w-full gap-3 overflow-x-auto overscroll-x-contain pb-2"
            >
              {items.map((item, index) => (
                <button
                  ref={(el) => {
                    thumbnailRefs.current[index] = el;
                  }}
                  key={item.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Show ${item.alt}`}
                  aria-pressed={activeIndex === index}
                  className={cn(
                    "relative h-20 w-32 shrink-0 overflow-hidden rounded-2xl border border-border/60 bg-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 cursor-pointer",
                    activeIndex === index
                      ? "opacity-100"
                      : "opacity-75 hover:opacity-100",
                  )}
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    className="object-contain"
                    sizes="128px"
                  />

                  {activeIndex !== index ? (
                    <span className="pointer-events-none absolute inset-0 bg-black/5 dark:bg-black/10" />
                  ) : null}

                  {activeIndex === index ? (
                    <span className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-inset ring-foreground/90" />
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ProjectImageLightbox
        images={lightboxImages}
        activeIndex={activeIndex}
        open={lightboxOpen}
        title="Project gallery preview"
        onIndexChange={setActiveIndex}
        onOpenChange={setLightboxOpen}
      />
    </>
  );
};

export default ProjectGallery;
