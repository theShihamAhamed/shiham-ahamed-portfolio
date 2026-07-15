import { connectDatabase, disconnectDatabase, mongoose } from "@portfolio/db";

import { env, isProduction } from "../config/env";

export const connectDb = async () => {
  const connection = await connectDatabase({ uri: env.MONGO_URI, autoIndex: !isProduction, retryWrites: false });
  console.log(`MongoDB connected: ${connection.connection.name}`);
  return connection;
};

export const disconnectDb = disconnectDatabase;

export const isDatabaseReady = (): boolean => mongoose.connection.readyState === 1;
