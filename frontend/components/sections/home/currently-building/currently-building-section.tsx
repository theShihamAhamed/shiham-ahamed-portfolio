import CurrentProjectCard from "./current-project-card";
import {
  AnimatedPageHeader,
  SectionReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/motion/motion-primitives";
import { mapPublicCurrentlyBuildingToCurrentProject } from "@/lib/mappers/currently-building";
import { getCurrentlyBuildingItemsFromMongo } from "@/lib/server/public-data/currently-building";
import type { CurrentProject } from "@/types/project";

type CurrentlyBuildingState =
  | {
      projects: CurrentProject[];
      error: null;
    }
  | {
      projects: [];
      error: string;
    };

const getCurrentlyBuildingProjects =
  async (): Promise<CurrentlyBuildingState> => {
    try {
      const items = await getCurrentlyBuildingItemsFromMongo();

      return {
        projects: items.map(mapPublicCurrentlyBuildingToCurrentProject),
        error: null,
      };
    } catch (error) {
      console.error("Failed to load currently-building items", error);

      return {
        projects: [],
        error: "Currently-building updates are temporarily unavailable.",
      };
    }
  };

const CurrentlyBuildingSection = async () => {
  const { projects, error } = await getCurrentlyBuildingProjects();

  return (
    <section
      id="currently-building"
      className="relative scroll-mt-24 py-12 sm:py-16 lg:py-18"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedPageHeader className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Currently building
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl lg:text-[2.75rem]">
            The systems I’m building now
            <span className="block text-muted-foreground">
              reflect where I want to grow next.
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            These in-progress projects represent my current focus on scalable
            backend systems, modern product development, cloud-native thinking,
            and practical engineering depth.
          </p>
        </AnimatedPageHeader>

        {projects.length > 0 ? (
          <StaggerContainer
            className="mt-12 grid grid-cols-1 gap-5 xl:grid-cols-2"
            staggerChildren={0.035}
          >
            {projects.map((project) => (
              <StaggerItem key={project.id}>
                <CurrentProjectCard project={project} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <SectionReveal className="mx-auto mt-12 max-w-2xl rounded-2xl border border-border/60 bg-background/80 p-6 text-center text-sm leading-7 text-muted-foreground shadow-sm backdrop-blur-xl">
            {error ?? "Currently-building updates are being curated."}
          </SectionReveal>
        )}
      </div>
    </section>
  );
};

export default CurrentlyBuildingSection;
