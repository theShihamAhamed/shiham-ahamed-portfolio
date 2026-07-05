import {
  publicApiSuccess,
  publicApiTemporaryError,
} from "@/lib/server/public-data/api-response";
import { getAchievementsFromMongo } from "@/lib/server/public-data/about";

export const runtime = "nodejs";
export const revalidate = 21600;

export async function GET() {
  try {
    const achievements = await getAchievementsFromMongo();

    return publicApiSuccess(
      { achievements },
      { meta: { count: achievements.length } },
    );
  } catch (error) {
    return publicApiTemporaryError("Failed to load achievements", error);
  }
}
