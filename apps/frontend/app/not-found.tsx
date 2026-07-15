import { HomeLink, ProjectsLink, RouteState } from "@/components/layout/route-state";

export default function NotFound() {
  return (
    <RouteState
      eyebrow="404"
      title="Page not found"
      description="That page is not part of the portfolio, or it may have moved during a content update."
    >
      <HomeLink />
      <ProjectsLink />
    </RouteState>
  );
}
