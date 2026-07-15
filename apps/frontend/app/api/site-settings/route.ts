import {
  publicApiError,
  publicApiSuccess,
  publicApiTemporaryError,
} from "@/lib/server/public-data/api-response";
import { getPublicSiteSettings } from "@/lib/server/repositories/site-settings.repository";

export const runtime = "nodejs";
export const revalidate = 86400;

export async function GET() {
  try {
    const settings = await getPublicSiteSettings();

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
