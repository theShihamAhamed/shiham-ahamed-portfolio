import "server-only";

import { connectDatabase } from "@portfolio/db";

import { getMongoUri } from "@/lib/server/env";

export const connectMongo = () =>
  connectDatabase({
    uri: getMongoUri(),
    autoIndex: process.env.NODE_ENV !== "production",
    retryWrites: false,
  });
