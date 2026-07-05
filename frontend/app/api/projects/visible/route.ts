import {
  publicApiSuccess,
  publicApiTemporaryError,
} from "@/lib/server/public-data/api-response";
import { getVisibleProjectsFromMongo } from "@/lib/server/public-data/projects";

export const runtime = "nodejs";
export const revalidate = 3600;

export async function GET() {
  try {
    const projects = await getVisibleProjectsFromMongo();

    return publicApiSuccess(
      { projects },
      { meta: { count: projects.length } },
    );
  } catch (error) {
    return publicApiTemporaryError("Failed to load visible projects", error);
  }
}
