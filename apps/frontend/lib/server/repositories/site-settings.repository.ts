import "server-only";

import { unstable_cache } from "next/cache";

import { connectMongo } from "@/lib/server/db";
import { SiteSettingsModel, siteSettingsSingletonKey } from "@/lib/server/models/site-settings";
import { serializePublicSiteSettings } from "@/lib/server/public-data/serializers";
import { PUBLIC_CACHE_TAGS } from "@/lib/server/cache/cache-tags";
import { PUBLIC_CACHE_KEYS, PUBLIC_REVALIDATE_SECONDS } from "@/lib/server/cache/cache-config";
import type { PublicSiteSettings } from "@portfolio/shared";

export const getPublicSiteSettingsUncached = async (): Promise<PublicSiteSettings | null> => {
  await connectMongo();

  const settings = await SiteSettingsModel.findOne({
    singletonKey: siteSettingsSingletonKey,
  }).exec();

  return settings ? serializePublicSiteSettings(settings) : null;
};

export const getPublicSiteSettings = unstable_cache(
  getPublicSiteSettingsUncached,
  [...PUBLIC_CACHE_KEYS.siteSettings],
  {
    tags: [PUBLIC_CACHE_TAGS.siteSettings],
    revalidate: PUBLIC_REVALIDATE_SECONDS.siteSettings,
  },
);
