import { BentoGridItem } from "@/components/ui/bento-grid";
import {
  AnimatedPageHeader,
  StaggerContainer,
  StaggerItem,
} from "@/components/motion/motion-primitives";
import AboutCard from "./cards/about-card";
import FocusCard from "./cards/focus-card";
import StackCard from "./cards/stack-card";
import CurrentlyBuildingCard from "./cards/currently-building-card";
import ApproachCard from "./cards/approach-card";
import LearningJourneyCard from "./cards/learning-journey-card";

const QuickIntroSection = () => {
  return (
    <section
      id="about"
      className="scroll-target relative py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedPageHeader className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Quick introduction
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl lg:text-[2.75rem]">
            A quick view of how I build
            <span className="block text-muted-foreground">
              and where I’m growing.
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            A snapshot of my software engineering background, current focus,
            practical project work, and the way I approach learning through real
            development.
          </p>
        </AnimatedPageHeader>

        <StaggerContainer
          className="mx-auto mt-12 grid w-full grid-cols-1 gap-4 md:auto-rows-[14rem] md:grid-cols-8 lg:auto-rows-[15rem] lg:gap-5"
          staggerChildren={0.035}
        >
          <StaggerItem className="md:col-span-5 md:row-span-2">
            <BentoGridItem className="h-full border-[var(--home-border-quiet)] bg-[var(--home-surface-quiet)]">
              <AboutCard />
            </BentoGridItem>
          </StaggerItem>

          <StaggerItem className="md:col-span-3 md:row-span-1">
            <BentoGridItem className="h-full border-[var(--home-border-quiet)] bg-[var(--home-surface-quiet)]">
              <FocusCard />
            </BentoGridItem>
          </StaggerItem>

          <StaggerItem className="md:col-span-3 md:row-span-1">
            <BentoGridItem className="h-full border-[var(--home-border-quiet)] bg-[var(--home-surface-quiet)]">
              <StackCard />
            </BentoGridItem>
          </StaggerItem>

          <StaggerItem className="md:col-span-3 md:row-span-1">
            <BentoGridItem className="h-full border-[var(--home-border-quiet)] bg-[var(--home-surface-quiet)]">
              <CurrentlyBuildingCard />
            </BentoGridItem>
          </StaggerItem>

          <StaggerItem className="md:col-span-5 md:row-span-2">
            <BentoGridItem className="h-full border-[var(--home-border-quiet)] bg-[var(--home-surface-quiet)]">
              <ApproachCard />
            </BentoGridItem>
          </StaggerItem>

          <StaggerItem className="md:col-span-3 md:row-span-1">
            <BentoGridItem className="h-full border-[var(--home-border-quiet)] bg-[var(--home-surface-quiet)]">
              <LearningJourneyCard />
            </BentoGridItem>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  );
};

export default QuickIntroSection;
