"use client";

import * as React from "react";

import {
  AnimatedPageHeader,
  SectionReveal,
} from "@/components/motion/motion-primitives";
import type { Project } from "@/types/project";
import FeaturedProjectCard from "../shared/project-card";
import ProjectCatalogToolbar from "./project-catalog-toolbar";
import {
  filterAndSortProjects,
  getProjectCatalogOptions,
  hasActiveProjectCatalogState,
  parseProjectCatalogState,
  removeProjectCatalogSummary,
  resetProjectCatalogState,
  resetProjectFiltersAndSort,
  serializeProjectCatalogState,
  type ProjectCatalogState,
  type ProjectCatalogSummaryKey,
} from "./project-catalog-state";

type Props = {
  projects: Project[];
  initialState: ProjectCatalogState;
};

const SEARCH_URL_DEBOUNCE_MS = 250;

const ProjectsPageClient = ({ projects, initialState }: Props) => {
  const options = React.useMemo(
    () => getProjectCatalogOptions(projects),
    [projects],
  );
  const [catalogState, setCatalogState] =
    React.useState<ProjectCatalogState>(initialState);
  const pendingSearchWriteRef = React.useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const cancelPendingSearchWrite = React.useCallback(() => {
    if (pendingSearchWriteRef.current === null) return;

    clearTimeout(pendingSearchWriteRef.current);
    pendingSearchWriteRef.current = null;
  }, []);

  const writeCatalogUrl = React.useCallback(
    (nextState: ProjectCatalogState, mode: "push" | "replace") => {
      const nextSearch = serializeProjectCatalogState(nextState).toString();
      if (nextSearch === window.location.search.slice(1)) return;

      const href = nextSearch.length > 0 ? `/projects?${nextSearch}` : "/projects";
      const historyMethod = mode === "push" ? "pushState" : "replaceState";

      // Next integrates native History writes without refetching this client-owned catalog.
      window.history[historyMethod](null, "", href);
    },
    [],
  );

  React.useEffect(() => {
    const handlePopState = () => {
      cancelPendingSearchWrite();
      setCatalogState(
        parseProjectCatalogState(
          new URLSearchParams(window.location.search),
          options,
        ),
      );
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      cancelPendingSearchWrite();
    };
  }, [cancelPendingSearchWrite, options]);

  const filteredProjects = React.useMemo(
    () => filterAndSortProjects(projects, catalogState),
    [catalogState, projects],
  );

  const handleSearchChange = (query: string) => {
    const nextState = { ...catalogState, q: query };
    setCatalogState(nextState);
    cancelPendingSearchWrite();
    pendingSearchWriteRef.current = setTimeout(() => {
      pendingSearchWriteRef.current = null;
      writeCatalogUrl(nextState, "replace");
    }, SEARCH_URL_DEBOUNCE_MS);
  };

  const applyAdvancedState = (nextState: ProjectCatalogState) => {
    cancelPendingSearchWrite();
    setCatalogState(nextState);
    writeCatalogUrl(nextState, "push");
  };

  const handleRemoveSummary = (key: ProjectCatalogSummaryKey) => {
    applyAdvancedState(removeProjectCatalogSummary(catalogState, key));
  };

  const handleResetFiltersAndSort = () => {
    applyAdvancedState(resetProjectFiltersAndSort(catalogState));
  };

  const handleResetAll = () => {
    applyAdvancedState(resetProjectCatalogState());
  };

  return (
    <div>
      <AnimatedPageHeader>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          All projects
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.045em] text-foreground sm:text-4xl lg:text-[2.75rem]">
          Work I&apos;ve built and shipped.
        </h1>
      </AnimatedPageHeader>

      <SectionReveal className="mt-10" delay={0.06}>
        <ProjectCatalogToolbar
          state={catalogState}
          options={options}
          resultCount={filteredProjects.length}
          onSearchChange={handleSearchChange}
          onAdvancedStateChange={applyAdvancedState}
          onRemoveSummary={handleRemoveSummary}
          onResetFiltersAndSort={handleResetFiltersAndSort}
        />
      </SectionReveal>

      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredProjects.map((project) => (
          <FeaturedProjectCard key={project.id} project={project} />
        ))}
      </div>

      {filteredProjects.length === 0 ? (
        <SectionReveal className="mt-8 rounded-[2rem] border border-border/60 bg-background/80 p-10 text-center shadow-sm backdrop-blur-xl">
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-foreground">
            {projects.length === 0
              ? "No visible projects yet"
              : "No matching projects"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            {projects.length === 0
              ? "New project case studies will appear here when they are published."
              : "Try changing the search term or filters."}
          </p>
          {projects.length > 0 &&
          hasActiveProjectCatalogState(catalogState) ? (
            <ButtonResetAll onReset={handleResetAll} />
          ) : null}
        </SectionReveal>
      ) : null}
    </div>
  );
};

const ButtonResetAll = ({ onReset }: { onReset: () => void }) => (
  <button
    type="button"
    onClick={onReset}
    className="mt-5 min-h-11 rounded-lg border border-border/70 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 motion-reduce:transition-none"
  >
    Reset all
  </button>
);

export default ProjectsPageClient;
