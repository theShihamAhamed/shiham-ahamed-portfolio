import type { SiteSettingsDocument } from "./site-settings.model";

export const serializeSiteSettings = (settings: SiteSettingsDocument) => {
  const item = settings.toObject();

  return {
    id: item._id.toString(),
    name: item.name,
    targetRole: item.targetRole,
    email: item.email,
    githubUrl: item.githubUrl,
    linkedinUrl: item.linkedinUrl,
    resumeUrl: item.resumeUrl,
    hero: {
      badge: item.hero.badge,
      title: item.hero.title,
      highlightedPhrase: item.hero.highlightedPhrase,
      description: item.hero.description,
    },
    education: {
      institution: item.education.institution,
      degree: item.education.degree,
      specialization: item.education.specialization,
      expectedGraduation: item.education.expectedGraduation,
    },
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
};
