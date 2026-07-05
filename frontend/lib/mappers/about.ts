import type { Achievement, Certification } from "@/types/about";
import type {
  PublicAchievement,
  PublicCertification,
} from "@/types/public-api";

export const mapPublicCertificationToCertification = (
  certification: PublicCertification,
): Certification => ({
  id: certification.id,
  title: certification.title,
  provider: certification.provider,
  date: certification.date,
  credentialId: certification.credentialId,
  verifyUrl: certification.verifyUrl,
  image: certification.image.url,
  imageAlt: certification.image.alt,
  note: certification.note,
  skills: certification.skills,
});

export const mapPublicAchievementToAchievement = (
  achievement: PublicAchievement,
): Achievement => ({
  id: achievement.id,
  title: achievement.title,
  event: achievement.event,
  result: achievement.result,
  date: achievement.date,
  year: achievement.year,
  icon: achievement.icon,
  note: achievement.note,
});
