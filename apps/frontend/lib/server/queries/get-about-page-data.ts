import "server-only";

import type {
  PublicAchievement,
  PublicCertification,
} from "@portfolio/shared";

import { getVisibleAchievements } from "@/lib/server/repositories/achievement.repository";
import { getVisibleCertifications } from "@/lib/server/repositories/certification.repository";

export type AboutPageData = {
  certifications: PublicCertification[];
  achievements: PublicAchievement[];
  errors: {
    certifications?: string;
    achievements?: string;
  };
};

const getSettledValue = <T>(
  result: PromiseSettledResult<T>,
  fallback: T,
  context: string,
  message: string,
): { value: T; error?: string } => {
  if (result.status === "fulfilled") return { value: result.value };

  console.error(context, result.reason);
  return { value: fallback, error: message };
};

export const getAboutPageData = async (): Promise<AboutPageData> => {
  const [certificationsResult, achievementsResult] = await Promise.allSettled([
    getVisibleCertifications(),
    getVisibleAchievements(),
  ]);
  const certifications = getSettledValue(
    certificationsResult,
    [],
    "Failed to load about certifications",
    "Certifications are temporarily unavailable.",
  );
  const achievements = getSettledValue(
    achievementsResult,
    [],
    "Failed to load about achievements",
    "Achievements are temporarily unavailable.",
  );

  return {
    certifications: certifications.value,
    achievements: achievements.value,
    errors: {
      ...(certifications.error ? { certifications: certifications.error } : {}),
      ...(achievements.error ? { achievements: achievements.error } : {}),
    },
  };
};
