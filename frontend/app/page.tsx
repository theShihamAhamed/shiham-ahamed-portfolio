import ContactCTASection from "@/components/sections/home/contact-cta/contact-cta-section";
import CurrentlyBuildingSection from "@/components/sections/home/currently-building/currently-building-section";
import FeaturedProjectsSection from "@/components/sections/home/featured-projects/featured-projects-section";
import HeroSection from "@/components/sections/home/hero/hero-section";
import QuickIntroSection from "@/components/sections/home/quick-intro/quick-intro-section";

import SectionQuickNav from "@/components/navigation/section-quick-nav";
import SkillsToolsSection from "@/components/sections/home/skills-tools/skills-tools-section";
import { homeSectionNavigation } from "@/data/site/section-navigation";

export const revalidate = 3600;

export default function Home() {
  return (
    <div className="">
      <SectionQuickNav items={homeSectionNavigation} />
      <HeroSection />
      <QuickIntroSection />
      <FeaturedProjectsSection />
      <SkillsToolsSection />
      <CurrentlyBuildingSection />
      <ContactCTASection />
    </div>
  );
}
