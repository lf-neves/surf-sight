import { drizzleDb, Spot, spots } from '@surf-sight/database';
import { asc } from 'drizzle-orm';
import { logger, pMap, sqsEnqueueWithLocalSupport } from '@surf-sight/core';

/**
 * Cron handler: enqueues work items only (spotId per spot).
 * Workers pull from the queue, call Stormglass, then persist to DB.
 * Aligns with design: CRON → QUEUE → STORMGLASS → WORKER → DB.
 */
export const handleEnqueueRetrievedForecastsToProcess = async () => {
  try {
    const allSpots = await drizzleDb
      .select()
      .from(spots)
      .orderBy(asc(spots.createdAt));

    if (!allSpots.length) {
      logger.info('Could not find any spots. Will skip enqueuing forecast jobs.');
      return;
    }

    logger.info('Enqueuing %d forecast jobs (one per spot).', allSpots.length);

    const queueUrl = process.env.SQS_QUEUE_URL;
    if (!queueUrl) {
      throw new Error('SQS_QUEUE_URL environment variable is not set');
    }

    await pMap(allSpots, async (spot: Spot) => {
      try {
        await sqsEnqueueWithLocalSupport({
          queueUrl,
          messageBody: JSON.stringify({ spotId: spot.spotId }),
        });
        logger.info('Enqueued forecast job for Spot[%s].', spot.spotId);
      } catch (error) {
        logger.error('Error enqueuing forecast job for Spot[%s]:', spot.spotId, {
          error,
        });
      }
    });
  } catch (error) {
    logger.error('Error enqueuing forecast jobs:', error);
    throw error;
  }
};
