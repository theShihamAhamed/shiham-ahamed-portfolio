import { requestApi } from "@/lib/api/client";
import type {
  AdminSiteSettings,
  UpdateSiteSettingsInput,
} from "@/types/site-settings";

type SiteSettingsResponse = {
  settings: AdminSiteSettings | null;
};

type UpdatedSiteSettingsResponse = {
  settings: AdminSiteSettings;
};

export const getSiteSettings = async (): Promise<AdminSiteSettings | null> => {
  const response = await requestApi<SiteSettingsResponse>("/api/site-settings");

  return response.data.settings;
};

export const updateSiteSettings = async (
  input: UpdateSiteSettingsInput,
): Promise<AdminSiteSettings> => {
  const response = await requestApi<UpdatedSiteSettingsResponse>("/api/site-settings", {
    method: "PATCH",
    body: input,
  });

  return response.data.settings;
};
