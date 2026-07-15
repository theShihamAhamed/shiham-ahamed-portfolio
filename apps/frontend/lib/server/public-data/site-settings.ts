import "server-only";

export {
  getPublicSiteSettings as getSiteSettingsFromMongo,
  getPublicSiteSettingsUncached as getSiteSettingsFromMongoUncached,
} from "@/lib/server/repositories/site-settings.repository";
