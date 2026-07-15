import type { Metadata } from "next";

import ContactCTASection from "@/components/sections/home/contact-cta/contact-cta-section";
import CurrentlyBuildingSection from "@/components/sections/home/currently-building/currently-building-section";
import FeaturedProjectsSection from "@/components/sections/home/featured-projects/featured-projects-section";
import HeroSection from "@/components/sections/home/hero/hero-section";
import QuickIntroSection from "@/components/sections/home/quick-intro/quick-intro-section";

import SectionQuickNav from "@/components/navigation/section-quick-nav";
import SkillsToolsSection from "@/components/sections/home/skills-tools/skills-tools-section";
import { homeSectionNavigation } from "@/data/site/section-navigation";
import { getHomePageData } from "@/lib/server/queries/get-home-page-data";
import StructuredData from "@/components/seo/structured-data";
import { getCanonicalUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Practical web applications, backend systems, and engineering work by Shiham Ahamed.",
  alternates: { canonical: getCanonicalUrl("/").pathname },
};

export const revalidate = 86400;

export default async function Home() {
  const homeData = await getHomePageData();
  const siteSettings = homeData.siteSettings;
  const sameAs = siteSettings
    ? [siteSettings.githubUrl, siteSettings.linkedinUrl].filter(Boolean)
    : [];

  return (
    <div className="">
      <StructuredData
        value={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Shiham Ahamed Portfolio",
          url: getCanonicalUrl("/").toString(),
        }}
      />
      {siteSettings ? (
        <StructuredData
          value={{
            "@context": "https://schema.org",
            "@type": "Person",
            name: siteSettings.name,
            url: getCanonicalUrl("/").toString(),
            jobTitle: siteSettings.targetRole,
            sameAs,
          }}
        />
      ) : null}
      <SectionQuickNav items={homeSectionNavigation} />
      <HeroSection
        settings={homeData.siteSettings}
        error={homeData.errors.siteSettings}
      />
      <QuickIntroSection />
      <FeaturedProjectsSection
        projects={homeData.featuredProjects}
        error={homeData.errors.featuredProjects}
      />
      <SkillsToolsSection />
      <CurrentlyBuildingSection
        items={homeData.currentlyBuilding}
        error={homeData.errors.currentlyBuilding}
      />
      <ContactCTASection />
    </div>
  );
}
