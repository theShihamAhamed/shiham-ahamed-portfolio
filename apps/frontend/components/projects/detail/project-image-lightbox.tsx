"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

export type LightboxImage = {
  src: string;
  alt: string;
  caption?: string;
};

type ProjectImageLightboxProps = {
  images: LightboxImage[];
  activeIndex: number;
  open: boolean;
  title: string;
  onIndexChange: (index: number) => void;
  onOpenChange: (open: boolean) => void;
};

export function ProjectImageLightbox({
  images,
  activeIndex,
  open,
  title,
  onIndexChange,
  onOpenChange,
}: ProjectImageLightboxProps) {
  const activeImage = images[activeIndex] ?? images[0];
  const hasMultipleImages = images.length > 1;

  const goNext = React.useCallback(() => {
    if (!images.length) return;
    onIndexChange((activeIndex + 1) % images.length);
  }, [activeIndex, images.length, onIndexChange]);

  const goPrev = React.useCallback(() => {
    if (!images.length) return;
    onIndexChange((activeIndex - 1 + images.length) % images.length);
  }, [activeIndex, images.length, onIndexChange]);

  React.useEffect(() => {
    if (!open || !hasMultipleImages) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        goNext();
      }

      if (event.key === "ArrowLeft") {
        goPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev, hasMultipleImages, open]);

  if (!activeImage) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!fixed !inset-0 !left-0 !top-0 !z-[999] !h-dvh !w-screen !max-w-none !translate-x-0 !translate-y-0 rounded-none border-none bg-black/95 p-0 shadow-none sm:!max-w-none sm:rounded-none [&>button]:!right-4 [&>button]:!top-4 [&>button]:!left-auto [&>button]:!translate-x-0 [&>button]:!translate-y-0 [&>button]:!h-11 [&>button]:!w-11 [&>button]:!rounded-full [&>button]:!border [&>button]:!border-white/15 [&>button]:!bg-black/65 [&>button]:!text-white [&>button]:!opacity-100 [&>button]:!shadow-lg [&>button]:backdrop-blur-md [&>button]:hover:!bg-black/80">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">
          Full-screen preview for {activeImage.alt}.
        </DialogDescription>

        <div className="relative flex h-full w-full items-center justify-center overflow-hidden px-3 py-16 sm:px-6">
          {hasMultipleImages ? (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-3 top-1/2 z-20 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:left-5 sm:h-11 sm:w-11"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={goNext}
                className="absolute right-3 top-1/2 z-20 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:right-5 sm:h-11 sm:w-11"
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </>
          ) : null}

          <div className="flex h-full w-full min-w-0 items-center justify-center">
            <Image
              src={activeImage.src}
              alt={activeImage.alt}
              width={1800}
              height={1200}
              sizes="100vw"
              className="block h-auto max-h-[calc(100dvh-8rem)] w-auto max-w-[calc(100vw-1.5rem)] object-contain sm:max-w-[calc(100vw-3rem)]"
            />
          </div>

          {activeImage.caption ? (
            <p className="absolute bottom-4 left-1/2 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-full border border-white/10 bg-black/55 px-3 py-1.5 text-center text-xs text-white/80 backdrop-blur">
              {activeImage.caption}
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
