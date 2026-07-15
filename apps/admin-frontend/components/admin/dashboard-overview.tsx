"use client";

import { useQuery } from "@tanstack/react-query";
import { getProjectStatusLabel, getProjectTypeLabel } from "@portfolio/shared";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Eye,
  EyeOff,
  FolderKanban,
  Gauge,
  Hammer,
  Loader2,
  Medal,
  Plus,
  RotateCcw,
  Sparkles,
  Star,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { getAchievements } from "@/lib/api/achievements";
import { getCertifications } from "@/lib/api/certifications";
import { getCurrentlyBuildingItems } from "@/lib/api/currently-building";
import { ApiError } from "@/lib/api/client";
import { getProjects } from "@/lib/api/projects";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AdminAchievement } from "@/types/achievement";
import type { AdminCertification } from "@/types/certification";
import type { AdminCurrentlyBuildingItem } from "@/types/currently-building";
import type { AdminProject } from "@/types/project";

const FEATURED_PROJECT_LIMIT = 6;
const EMPTY_PROJECTS: AdminProject[] = [];
const EMPTY_CURRENTLY_BUILDING: AdminCurrentlyBuildingItem[] = [];
const EMPTY_CERTIFICATIONS: AdminCertification[] = [];
const EMPTY_ACHIEVEMENTS: AdminAchievement[] = [];

const quickActions = [
  {
    label: "Add Project",
    href: "/admin/projects/new",
    description: "Create a featured case study or portfolio card.",
    icon: FolderKanban,
  },
  {
    label: "Add Currently Building",
    href: "/admin/currently-building/new",
    description: "Share active work and current technical focus.",
    icon: Hammer,
  },
  {
    label: "Add Certification",
    href: "/admin/certifications/new",
    description: "Publish a verified credential with its image.",
    icon: BadgeCheck,
  },
  {
    label: "Add Achievement",
    href: "/admin/achievements/new",
    description: "Capture awards, milestones, and public wins.",
    icon: Award,
  },
];

type MetricCardProps = {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone?: "cyan" | "green" | "amber" | "neutral";
};

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "The dashboard data could not be loaded.";
}

function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "neutral",
}: MetricCardProps) {
  const toneClassName = {
    cyan: "bg-[var(--admin-accent-soft)] text-[var(--admin-accent)] ring-[rgba(92,126,143,0.24)]",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-300/20",
    amber: "bg-amber-50 text-amber-700 ring-amber-300/20",
    neutral: "bg-[var(--admin-surface-muted)] text-[var(--admin-text)] ring-[var(--admin-border)]",
  }[tone];

  return (
    <Card className="shadow-none">
      <CardContent className="flex min-h-36 items-start justify-between gap-4 p-4">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[var(--admin-muted)]">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-normal text-[var(--admin-text)]">
            {value}
          </p>
          <p className="mt-2 text-xs leading-5 text-[var(--admin-muted)]">{helper}</p>
        </div>
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-lg ring-1 ring-inset",
            toneClassName,
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <div className="space-y-3">
        <div className="h-7 w-28 animate-pulse rounded-md bg-[var(--admin-surface-muted)]" />
        <div className="h-9 w-52 animate-pulse rounded-md bg-[var(--admin-surface-muted)]" />
        <div className="h-5 w-full max-w-xl animate-pulse rounded-md bg-[var(--admin-surface-muted)]" />
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="shadow-none">
            <CardContent className="min-h-36 p-4">
              <div className="h-4 w-28 animate-pulse rounded-md bg-[var(--admin-surface-muted)]" />
              <div className="mt-5 h-8 w-16 animate-pulse rounded-md bg-[var(--admin-surface-muted)]" />
              <div className="mt-4 h-4 w-36 animate-pulse rounded-md bg-[var(--admin-surface-muted)]" />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <Card className="border-[rgba(92,126,143,0.24)] bg-[var(--admin-accent-soft)] shadow-none">
      <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--admin-accent)]">
            Portfolio records are ready for content.
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--admin-muted)]">
            Start with a project, then add supporting credentials and milestones.
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[var(--admin-accent)] px-4 text-sm font-medium text-white transition-colors hover:bg-[var(--admin-accent-hover)]"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add Project
        </Link>
      </CardContent>
    </Card>
  );
}

export function DashboardOverview() {
  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(),
  });
  const currentlyBuildingQuery = useQuery({
    queryKey: ["currently-building"],
    queryFn: () => getCurrentlyBuildingItems(),
  });
  const certificationsQuery = useQuery({
    queryKey: ["certifications"],
    queryFn: () => getCertifications(),
  });
  const achievementsQuery = useQuery({
    queryKey: ["achievements"],
    queryFn: () => getAchievements(),
  });

  const queries = [
    projectsQuery,
    currentlyBuildingQuery,
    certificationsQuery,
    achievementsQuery,
  ];
  const isLoading = queries.some((query) => query.isLoading);
  const isFetching = queries.some((query) => query.isFetching);
  const failedQuery = queries.find((query) => query.isError);

  const projects = projectsQuery.data ?? EMPTY_PROJECTS;
  const currentlyBuilding =
    currentlyBuildingQuery.data ?? EMPTY_CURRENTLY_BUILDING;
  const certifications = certificationsQuery.data ?? EMPTY_CERTIFICATIONS;
  const achievements = achievementsQuery.data ?? EMPTY_ACHIEVEMENTS;

  const dashboardStats = useMemo(() => {
    const visibleProjects = projects.filter((project) => project.isVisible);
    const featuredProjects = projects.filter(
      (project) => project.isFeatured && project.isVisible,
    );
    const hiddenProjects = projects.length - visibleProjects.length;
    const hiddenCurrentlyBuilding = currentlyBuilding.filter(
      (item) => !item.isVisible,
    ).length;
    const hiddenCertifications = certifications.filter(
      (certification) => !certification.isVisible,
    ).length;
    const hiddenAchievements = achievements.filter(
      (achievement) => !achievement.isVisible,
    ).length;

    return {
      visibleProjects,
      featuredProjects,
      hiddenProjects,
      hiddenCurrentlyBuilding,
      hiddenCertifications,
      hiddenAchievements,
      hiddenTotal:
        hiddenProjects +
        hiddenCurrentlyBuilding +
        hiddenCertifications +
        hiddenAchievements,
      totalRecords:
        projects.length +
        currentlyBuilding.length +
        certifications.length +
        achievements.length,
      recentProjects: [...projects]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 4),
    };
  }, [achievements, certifications, currentlyBuilding, projects]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (failedQuery) {
    return (
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
        <div>
          <Badge variant="amber">Dashboard</Badge>
          <h1 className="mt-3 text-2xl font-semibold tracking-normal text-[var(--admin-text)] sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--admin-muted)]">
            A calm overview for managing portfolio content, media, visibility,
            and publishing state.
          </p>
        </div>

        <Card className="border-red-200 bg-red-50 shadow-none">
          <CardHeader>
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-red-100 text-red-700 ring-1 ring-inset ring-red-200">
                <TriangleAlert className="size-5" aria-hidden="true" />
              </span>
              <div>
                <CardTitle>Dashboard data unavailable</CardTitle>
                <CardDescription>
                  {getErrorMessage(failedQuery.error)}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              variant="secondary"
              onClick={() => {
                queries.forEach((query) => {
                  void query.refetch();
                });
              }}
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  const featuredCount = dashboardStats.featuredProjects.length;
  const featuredLimitReached = featuredCount >= FEATURED_PROJECT_LIMIT;
  const hasNoRecords = dashboardStats.totalRecords === 0;

  const metricCards = [
    {
      label: "Total Projects",
      value: String(projects.length),
      helper: "Total records in the projects collection",
      icon: FolderKanban,
      tone: "cyan" as const,
    },
    {
      label: "Featured Projects",
      value: `${featuredCount}/${FEATURED_PROJECT_LIMIT}`,
      helper: "Visible projects using featured slots",
      icon: Star,
      tone: featuredLimitReached ? ("amber" as const) : ("green" as const),
    },
    {
      label: "Visible Projects",
      value: String(dashboardStats.visibleProjects.length),
      helper: "Projects currently available publicly",
      icon: Eye,
      tone: "green" as const,
    },
    {
      label: "Currently Building Items",
      value: String(currentlyBuilding.length),
      helper: "Active work entries in admin",
      icon: Hammer,
    },
    {
      label: "Certifications",
      value: String(certifications.length),
      helper: "Credential records with images",
      icon: BadgeCheck,
    },
    {
      label: "Achievements",
      value: String(achievements.length),
      helper: "Milestones and recognition records",
      icon: Medal,
    },
  ];

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="cyan">Admin home</Badge>
          <h1 className="mt-3 text-2xl font-semibold tracking-normal text-[var(--admin-text)] sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--admin-muted)]">
            A calm overview for managing portfolio content, media, visibility,
            and publishing state.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--admin-muted)]">
          {isFetching ? (
            <>
              <Loader2
                className="size-3.5 animate-spin text-[var(--admin-accent)]"
                aria-hidden="true"
              />
              Refreshing
            </>
          ) : (
            <>
              <Gauge className="size-3.5 text-[var(--admin-accent)]" aria-hidden="true" />
              Live admin data
            </>
          )}
        </div>
      </div>

      {hasNoRecords ? <EmptyState /> : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {metricCards.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Jump straight into the create screens for each content type.
                </CardDescription>
              </div>
              <Plus className="size-5 text-[var(--admin-accent)]" aria-hidden="true" />
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-4 transition-colors hover:border-[rgba(92,126,143,0.32)] hover:bg-[var(--admin-surface-muted)]"
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="grid size-9 place-items-center rounded-lg bg-[var(--admin-surface-muted)] text-[var(--admin-text)] transition-colors group-hover:bg-[var(--admin-accent-soft)] group-hover:text-[var(--admin-accent)]">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <ArrowRight
                      className="size-4 text-[var(--admin-subtle)] transition-colors group-hover:text-[var(--admin-accent)]"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="mt-4 block text-sm font-medium text-[var(--admin-text)]">
                    {action.label}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-[var(--admin-muted)]">
                    {action.description}
                  </span>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Featured Limit Status</CardTitle>
            <CardDescription>
              Only visible featured projects count toward the public limit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "rounded-lg border p-4",
                featuredLimitReached
                  ? "border-amber-200 bg-amber-50"
                  : "border-[rgba(92,126,143,0.24)] bg-[var(--admin-accent-soft)]",
              )}
            >
              <div className="flex items-center gap-2">
                <Sparkles
                  className={cn(
                    "size-4",
                    featuredLimitReached ? "text-amber-700" : "text-[var(--admin-accent)]",
                  )}
                  aria-hidden="true"
                />
                <p className="text-sm font-medium text-[var(--admin-text)]">
                  {featuredLimitReached
                    ? "Featured project limit reached"
                    : `${featuredCount} of ${FEATURED_PROJECT_LIMIT} featured slots used`}
                </p>
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--admin-muted)]">
                Hidden featured projects are excluded from this count.
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-3">
                <p className="text-xs text-[var(--admin-muted)]">Visible</p>
                <p className="mt-2 text-xl font-semibold text-[var(--admin-text)]">
                  {dashboardStats.visibleProjects.length}
                </p>
              </div>
              <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-3">
                <p className="text-xs text-[var(--admin-muted)]">Featured</p>
                <p className="mt-2 text-xl font-semibold text-[var(--admin-text)]">
                  {featuredCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>
              The newest project records from the admin API.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboardStats.recentProjects.length > 0 ? (
              dashboardStats.recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex flex-col gap-3 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--admin-text)]">
                      {project.title}
                    </p>
                    <p className="mt-1 text-xs text-[var(--admin-muted)]">
                      {getProjectTypeLabel(project.projectType)} -{" "}
                      {getProjectStatusLabel(project.status)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={project.isVisible ? "green" : "neutral"}>
                      {project.isVisible ? "Visible" : "Hidden"}
                    </Badge>
                    {project.isFeatured ? (
                      <Badge variant="cyan">Featured</Badge>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-lg border border-dashed border-[var(--admin-border)] p-4 text-sm text-[var(--admin-muted)]">
                No projects have been created yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Hidden Content Summary</CardTitle>
            <CardDescription>
              Records present in admin but hidden from public routes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ["Projects", dashboardStats.hiddenProjects],
              ["Currently Building", dashboardStats.hiddenCurrentlyBuilding],
              ["Certifications", dashboardStats.hiddenCertifications],
              ["Achievements", dashboardStats.hiddenAchievements],
            ].map(([label, count]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-3 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] px-4 py-3"
              >
                <span className="flex items-center gap-2 text-sm text-[var(--admin-text)]">
                  <EyeOff className="size-4 text-[var(--admin-muted)]" aria-hidden="true" />
                  {label}
                </span>
                <Badge variant={Number(count) > 0 ? "amber" : "neutral"}>
                  {count} hidden
                </Badge>
              </div>
            ))}
            <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] p-4">
              <p className="text-xs text-[var(--admin-muted)]">Total records</p>
              <p className="mt-2 text-xl font-semibold text-[var(--admin-text)]">
                {dashboardStats.totalRecords}
              </p>
              <p className="mt-1 text-xs text-[var(--admin-muted)]">
                {dashboardStats.hiddenTotal} hidden across all admin content.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
