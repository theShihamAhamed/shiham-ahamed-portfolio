import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  AnimatedPageHeader,
  SectionReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/motion/motion-primitives";
import SectionQuickNav from "@/components/navigation/section-quick-nav";
import CertificationsSection from "@/components/sections/about/certifications-section";
import EducationCard from "@/components/sections/about/education-card";
import AchievementsSection from "@/components/sections/about/achievements-section";
import AboutStatsSection from "@/components/sections/about/about-stats-section";
import {
  aboutClosing,
  aboutIntro,
  aboutStory,
  education,
  focusAreas,
  getAboutStats,
  timeline,
  values,
} from "@/data/site/about";
import { aboutSectionNavigation } from "@/data/site/section-navigation";
import Image from "next/image";
import {
  mapPublicAchievementToAchievement,
  mapPublicCertificationToCertification,
} from "@/lib/mappers/about";
import { getAboutPageData } from "@/lib/server/queries/get-about-page-data";
import type { Achievement, Certification } from "@/types/about";
import { getCanonicalUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About",
  description: "About Shiham Ahamed, his software engineering focus, education, and learning journey.",
  alternates: { canonical: getCanonicalUrl("/about").pathname },
};

export const revalidate = 86400;

const DynamicSectionFallback = ({ message }: { message: string }) => (
  <div className="mt-8 rounded-2xl border border-border/60 bg-background/80 p-6 text-sm leading-7 text-muted-foreground shadow-sm backdrop-blur-xl">
    {message}
  </div>
);

export default async function AboutPage() {
  const data = await getAboutPageData();
  const certifications: Certification[] = data.certifications.map(
    mapPublicCertificationToCertification,
  );
  const achievements: Achievement[] = data.achievements.map(
    mapPublicAchievementToAchievement,
  );
  const stats = getAboutStats(data.visibleProjectCount);

  return (
    <main className="pb-20 sm:pb-24 lg:pb-28">
      <SectionQuickNav items={aboutSectionNavigation} />

      {/* Hero */}
      <section
        id="about-hero"
        className="scroll-target relative overflow-hidden border-b border-border/60"
      >
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <AnimatedPageHeader className="lg:col-span-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {aboutIntro.label}
              </p>

              <h1 className="mt-4 text-4xl font-bold tracking-[-0.055em] text-foreground sm:text-5xl lg:text-6xl">
                {aboutIntro.title}
              </h1>

              <p className="mt-6 max-w-2xl text-sm leading-8 text-muted-foreground sm:text-base sm:leading-8">
                {aboutIntro.description}
              </p>
            </AnimatedPageHeader>

            <div className="lg:col-span-5">
              <SectionReveal
                className="mx-auto max-w-sm lg:ml-auto lg:mr-0"
                distance={6}
                delay={0.08}
              >
                <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-background/80 p-3 shadow-sm backdrop-blur-xl">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.10),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_35%)]" />

                  <div className="relative overflow-hidden rounded-[1.5rem] border border-border/60 bg-muted/20">
                    <div className="relative aspect-[4/5] w-full">
                      <Image
                        src="/about/profile.png"
                        alt="Shiham Ahamed"
                        fill
                        sizes="(min-width: 1024px) 384px, (min-width: 640px) 384px, calc(100vw - 2rem)"
                        className="object-cover"
                        priority
                      />
                    </div>
                  </div>
                </div>
              </SectionReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section
        id="about-summary"
        className="scroll-target mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
      >
        <SectionReveal className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Professional summary
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-[-0.04em] text-foreground sm:text-3xl">
              A deeper view of how I learn and build
            </h2>
          </div>

          <div className="space-y-5 lg:col-span-8">
            {aboutStory.map((paragraph, index) => (
              <p
                key={index}
                className="text-base leading-8 text-muted-foreground"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </SectionReveal>
      </section>

      {/* Stats */}
      <AboutStatsSection stats={stats} />

      {/* Focus Areas */}
      <section
        id="focus-areas"
        className="scroll-target mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
      >
        <AnimatedPageHeader>
          <p className="text-sm font-medium text-muted-foreground">
            Focus areas
          </p>

          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-foreground sm:text-3xl">
            The areas I’m actively building depth in
          </h2>
        </AnimatedPageHeader>

        <StaggerContainer
          className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2"
          staggerChildren={0.035}
        >
          {focusAreas.map((item) => (
            <StaggerItem key={item.id}>
              <article className="rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-border hover:shadow-[0_16px_40px_rgba(0,0,0,0.07)] dark:hover:shadow-[0_16px_40px_rgba(255,255,255,0.03)] sm:p-7">
                <h3 className="text-lg font-semibold tracking-[-0.025em] text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-sm leading-7 text-muted-foreground">
                  {item.description}
                </p>
              </article>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Education */}
      <section
        id="education"
        className="scroll-target mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
      >
        <p className="text-sm font-medium text-muted-foreground">Education</p>
        <EducationCard education={education} />
      </section>

      {/* Certifications */}
      <section
        id="certifications"
        className="scroll-target mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
      >
        <AnimatedPageHeader>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Certifications
          </p>

          <h2 className="mt-3 text-2xl font-bold tracking-[-0.04em] text-foreground sm:text-3xl">
            Certifications that support my learning journey
          </h2>
        </AnimatedPageHeader>

        {certifications.length > 0 ? (
          <CertificationsSection items={certifications} />
        ) : (
          <SectionReveal>
            <DynamicSectionFallback
              message={
                data.errors.certifications ??
                "Certifications are being curated."
              }
            />
          </SectionReveal>
        )}
      </section>

      {/* Achievements */}
      <section
        id="achievements"
        className="scroll-target mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
      >
        <AnimatedPageHeader>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Achievements
          </p>

          <h2 className="mt-3 text-2xl font-bold tracking-[-0.04em] text-foreground sm:text-3xl">
            Competitions, participation, and results
          </h2>
        </AnimatedPageHeader>

        {achievements.length > 0 ? (
          <AchievementsSection items={achievements} />
        ) : (
          <SectionReveal>
            <DynamicSectionFallback
              message={
                data.errors.achievements ?? "Achievements are being curated."
              }
            />
          </SectionReveal>
        )}
      </section>

      {/* Timeline */}
      <section
        id="journey"
        className="scroll-target mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20"
      >
        <SectionReveal className="rounded-3xl border border-border/60 bg-background/80 p-6 shadow-sm backdrop-blur-xl sm:p-8">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-muted-foreground">Journey</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-foreground sm:text-3xl">
              A simple view of how I’ve grown so far
            </h2>
          </div>

          <div className="mt-8 space-y-6">
            {timeline.map((item) => (
              <div
                key={item.id}
                className="grid gap-3 border-l-2 border-border/40 pl-5 sm:grid-cols-[120px_1fr] sm:gap-6"
              >
                <div className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground pt-0.5">
                  {item.year}
                </div>

                <div>
                  <h3 className="text-base font-semibold tracking-[-0.025em] text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-7 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </SectionReveal>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <SectionReveal className="lg:col-span-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              How I work
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-[-0.04em] text-foreground sm:text-3xl">
              The principles that guide the way I build
            </h2>
          </SectionReveal>

          <div className="grid gap-4 lg:col-span-8">
            {values.map((item) => (
              <div
                key={item}
                className="rounded-xl border border-border/60 bg-background/80 px-5 py-3.5 text-sm leading-7 text-foreground/85 shadow-sm backdrop-blur-sm transition-colors hover:border-border hover:bg-accent/40"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="about-contact"
        className="scroll-target mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <SectionReveal className="rounded-[2rem] border border-border/60 bg-background/80 px-6 py-10 shadow-sm backdrop-blur-xl sm:px-8 sm:py-12 lg:px-12">
          <div className="max-w-3xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Looking ahead
            </p>

            <h2 className="mt-3 text-2xl font-bold tracking-[-0.04em] text-foreground sm:text-3xl lg:text-4xl">
              Continuing to grow through
              <span className="block text-muted-foreground">
                real projects and meaningful opportunities.
              </span>
            </h2>

            <p className="mt-5 text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
              {aboutClosing}
            </p>

            <div className="mt-8">
              <Button
                asChild
                className="h-11 rounded-lg bg-foreground px-5 text-background hover:opacity-90"
              >
                <Link href="/contact">
                  Get in touch
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </SectionReveal>
      </section>
    </main>
  );
}
