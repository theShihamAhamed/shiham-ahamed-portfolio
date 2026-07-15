import {
  publicApiSuccess,
  publicApiTemporaryError,
} from "@/lib/server/public-data/api-response";
import { getVisibleProjects } from "@/lib/server/repositories/project.repository";

export const runtime = "nodejs";
export const revalidate = 3600;

export async function GET() {
  try {
    const projects = await getVisibleProjects();

    return publicApiSuccess(
      { projects },
      { meta: { count: projects.length } },
    );
  } catch (error) {
    return publicApiTemporaryError("Failed to load visible projects", error);
  }
}
