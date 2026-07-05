"use client";

import Image from "next/image";
import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { Play } from "lucide-react";

import { motionTokens } from "@/components/motion/motion-tokens";
import { getYouTubeEmbedSource } from "@/lib/video/youtube";

type ProjectYouTubePlayerProps = {
  videoUrl: string;
  poster?: string;
  title: string;
};

const posterImageSizes = "(min-width: 1280px) 54vw, 100vw";

export default function ProjectYouTubePlayer({
  videoUrl,
  poster,
  title,
}: ProjectYouTubePlayerProps) {
  const [isRequested, setIsRequested] = React.useState(false);
  const shouldReduceMotion = useReducedMotion() ?? false;
  const source = React.useMemo(
    () => getYouTubeEmbedSource(videoUrl),
    [videoUrl],
  );

  if (!source) {
    return (
      <div className="relative flex aspect-video min-h-[240px] items-center justify-center overflow-hidden rounded-[1.5rem] border border-border/60 bg-black text-white shadow-sm">
        {poster ? (
          <Image
            src={poster}
            alt=""
            fill
            sizes={posterImageSizes}
            className="object-cover opacity-45"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/30" />
        <p className="relative z-10 px-6 text-center text-sm font-medium text-white/80">
          Video preview unavailable
        </p>
      </div>
    );
  }

  if (isRequested) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-[1.5rem] border border-border/60 bg-black shadow-sm">
        <iframe
          className="absolute inset-0 h-full w-full"
          src={source.autoplayEmbedUrl}
          title={`${title} demo video`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }

  return (
    <motion.button
      type="button"
      initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: shouldReduceMotion ? 0.01 : motionTokens.duration.base,
        ease: motionTokens.ease,
      }}
      className="group relative block aspect-video w-full overflow-hidden rounded-[1.5rem] border border-border/60 bg-black text-left shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      onClick={() => setIsRequested(true)}
      aria-label={`Play ${title} demo video`}
    >
      {poster ? (
        <Image
          src={poster}
          alt=""
          fill
          sizes={posterImageSizes}
          className="object-cover opacity-80 transition duration-300 group-hover:scale-[1.015] group-hover:opacity-90"
        />
      ) : null}
      <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20" />
      <span className="absolute inset-x-5 bottom-5 flex items-center justify-between gap-4 text-white sm:inset-x-6 sm:bottom-6">
        <span>
          <span className="block text-xs font-medium uppercase tracking-[0.2em] text-white/60">
            Demo video
          </span>
          <span className="mt-2 block text-base font-semibold sm:text-lg">
            Watch project walkthrough
          </span>
        </span>
        <span className="grid size-14 shrink-0 place-items-center rounded-full border border-white/20 bg-white/15 shadow-lg backdrop-blur transition group-hover:scale-105 group-hover:bg-white/20 sm:size-16">
          <Play className="ml-1 size-6 fill-current" aria-hidden="true" />
        </span>
      </span>
    </motion.button>
  );
}
