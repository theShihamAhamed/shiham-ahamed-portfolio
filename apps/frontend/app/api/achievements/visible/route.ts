import {
  publicApiSuccess,
  publicApiTemporaryError,
} from "@/lib/server/public-data/api-response";
import { getVisibleAchievements } from "@/lib/server/repositories/achievement.repository";

export const runtime = "nodejs";
export const revalidate = 86400;

export async function GET() {
  try {
    const achievements = await getVisibleAchievements();

    return publicApiSuccess(
      { achievements },
      { meta: { count: achievements.length } },
    );
  } catch (error) {
    return publicApiTemporaryError("Failed to load achievements", error);
  }
}
