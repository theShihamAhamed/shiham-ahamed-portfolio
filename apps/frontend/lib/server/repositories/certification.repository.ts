import "server-only";

import { unstable_cache } from "next/cache";

import { connectMongo } from "@/lib/server/db";
import { CertificationModel } from "@/lib/server/models/certification";
import { serializePublicCertification } from "@/lib/server/public-data/serializers";
import { PUBLIC_CACHE_TAGS } from "@/lib/server/cache/cache-tags";
import { PUBLIC_CACHE_KEYS, PUBLIC_REVALIDATE_SECONDS } from "@/lib/server/cache/cache-config";
import type { PublicCertification } from "@portfolio/shared";

export const getVisibleCertificationsUncached = async (): Promise<PublicCertification[]> => {
  await connectMongo();

  const certifications = await CertificationModel.find({ isVisible: true })
    .sort({ displayOrder: 1, createdAt: 1, _id: 1 })
    .exec();

  return certifications.map(serializePublicCertification);
};

export const getVisibleCertifications = unstable_cache(
  getVisibleCertificationsUncached,
  [...PUBLIC_CACHE_KEYS.certifications],
  {
    tags: [PUBLIC_CACHE_TAGS.certifications],
    revalidate: PUBLIC_REVALIDATE_SECONDS.about,
  },
);
