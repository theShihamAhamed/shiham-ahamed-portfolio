import {
  publicApiSuccess,
  publicApiTemporaryError,
} from "@/lib/server/public-data/api-response";
import { getFeaturedProjectsFromMongo } from "@/lib/server/public-data/projects";

export const runtime = "nodejs";
export const revalidate = 3600;

export async function GET() {
  try {
    const projects = await getFeaturedProjectsFromMongo();

    return publicApiSuccess(
      { projects },
      { meta: { count: projects.length } },
    );
  } catch (error) {
    return publicApiTemporaryError("Failed to load featured projects", error);
  }
}
