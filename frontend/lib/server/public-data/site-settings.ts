import { unstable_cache } from "next/cache";

import { connectMongo } from "@/lib/server/db";
import {
  SiteSettingsModel,
  siteSettingsSingletonKey,
} from "@/lib/server/models/site-settings";
import { PUBLIC_CACHE_TAGS } from "@/lib/server/public-data/cache-tags";
import { serializePublicSiteSettings } from "@/lib/server/public-data/serializers";

const siteSettingsRevalidateSeconds = 60 * 60;

export const getSiteSettingsFromMongoUncached = async () => {
  await connectMongo();

  const settings = await SiteSettingsModel.findOne({
    singletonKey: siteSettingsSingletonKey,
  }).exec();

  return settings ? serializePublicSiteSettings(settings) : null;
};

export const getSiteSettingsFromMongo = unstable_cache(
  getSiteSettingsFromMongoUncached,
  ["public-site-settings"],
  {
    tags: [PUBLIC_CACHE_TAGS.siteSettings],
    revalidate: siteSettingsRevalidateSeconds,
  },
);
