import { prismaClient, Spot } from '@surf-sight/database';
import {
  logger,
  pMap,
  sqsEnqueueWithLocalSupport,
  getGlobalAwsRequestContext,
} from '@surf-sight/core';
import { StormglassForecastProvider } from '../providers/StormglassForecastProvider';

export const handleEnqueueRetrievedForecastsToProcess = async () => {
  try {
    const spots = await prismaClient.spot.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (!spots.length) {
      logger.info('Could not find any spots. Will skip processing forecasts.');

      return;
    }

    logger.info('Found %d spots. Will look for new forecasts.', spots.length);

    const forecastProvider = new StormglassForecastProvider();
    const awsRequestContext = getGlobalAwsRequestContext();

    // Retrieve forecasts for each spot and create individual events
    await pMap(spots, async (spot: Spot) => {
      try {
        const forecastResponse = await forecastProvider.fetchForecast({
          lat: spot.lat,
          lng: spot.lon,
          start: new Date(),
          end: new Date(),
        });

        const forecastServiceEvent =
          await prismaClient.forecastServiceEvent.create({
            data: {
              eventType: 'create_new_forecasts',
              payload: JSON.stringify({
                forecast: forecastResponse,
                spotId: spot.spotId,
              }),
              enqueuerAwsRequestId: awsRequestContext?.awsRequestId ?? null,
            },
          });

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
