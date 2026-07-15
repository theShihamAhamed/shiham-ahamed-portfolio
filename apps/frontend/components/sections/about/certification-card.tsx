"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Certification } from "@/types/about";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Props = {
  item: Certification;
};

const CertificationCard = ({ item }: Props) => {
  return (
    <article className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_16px_40px_rgba(255,255,255,0.03)] sm:px-5 sm:py-2">
      <div className="grid gap-4 sm:grid-cols-[1fr_120px] sm:items-start">
        <div>
          <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-foreground">
            {item.title}
          </h3>

          <p className="mt-1 text-sm font-medium text-foreground/85">
            {item.provider}
          </p>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {item.note}
          </p>

          {/* Skills tags */}
          {item.skills && item.skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {item.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center rounded-full border border-border/60 bg-accent/30 px-2.5 py-1 text-xs font-medium text-foreground/80"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

        </div>

        <div className="flex flex-col gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <button
                className="group relative overflow-hidden rounded-xl border border-border/60 bg-muted/20 shadow-sm transition-all duration-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/25"
                aria-label={`Preview ${item.title} certificate`}
              >
                <div className="relative aspect-[4/3] w-full sm:w-[120px]">
                  <Image
                    src={item.image}
                    alt={item.imageAlt || item.title}
                    fill
                    sizes="120px"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/50 group-focus-visible:bg-black/50">
                    <span className="px-2 text-center text-xs font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                      Click to preview
                    </span>
                  </div>
                </div>
              </button>
            </DialogTrigger>

            <DialogContent className="!fixed !inset-0 !left-0 !top-0 !z-[999] !h-dvh !w-screen !max-w-none !translate-x-0 !translate-y-0 rounded-none border-none bg-black/95 p-0 shadow-none sm:!max-w-none sm:rounded-none [&>button]:!right-5 [&>button]:!top-5 [&>button]:!left-auto [&>button]:!translate-x-0 [&>button]:!translate-y-0 [&>button]:!h-11 [&>button]:!w-11 [&>button]:!rounded-full [&>button]:!border [&>button]:!border-white/15 [&>button]:!bg-black/65 [&>button]:!text-white [&>button]:!opacity-100 [&>button]:!shadow-lg [&>button]:backdrop-blur-md [&>button]:hover:!bg-black/80">
              <DialogTitle className="sr-only">
                {item.title} certificate preview
              </DialogTitle>

              <DialogDescription className="sr-only">
                Full-screen preview of the certificate image for {item.title}.
              </DialogDescription>

              <div className="flex h-full w-full items-center justify-center overflow-hidden p-4 sm:p-6">
                <Image
                  src={item.image}
                  alt={item.imageAlt || item.title}
                  width={1800}
                  height={1300}
                  sizes="96vw"
                  className="block h-auto max-h-[92dvh] w-auto max-w-[96vw] object-contain"
                />
              </div>
            </DialogContent>
          </Dialog>

          {item.verifyUrl ? (
            <Button asChild variant="outline" className="h-9 w-full rounded-lg">
              <Link
                href={item.verifyUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Verify
                <ExternalLink className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
};

export default CertificationCard;
