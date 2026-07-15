import {
  publicApiSuccess,
  publicApiTemporaryError,
} from "@/lib/server/public-data/api-response";
import { getVisibleCurrentlyBuilding } from "@/lib/server/repositories/currently-building.repository";

export const runtime = "nodejs";
export const revalidate = 86400;

export async function GET() {
  try {
    const items = await getVisibleCurrentlyBuilding();

    return publicApiSuccess({ items }, { meta: { count: items.length } });
  } catch (error) {
    return publicApiTemporaryError(
      "Failed to load currently-building items",
      error,
    );
  }
}
