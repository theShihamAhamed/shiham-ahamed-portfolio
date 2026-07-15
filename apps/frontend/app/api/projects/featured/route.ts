import {
  publicApiSuccess,
  publicApiTemporaryError,
} from "@/lib/server/public-data/api-response";
import { getFeaturedProjects } from "@/lib/server/repositories/project.repository";

export const runtime = "nodejs";
export const revalidate = 86400;

export async function GET() {
  try {
    const projects = await getFeaturedProjects();

    return publicApiSuccess(
      { projects },
      { meta: { count: projects.length } },
    );
  } catch (error) {
    return publicApiTemporaryError("Failed to load featured projects", error);
  }
}
