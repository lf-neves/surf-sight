import { logger } from './logger';

export function getMaxConcurrency(defaultConcurrency = 15): number {
  const dbPoolMax = Number(process.env.DB_POOL_MAX);

  if (!dbPoolMax) {
    logger.info(
      'DB_POOL_MAX environment variable not found, will use default concurrency of %d.',
      defaultConcurrency
    );
  }

  return dbPoolMax || defaultConcurrency;
}
