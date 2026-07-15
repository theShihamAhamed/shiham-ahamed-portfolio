import "server-only";

import { unstable_cache } from "next/cache";

import { connectMongo } from "@/lib/server/db";
import { CurrentlyBuildingModel } from "@/lib/server/models/currently-building";
import { serializePublicCurrentlyBuilding } from "@/lib/server/public-data/serializers";
import { PUBLIC_CACHE_TAGS } from "@/lib/server/cache/cache-tags";
import { PUBLIC_CACHE_KEYS, PUBLIC_REVALIDATE_SECONDS } from "@/lib/server/cache/cache-config";
import type { PublicCurrentlyBuildingItem } from "@portfolio/shared";

export const getVisibleCurrentlyBuildingUncached = async (): Promise<PublicCurrentlyBuildingItem[]> => {
  await connectMongo();

  const items = await CurrentlyBuildingModel.find({ isVisible: true })
    .sort({ displayOrder: 1, createdAt: 1, _id: 1 })
    .exec();

  return items.map(serializePublicCurrentlyBuilding);
};

export const getVisibleCurrentlyBuilding = unstable_cache(
  getVisibleCurrentlyBuildingUncached,
  [...PUBLIC_CACHE_KEYS.currentlyBuilding],
  {
    tags: [PUBLIC_CACHE_TAGS.currentlyBuilding],
    revalidate: PUBLIC_REVALIDATE_SECONDS.currentlyBuilding,
  },
);
