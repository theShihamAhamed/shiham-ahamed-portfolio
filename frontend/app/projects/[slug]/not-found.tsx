import { HomeLink, ProjectsLink, RouteState } from "@/components/layout/route-state";

export default function ProjectNotFound() {
  return (
    <RouteState
      eyebrow="Project details"
      title="Project not found"
      description="That project is not available in the public catalog. It may be hidden, renamed, or not seeded yet."
    >
      <ProjectsLink />
      <HomeLink />
    </RouteState>
  );
}
