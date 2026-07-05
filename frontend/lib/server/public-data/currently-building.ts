import { unstable_cache } from "next/cache";

import { connectMongo } from "@/lib/server/db";
import { CurrentlyBuildingModel } from "@/lib/server/models/currently-building";
import { PUBLIC_CACHE_TAGS } from "@/lib/server/public-data/cache-tags";
import { serializePublicCurrentlyBuilding } from "@/lib/server/public-data/serializers";

const currentlyBuildingRevalidateSeconds = 60 * 60;

export const getCurrentlyBuildingItemsFromMongoUncached = async () => {
  await connectMongo();

  const items = await CurrentlyBuildingModel.find({ isVisible: true })
    .sort({ displayOrder: 1, createdAt: -1 })
    .exec();

  return items.map(serializePublicCurrentlyBuilding);
};

export const getCurrentlyBuildingItemsFromMongo = unstable_cache(
  getCurrentlyBuildingItemsFromMongoUncached,
  ["public-currently-building-items"],
  {
    tags: [PUBLIC_CACHE_TAGS.currentlyBuilding],
    revalidate: currentlyBuildingRevalidateSeconds,
  },
);
