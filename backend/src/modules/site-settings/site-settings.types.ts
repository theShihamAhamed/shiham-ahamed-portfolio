export const siteSettingsSingletonKey = "primary" as const;

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

export type SiteSettingsEntity = {
  singletonKey: typeof siteSettingsSingletonKey;
  name: string;
  targetRole: string;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
  resumeUrl: string;
  hero: SiteSettingsHero;
  education: SiteSettingsEducation;
  createdAt: Date;
  updatedAt: Date;
};
