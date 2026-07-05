import mongoose from "mongoose";

import { getMongoUri } from "@/lib/server/env";

type MongooseCache = {
  connection: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var __portfolioMongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = globalThis.__portfolioMongooseCache ?? {
  connection: null,
  promise: null,
};

globalThis.__portfolioMongooseCache = cache;

export const connectMongo = async () => {
  if (cache.connection) {
    return cache.connection;
  }

  cache.promise ??= mongoose.connect(getMongoUri(), {
    autoIndex: process.env.NODE_ENV !== "production",
    retryWrites: false,
  });

  cache.connection = await cache.promise;

  return cache.connection;
};
