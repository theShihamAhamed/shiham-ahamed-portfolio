import mongoose from "mongoose";

import { env, isProduction } from "../config/env";

let isConnected = false;

export const connectDb = async (): Promise<typeof mongoose> => {
  if (isConnected) {
    return mongoose;
  }

  mongoose.set("strictQuery", true);

  const connection = await mongoose.connect(env.MONGO_URI, {
    autoIndex: !isProduction,
    retryWrites: false,
  });

  isConnected = connection.connection.readyState === 1;

  console.log(`MongoDB connected: ${connection.connection.name}`);

  return connection;
};

export const disconnectDb = async (): Promise<void> => {
  if (!isConnected) {
    return;
  }

  await mongoose.connection.close();
  isConnected = false;
};
