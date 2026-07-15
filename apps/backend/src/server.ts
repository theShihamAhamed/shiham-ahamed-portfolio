import type { Server } from "node:http";

import { app } from "./app";
import { env } from "./config/env";
import { connectDb, disconnectDb } from "./db/connect";

let server: Server | undefined;
let shutdownPromise: Promise<void> | undefined;

const startServer = async (): Promise<void> => {
  try {
    await connectDb();

    server = app.listen(env.PORT, () => {
      console.log(`Backend API running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start backend API", error);
    process.exit(1);
  }
};

const shutdown = (signal: NodeJS.Signals): void => {
  if (shutdownPromise) return;

  console.log(`${signal} received. Shutting down backend API.`);

  if (!server) {
    process.exit(0);
  }

  shutdownPromise = new Promise((resolve) => {
    const forceExit = setTimeout(() => {
      console.error("Backend shutdown timed out.");
      process.exit(1);
    }, 10_000);
    forceExit.unref();

    server?.close(() => {
      void disconnectDb().finally(() => {
        clearTimeout(forceExit);
        resolve();
        process.exit(0);
      });
    });
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled promise rejection", reason);
  shutdown("SIGTERM");
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception", error);
  process.exit(1);
});

void startServer();
