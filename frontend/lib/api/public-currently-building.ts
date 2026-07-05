import { getCurrentlyBuildingItemsFromMongo } from "@/lib/server/public-data/currently-building";

export const getPublicCurrentlyBuildingItems =
  getCurrentlyBuildingItemsFromMongo;
