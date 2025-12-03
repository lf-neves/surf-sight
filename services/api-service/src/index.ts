import { startServer } from './server';
import { logger } from '@surf-sight/core';

async function main() {
  try {
    await startServer();
  } catch (error) {
    logger.info('Failed to start server.', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

main();
