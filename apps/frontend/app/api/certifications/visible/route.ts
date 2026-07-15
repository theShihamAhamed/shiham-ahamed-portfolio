import {
  publicApiSuccess,
  publicApiTemporaryError,
} from "@/lib/server/public-data/api-response";
import { getVisibleCertifications } from "@/lib/server/repositories/certification.repository";

export const runtime = "nodejs";
export const revalidate = 21600;

export async function GET() {
  try {
    const certifications = await getVisibleCertifications();

    return publicApiSuccess(
      { certifications },
      { meta: { count: certifications.length } },
    );
  } catch (error) {
    return publicApiTemporaryError("Failed to load certifications", error);
  }
}
