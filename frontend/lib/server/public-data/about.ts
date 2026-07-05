import { unstable_cache } from "next/cache";

import { connectMongo } from "@/lib/server/db";
import { AchievementModel } from "@/lib/server/models/achievement";
import { CertificationModel } from "@/lib/server/models/certification";
import { PUBLIC_CACHE_TAGS } from "@/lib/server/public-data/cache-tags";
import {
  serializePublicAchievement,
  serializePublicCertification,
} from "@/lib/server/public-data/serializers";

const aboutRevalidateSeconds = 6 * 60 * 60;

export const getCertificationsFromMongoUncached = async () => {
  await connectMongo();

  const certifications = await CertificationModel.find({ isVisible: true })
    .sort({ displayOrder: 1, createdAt: -1 })
    .exec();

  return certifications.map(serializePublicCertification);
};

export const getCertificationsFromMongo = unstable_cache(
  getCertificationsFromMongoUncached,
  ["public-certifications"],
  {
    tags: [PUBLIC_CACHE_TAGS.certifications],
    revalidate: aboutRevalidateSeconds,
  },
);

export const getAchievementsFromMongoUncached = async () => {
  await connectMongo();

  const achievements = await AchievementModel.find({ isVisible: true })
    .sort({ displayOrder: 1, createdAt: -1 })
    .exec();

  return achievements.map(serializePublicAchievement);
};

export const getAchievementsFromMongo = unstable_cache(
  getAchievementsFromMongoUncached,
  ["public-achievements"],
  {
    tags: [PUBLIC_CACHE_TAGS.achievements],
    revalidate: aboutRevalidateSeconds,
  },
);
