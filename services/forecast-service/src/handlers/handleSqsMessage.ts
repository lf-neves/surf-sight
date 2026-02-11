import { logger, sqsEnqueueWithLocalSupport } from '@surf-sight/core';
import { drizzleDb, spots } from '@surf-sight/database';
import { forecastServiceEvents } from '@surf-sight/database';
import { eq } from 'drizzle-orm';
import assert from 'node:assert/strict';
import {
  processForecastServiceEvent,
  persistForecastForSpot,
} from '../modules/processForecastServiceEvent';
import { StormglassForecastProvider } from '../providers/StormglassForecastProvider';
import { ProviderResponse } from '../providers/types';

type SQSEvent = {
  Records: {
    body: string;
    awsRequestId: string;
  }[];
};

type SQSRecord = {
  body: string;
  awsRequestId: string;
};

type ForecastJobBody = { spotId: string };
type LegacyEventBody = { forecastServiceEventId: string };

function parseProviderResponseDates(rawForecast: any): ProviderResponse {
  if (!rawForecast.points || !Array.isArray(rawForecast.points)) {
    throw new Error(
      `Invalid forecast data: points array is missing or invalid. Received: ${JSON.stringify(rawForecast)}`
    );
  }
  return {
    ...rawForecast,
    fetchedAt: new Date(rawForecast.fetchedAt),
    points: rawForecast.points.map((point: any) => ({
      ...point,
      time: new Date(point.time),
    })),
  };
}

export const handleSqsMessage = async (event: SQSEvent): Promise<void> => {
  const body = JSON.parse(event.Records[0].body) as ForecastJobBody | LegacyEventBody;

  // New flow: message is { spotId } — worker fetches from Stormglass then persists
  if ('spotId' in body && body.spotId) {
    const { spotId } = body;
    const spotResults = await drizzleDb
      .select()
      .from(spots)
      .where(eq(spots.spotId, spotId))
      .limit(1);
    const spot = spotResults[0] || null;
    assert(spot, `Spot[${spotId}] not found.`);

    logger.info('Fetching forecast from Stormglass for Spot[%s].', spotId);
    const forecastProvider = new StormglassForecastProvider();
    const rawResponse = await forecastProvider.fetchForecast({
      lat: spot.lat,
      lng: spot.lon,
      start: new Date(),
      end: new Date(),
    });
    const forecast = parseProviderResponseDates(rawResponse);
    await persistForecastForSpot(spotId, forecast);
    logger.info('Persisted forecast for Spot[%s]. Enqueuing insight job.', spotId);

    const insightQueueUrl = process.env.SQS_INSIGHT_QUEUE_URL;
    if (insightQueueUrl) {
      await sqsEnqueueWithLocalSupport({
        queueUrl: insightQueueUrl,
        messageBody: JSON.stringify({ spotId }),
      });
    }
    return;
  }

  // Legacy flow: message is { forecastServiceEventId }
  const { forecastServiceEventId } = body as LegacyEventBody;
  const forecastServiceEventResults = await drizzleDb
    .select()
    .from(forecastServiceEvents)
    .where(eq(forecastServiceEvents.forecastServiceEventId, forecastServiceEventId))
    .limit(1);

  const forecastServiceEvent = forecastServiceEventResults[0] || null;

  assert(
    forecastServiceEvent,
    `Expected ForecastServiceEvent[${forecastServiceEventId}] to exist.`
  );

  await drizzleDb
    .update(forecastServiceEvents)
    .set({
      processorAwsRequestIds: event.Records.map(
        (record: SQSRecord) => record.awsRequestId
      ),
    })
    .where(eq(forecastServiceEvents.forecastServiceEventId, forecastServiceEventId));

  if (forecastServiceEvent.processingStatus === 'completed') {
    logger.info(
      'ForecastServiceEvent[%s] is already processed.',
      forecastServiceEventId
    );
    return;
  }

  if (forecastServiceEvent.processingStatus !== 'pending') {
    throw new Error(
      `Expected ForecastServiceEvent[${forecastServiceEventId}] to be pending, but it is ${forecastServiceEvent.processingStatus}.`
    );
  }

  if (forecastServiceEvent.retries >= 3) {
    await drizzleDb
      .update(forecastServiceEvents)
      .set({
        processingStatus: 'failed',
      })
      .where(eq(forecastServiceEvents.forecastServiceEventId, forecastServiceEventId));
    throw new Error(
      `ForecastServiceEvent[${forecastServiceEventId}] has retried 3 times and failed.`
    );
  }

  try {
    logger.info('Processing ForecastServiceEvent[%s].', forecastServiceEventId);
    await processForecastServiceEvent({ forecastServiceEvent });
    await drizzleDb
      .update(forecastServiceEvents)
      .set({
        processingStatus: 'completed',
      })
      .where(eq(forecastServiceEvents.forecastServiceEventId, forecastServiceEventId));
  } catch (error) {
    await drizzleDb
      .update(forecastServiceEvents)
      .set({
        retries: forecastServiceEvent.retries + 1,
      })
      .where(eq(forecastServiceEvents.forecastServiceEventId, forecastServiceEventId));
    throw error;
  }
};
