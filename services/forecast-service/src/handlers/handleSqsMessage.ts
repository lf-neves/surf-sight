import { logger } from '@surf-sight/core';
import { drizzleDb, ForecastServiceEvent } from '@surf-sight/database';
import { forecastServiceEvents } from '@surf-sight/database';
import { eq } from 'drizzle-orm';
import assert from 'node:assert/strict';
import { processForecastServiceEvent } from '../modules/processForecastServiceEvent';

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

export const handleSqsMessage = async (event: SQSEvent): Promise<void> => {
  const { forecastServiceEventId } = JSON.parse(event.Records[0].body);

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
