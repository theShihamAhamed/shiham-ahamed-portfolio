import mongoose from "mongoose";

export type ConnectDatabaseOptions = {
  uri: string;
  autoIndex: boolean;
  retryWrites?: boolean;
};

type MongooseCache = { connection: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
declare global { var __portfolioMongooseCache: MongooseCache | undefined; }
const cache = globalThis.__portfolioMongooseCache ?? { connection: null, promise: null };
globalThis.__portfolioMongooseCache = cache;

export const connectDatabase = async ({ uri, autoIndex, retryWrites = false }: ConnectDatabaseOptions): Promise<typeof mongoose> => {
  if (cache.connection?.connection.readyState === 1) return cache.connection;
  mongoose.set("strictQuery", true);
  cache.promise ??= mongoose.connect(uri, { autoIndex, retryWrites }).catch((error: unknown) => { cache.promise = null; throw error; });
  cache.connection = await cache.promise;
  return cache.connection;
};

export const disconnectDatabase = async (): Promise<void> => {
  if (!cache.connection && !cache.promise) return;
  await mongoose.connection.close();
  cache.connection = null;
  cache.promise = null;
};

export { mongoose };
export type { ClientSession } from "mongoose";
