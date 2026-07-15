import { SiteSettingsModel, type SiteSettingsDocument } from "./site-settings.model";
import { siteSettingsSingletonKey } from "./site-settings.types";
import type { UpdateSiteSettingsInput } from "./site-settings.validation";

export const getSiteSettings = async (): Promise<SiteSettingsDocument | null> => {
  return SiteSettingsModel.findOne({ singletonKey: siteSettingsSingletonKey }).exec();
};

export const updateSiteSettings = async (
  input: UpdateSiteSettingsInput,
): Promise<SiteSettingsDocument> => {
  const settings = await getSiteSettings();

  if (!settings) {
    return SiteSettingsModel.create({
      singletonKey: siteSettingsSingletonKey,
      ...input,
    });
  }

  settings.set(input);
  await settings.save();

  return settings;
};
