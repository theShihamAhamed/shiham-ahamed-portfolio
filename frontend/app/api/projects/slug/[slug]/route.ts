import {
  publicApiError,
  publicApiSuccess,
  publicApiTemporaryError,
} from "@/lib/server/public-data/api-response";
import { getProjectBySlugFromMongo } from "@/lib/server/public-data/projects";

export const runtime = "nodejs";
export const revalidate = 3600;

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { slug } = await params;
    const project = await getProjectBySlugFromMongo(slug);

    if (!project) {
      return publicApiError(404, "PROJECT_NOT_FOUND", "Project not found.");
    }

    return publicApiSuccess({ project });
  } catch (error) {
    return publicApiTemporaryError("Failed to load project by slug", error);
  }
}
