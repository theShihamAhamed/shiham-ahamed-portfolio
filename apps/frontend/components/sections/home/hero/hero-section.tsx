import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";

import CopyEmail from "@/components/sections/contact/copy-email";
import { HeroContactAuroraLink } from "@/components/sections/home/hero/hero-contact-aurora-link";
import { HeroEntrance } from "@/components/sections/home/hero/hero-entrance";
import { Button } from "@/components/ui/button";
import { Spotlight } from "@/components/ui/spotlight-new";
import type { PublicSiteSettings } from "@portfolio/shared";

const fallbackHero = {
  badge: "Portfolio",
  title: "Selected work and engineering practice.",
  description: "Portfolio content will appear here after it is published.",
};

const fallbackProfile = {
  email: "",
  resumeUrl: "",
};

const highlightedHeroPhrase = "modern web apps and scalable software systems.";

const renderHeroTitle = (title: string) => {
  const normalizedTitle = title.trim();
  const phraseIndex = normalizedTitle.indexOf(highlightedHeroPhrase);

  if (phraseIndex === -1) {
    return normalizedTitle;
  }

  const beforePhrase = normalizedTitle.slice(0, phraseIndex).trim();
  const afterPhrase = normalizedTitle
    .slice(phraseIndex + highlightedHeroPhrase.length)
    .trim();

  return (
    <>
      {beforePhrase ? beforePhrase : null}
      <span className="mt-2 block bg-gradient-to-b from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent sm:mt-2.5">
        {highlightedHeroPhrase}
      </span>
      {afterPhrase ? <span className="mt-2 block">{afterPhrase}</span> : null}
    </>
  );
};

type Props = {
  settings: PublicSiteSettings | null;
  error?: string;
};

const HeroSection = ({ settings, error }: Props) => {
  const hero = settings?.hero ?? fallbackHero;
  const profile = settings
    ? { email: settings.email, resumeUrl: settings.resumeUrl }
    : fallbackProfile;

  return (
    <section id="hero" className="scroll-target relative isolate overflow-hidden">
      <Spotlight />

      <div className="absolute inset-0 -z-10 h-full w-full bg-background">
        <div className="absolute inset-0 [background-size:56px_56px] [background-image:linear-gradient(to_right,rgba(120,120,120,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(120,120,120,0.10)_1px,transparent_1px)] dark:[background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)]" />
        <div className="absolute inset-0 bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_25%,black)]" />
      </div>

      <div className="mx-auto flex min-h-[calc(100svh-56px)] max-w-7xl items-center justify-center px-4 sm:min-h-[calc(100svh-64px)] sm:px-6 lg:px-8">
        <div className="flex w-full justify-center py-16 sm:py-20 lg:py-22">
          <HeroEntrance
            badge={
              <div className="inline-flex max-w-[90vw] items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-sm transition-colors duration-200 hover:border-border hover:bg-accent/60 hover:text-foreground sm:px-4">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40 motion-safe:animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="truncate">{hero.badge}</span>
              </div>
            }
            title={
              <h1 className="mt-8 text-[2.6rem] font-bold leading-[0.95] tracking-[-0.065em] text-foreground sm:mt-9 sm:text-5xl lg:text-[3.75rem] xl:text-[4.25rem]">
                {renderHeroTitle(hero.title)}
              </h1>
            }
            description={
              <>
                <p className="mx-auto mt-7 max-w-xl px-1 text-sm leading-7 text-muted-foreground sm:mt-8 sm:text-[0.95rem] sm:leading-8">
                  {hero.description}
                </p>
                {error ? (
                  <p className="mx-auto mt-3 max-w-xl px-1 text-xs text-muted-foreground/80">
                    {error}
                  </p>
                ) : null}
              </>
            }
            actions={
              <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:items-center">
                <Button
                  asChild
                  size="lg"
                  className="group h-11 w-full rounded-xl bg-foreground px-7 text-sm font-medium text-background shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:opacity-90 hover:shadow-md sm:w-auto"
                >
                  <Link href="/projects">
                    View Projects
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                </Button>

                <HeroContactAuroraLink />

                {profile.resumeUrl ? (
                  <Button
                    asChild
                    variant="ghost"
                    size="lg"
                    className="h-11 w-full rounded-xl px-6 text-sm font-medium text-muted-foreground transition-all duration-200 ease-out hover:bg-accent/60 hover:text-foreground sm:w-auto"
                  >
                    <Link
                      href={profile.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Resume
                    </Link>
                  </Button>
                ) : null}
              </div>
            }
            copyEmail={
              profile.email ? (
                <div className="mt-6 flex justify-center">
                  <CopyEmail email={profile.email} />
                </div>
              ) : null
            }
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
