import { logger } from '@surf-sight/core';
import { prismaClient } from '@surf-sight/database';
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

  const forecastServiceEvent =
    await prismaClient.forecastServiceEvent.findUnique({
      where: {
        forecastServiceEventId,
      },
    });

  assert(
    forecastServiceEvent,
    `Expected ForecastServiceEvent[${forecastServiceEventId}] to exist.`
  );

  await prismaClient.forecastServiceEvent.update({
    where: {
      forecastServiceEventId,
    },
    data: {
      processorAwsRequestIds: event.Records.map(
        (record: SQSRecord) => record.awsRequestId
      ),
    },
  });

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
    await prismaClient.forecastServiceEvent.update({
      where: {
        forecastServiceEventId,
      },
      data: {
        processingStatus: 'failed',
      },
    });

    throw new Error(
      `ForecastServiceEvent[${forecastServiceEventId}] has retried 3 times and failed.`
    );
  }

  try {
    logger.info('Processing ForecastServiceEvent[%s].', forecastServiceEventId);

    await processForecastServiceEvent({ forecastServiceEvent });

    await prismaClient.forecastServiceEvent.update({
      where: {
        forecastServiceEventId,
      },
      data: {
        processingStatus: 'completed',
      },
    });
  } catch (error) {
    await prismaClient.forecastServiceEvent.update({
      where: {
        forecastServiceEventId,
      },
      data: {
        retries: {
          increment: 1,
        },
      },
    });

    throw error;
  }
};
