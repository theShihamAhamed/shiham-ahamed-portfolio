import {
  publicApiSuccess,
  publicApiTemporaryError,
} from "@/lib/server/public-data/api-response";
import { getCurrentlyBuildingItemsFromMongo } from "@/lib/server/public-data/currently-building";

export const runtime = "nodejs";
export const revalidate = 3600;

export async function GET() {
  try {
    const items = await getCurrentlyBuildingItemsFromMongo();

    return publicApiSuccess({ items }, { meta: { count: items.length } });
  } catch (error) {
    return publicApiTemporaryError(
      "Failed to load currently-building items",
      error,
    );
  }
}
