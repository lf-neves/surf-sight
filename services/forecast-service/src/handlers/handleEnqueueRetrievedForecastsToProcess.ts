import { drizzleDb, Spot, forecastServiceEvents, spots } from '@surf-sight/database';
import { asc } from 'drizzle-orm';
import {
  logger,
  pMap,
  sqsEnqueueWithLocalSupport,
  getGlobalAwsRequestContext,
} from '@surf-sight/core';
import { StormglassForecastProvider } from '../providers/StormglassForecastProvider';

export const handleEnqueueRetrievedForecastsToProcess = async () => {
  try {
    const allSpots = await drizzleDb
      .select()
      .from(spots)
      .orderBy(asc(spots.createdAt));

    if (!allSpots.length) {
      logger.info('Could not find any spots. Will skip processing forecasts.');

      return;
    }

    logger.info('Found %d spots. Will look for new forecasts.', allSpots.length);

    const forecastProvider = new StormglassForecastProvider();
    const awsRequestContext = getGlobalAwsRequestContext();

    // Retrieve forecasts for each spot and create individual events
    await pMap(allSpots, async (spot: Spot) => {
      try {
        const forecastResponse = await forecastProvider.fetchForecast({
          lat: spot.lat,
          lng: spot.lon,
          start: new Date(),
          end: new Date(),
        });

        const [forecastServiceEvent] = await drizzleDb
          .insert(forecastServiceEvents)
          .values({
            eventType: 'FORECASTS_UPDATE_ENQUEUED',
            payload: {
              forecast: forecastResponse,
              spotId: spot.spotId,
            },
            enqueuerAwsRequestId: awsRequestContext?.awsRequestId ?? null,
          })
          .returning();

        if (!forecastServiceEvent) {
          throw new Error('Failed to create forecast service event');
        }

        // Enqueue the event to SQS
        const queueUrl = process.env.SQS_QUEUE_URL;
        if (!queueUrl) {
          throw new Error('SQS_QUEUE_URL environment variable is not set');
        }

        await sqsEnqueueWithLocalSupport({
          queueUrl,
          messageBody: JSON.stringify(forecastServiceEvent),
        });

        logger.info(
          'Created and enqueued ForecastServiceEvent[%s] for Spot[%s].',
          forecastServiceEvent.forecastServiceEventId,
          spot.spotId
        );
      } catch (error) {
        logger.error('Error processing forecast for Spot[%s]:', spot.spotId, {
          error,
        });
      }
    });
  } catch (error) {
    logger.error('Error enqueuing retrieved forecasts to process:', error);
    throw error;
  }
};
