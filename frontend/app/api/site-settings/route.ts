import {
  publicApiError,
  publicApiSuccess,
  publicApiTemporaryError,
} from "@/lib/server/public-data/api-response";
import { getSiteSettingsFromMongo } from "@/lib/server/public-data/site-settings";

export const runtime = "nodejs";
export const revalidate = 3600;

export async function GET() {
  try {
    const settings = await getSiteSettingsFromMongo();

    if (!settings) {
      return publicApiError(
        404,
        "SITE_SETTINGS_NOT_FOUND",
        "Site settings have not been configured.",
      );
    }

    return publicApiSuccess({ settings });
  } catch (error) {
    return publicApiTemporaryError("Failed to load site settings", error);
  }
}
