import {
  publicApiSuccess,
  publicApiTemporaryError,
} from "@/lib/server/public-data/api-response";
import { getCertificationsFromMongo } from "@/lib/server/public-data/about";

export const runtime = "nodejs";
export const revalidate = 21600;

export async function GET() {
  try {
    const certifications = await getCertificationsFromMongo();

    return publicApiSuccess(
      { certifications },
      { meta: { count: certifications.length } },
    );
  } catch (error) {
    return publicApiTemporaryError("Failed to load certifications", error);
  }
}
