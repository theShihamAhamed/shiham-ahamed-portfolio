import { SiteSettingsModel, type SiteSettingsDocument } from "./site-settings.model";
import { siteSettingsSingletonKey } from "./site-settings.types";
import type { UpdateSiteSettingsInput } from "./site-settings.validation";

export const defaultSiteSettings: UpdateSiteSettingsInput = {
  name: "Shiham Ahamed",
  targetRole: "Software Engineering Student",
  email: "theshihamahamed@gmail.com",
  githubUrl: "https://github.com/theShihamAhamed",
  linkedinUrl: "https://www.linkedin.com/in/theshihamahamed/",
  resumeUrl:
    "https://drive.google.com/file/d/1MTSsUA8V7Po2AsNXT8kZ5sLOpzC8l7qm/view?usp=drive_link",
  hero: {
    badge: "Software engineering student building production-minded systems",
    title: "I build modern web apps and scalable software systems.",
    highlightedPhrase: "modern web apps and scalable software systems",
    description:
      "I'm a software engineering student focused on building full-stack applications, backend systems, and polished user experiences that feel reliable in real use.",
  },
  education: {
    institution: "Sri Lanka Institute of Information Technology",
    degree: "BSc (Hons) in Information Technology",
    specialization: "Software Engineering",
    expectedGraduation: "2027",
  },
};

export const getSiteSettings = async (): Promise<SiteSettingsDocument> => {
  const settings = await SiteSettingsModel.findOneAndUpdate(
    { singletonKey: siteSettingsSingletonKey },
    {
      $setOnInsert: {
        singletonKey: siteSettingsSingletonKey,
        ...defaultSiteSettings,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  ).exec();

  return settings;
};

export const updateSiteSettings = async (
  input: UpdateSiteSettingsInput,
): Promise<SiteSettingsDocument> => {
  const settings = await getSiteSettings();

  settings.set(input);
  await settings.save();

  return settings;
};
