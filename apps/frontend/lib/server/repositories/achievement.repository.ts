import "server-only";

import { unstable_cache } from "next/cache";

import { connectMongo } from "@/lib/server/db";
import { AchievementModel } from "@/lib/server/models/achievement";
import { serializePublicAchievement } from "@/lib/server/public-data/serializers";
import { PUBLIC_CACHE_TAGS } from "@/lib/server/cache/cache-tags";
import { PUBLIC_CACHE_KEYS, PUBLIC_REVALIDATE_SECONDS } from "@/lib/server/cache/cache-config";
import type { PublicAchievement } from "@portfolio/shared";

export const getVisibleAchievementsUncached = async (): Promise<PublicAchievement[]> => {
  await connectMongo();

  const achievements = await AchievementModel.find({ isVisible: true })
    .sort({ displayOrder: 1, createdAt: 1, _id: 1 })
    .exec();

  return achievements.map(serializePublicAchievement);
};

export const getVisibleAchievements = unstable_cache(
  getVisibleAchievementsUncached,
  [...PUBLIC_CACHE_KEYS.achievements],
  {
    tags: [PUBLIC_CACHE_TAGS.achievements],
    revalidate: PUBLIC_REVALIDATE_SECONDS.about,
  },
);
