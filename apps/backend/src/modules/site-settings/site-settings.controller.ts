import { asyncHandler } from "../../utils/async-handler";
import { sendSuccess } from "../../utils/response";
import { revalidatePublicCache } from "../../lib/revalidate-public-cache";
import { serializeSiteSettings } from "./site-settings.serializer";
import {
  getSiteSettings,
  updateSiteSettings,
} from "./site-settings.service";
import type { UpdateSiteSettingsInput } from "./site-settings.validation";

export const getAdminSiteSettings = asyncHandler(async (_req, res) => {
  const settings = await getSiteSettings();

  return sendSuccess(res, {
    settings: settings ? serializeSiteSettings(settings) : null,
  });
});

export const patchAdminSiteSettings = asyncHandler(async (req, res) => {
  const settings = await updateSiteSettings(req.body as UpdateSiteSettingsInput);
  void revalidatePublicCache(
    { entity: "siteSettings", action: "update" },
    "site settings update",
  );

  return sendSuccess(
    res,
    {
      settings: serializeSiteSettings(settings),
    },
    200,
    { message: "Site settings updated successfully" },
  );
});
