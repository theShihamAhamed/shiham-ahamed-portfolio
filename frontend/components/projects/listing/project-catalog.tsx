"use client";

import * as React from "react";
import { Search, ChevronDown } from "lucide-react";

import {
  AnimatedPageHeader,
  SectionReveal,
} from "@/components/motion/motion-primitives";
import { Project } from "@/types/project";
import FeaturedProjectCard from "../shared/project-card";

type Props = {
  projects: Project[];
};

type SortOption = "featured" | "newest" | "oldest" | "title";

const sortOptions: { label: string; value: SortOption }[] = [
  { label: "Featured", value: "featured" },
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Title", value: "title" },
];

const ProjectsPageClient = ({ projects }: Props) => {
  const [search, setSearch] = React.useState("");
  const [selectedType, setSelectedType] = React.useState("All");
  const [selectedTech, setSelectedTech] = React.useState("All");
  const [selectedStatus, setSelectedStatus] = React.useState("All");
  const [sortBy, setSortBy] = React.useState<SortOption>("featured");

  const projectTypes = React.useMemo(() => {
    return ["All", ...new Set(projects.map((project) => project.projectType))];
  }, [projects]);

  const techOptions = React.useMemo(() => {
    return [
      "All",
      ...new Set(
        projects.flatMap((project) =>
          project.techStack.map((tech) => tech.label),
        ),
      ),
    ];
  }, [projects]);

  const filteredProjects = React.useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const filtered = projects.filter((project) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        project.title.toLowerCase().includes(normalizedSearch) ||
        project.shortDescription.toLowerCase().includes(normalizedSearch) ||
        project.projectType.toLowerCase().includes(normalizedSearch) ||
        project.techStack.some((tech) =>
          tech.label.toLowerCase().includes(normalizedSearch),
        );

      const matchesType =
        selectedType === "All" || project.projectType === selectedType;

      const matchesTech =
        selectedTech === "All" ||
        project.techStack.some((tech) => tech.label === selectedTech);

      const matchesStatus =
        selectedStatus === "All" || project.status === selectedStatus;

      return matchesSearch && matchesType && matchesTech && matchesStatus;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "featured") {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return a.sortOrder - b.sortOrder;
      }

      if (sortBy === "newest") {
        return Number(b.year) - Number(a.year);
      }

      if (sortBy === "oldest") {
        return Number(a.year) - Number(b.year);
      }

      return a.title.localeCompare(b.title);
    });

    return sorted;
  }, [projects, search, selectedType, selectedTech, selectedStatus, sortBy]);

  return (
    <div>
      {/* Page Header */}
      <AnimatedPageHeader>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          All projects
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.045em] text-foreground sm:text-4xl lg:text-[2.75rem]">
          Work I&apos;ve built and shipped.
        </h1>
      </AnimatedPageHeader>

      {/* Controls */}
      <SectionReveal className="mt-10" delay={0.06}>
        <div className="mt-5 grid gap-4 lg:grid-cols-12">
          <div className="relative lg:col-span-4">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 w-full rounded-2xl border border-border/60 bg-background pl-11 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/80 focus:border-foreground/25"
            />
          </div>

          <div className="lg:col-span-2">
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="h-12 w-full appearance-none rounded-2xl border border-border/60 bg-background px-4 pr-10 text-sm text-foreground outline-none transition-colors focus:border-foreground/25"
              >
                {projectTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="relative">
              <select
                value={selectedTech}
                onChange={(e) => setSelectedTech(e.target.value)}
                className="h-12 w-full appearance-none rounded-2xl border border-border/60 bg-background px-4 pr-10 text-sm text-foreground outline-none transition-colors focus:border-foreground/25"
              >
                {techOptions.map((tech) => (
                  <option key={tech} value={tech}>
                    {tech}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-12 w-full appearance-none rounded-2xl border border-border/60 bg-background px-4 pr-10 text-sm text-foreground outline-none transition-colors focus:border-foreground/25"
              >
                <option value="All">All Status</option>
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-12 w-full appearance-none rounded-2xl border border-border/60 bg-background px-4 pr-10 text-sm text-foreground outline-none transition-colors focus:border-foreground/25"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    Sort: {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="mt-5 text-sm text-muted-foreground">
          {filteredProjects.length} project
          {filteredProjects.length === 1 ? "" : "s"} found
        </div>
      </SectionReveal>

      {/* Grid */}
      <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredProjects.map((project) => (
          <FeaturedProjectCard key={project.id} project={project} />
        ))}
      </div>

      {/* Empty state */}
      {filteredProjects.length === 0 ? (
        <SectionReveal className="mt-8 rounded-[2rem] border border-border/60 bg-background/80 p-10 text-center shadow-sm backdrop-blur-xl">
          <h3 className="text-xl font-semibold tracking-[-0.03em] text-foreground">
            No matching projects
          </h3>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Try changing the search term, filters, or sorting option.
          </p>
        </SectionReveal>
      ) : null}
    </div>
  );
};

export default ProjectsPageClient;
