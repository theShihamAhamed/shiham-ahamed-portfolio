export type SiteSettingsHero = {
  badge: string;
  title: string;
  highlightedPhrase: string;
  description: string;
};

export type SiteSettingsEducation = {
  institution: string;
  degree: string;
  specialization: string;
  expectedGraduation: string;
};

export type AdminSiteSettings = {
  id: string;
  name: string;
  targetRole: string;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  resumeUrl: string;
  hero: SiteSettingsHero;
  education: SiteSettingsEducation;
  createdAt: string;
  updatedAt: string;
};

export type UpdateSiteSettingsInput = {
  name: string;
  targetRole: string;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  resumeUrl: string;
  hero: SiteSettingsHero;
  education: SiteSettingsEducation;
};
