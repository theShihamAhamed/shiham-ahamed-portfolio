import { asyncHandler } from "../../utils/async-handler";
import { sendSuccess } from "../../utils/response";
import {
  PUBLIC_CACHE_TAGS,
  revalidatePublicCache,
} from "../../lib/revalidate-public-cache";
import { serializeSiteSettings } from "./site-settings.serializer";
import {
  getSiteSettings,
  updateSiteSettings,
} from "./site-settings.service";
import type { UpdateSiteSettingsInput } from "./site-settings.validation";

export const getAdminSiteSettings = asyncHandler(async (_req, res) => {
  const settings = await getSiteSettings();

  return sendSuccess(res, {
    settings: serializeSiteSettings(settings),
  });
});

export const patchAdminSiteSettings = asyncHandler(async (req, res) => {
  const settings = await updateSiteSettings(req.body as UpdateSiteSettingsInput);
  void revalidatePublicCache(
    [PUBLIC_CACHE_TAGS.siteSettings],
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
