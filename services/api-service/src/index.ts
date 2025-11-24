import { startServer } from "./server";
import { disconnectPrisma } from "@surf-sight/database";
import { logger } from "@surf-sight/core";

async function main() {
  try {
    await startServer();
  } catch (error) {
    console.error("Failed to start server.", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully...");
  await disconnectPrisma();
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down gracefully...");
  await disconnectPrisma();
  process.exit(0);
});

main();
