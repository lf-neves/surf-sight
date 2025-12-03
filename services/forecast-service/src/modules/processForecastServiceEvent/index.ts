import {
  ForecastServiceEvent,
  prismaClient,
  PrismaClient,
} from '@surf-sight/database';
import { ProviderResponse } from '../../providers/types';
import { logger } from '@surf-sight/core';
import { validateForecastProviderResponseData } from './validateForecastProviderResponseData';

type ForecastEventPayload = {
  forecast: ProviderResponse | any;
  spotId: string;
};

function parseProviderResponseDates(rawForecast: any): ProviderResponse {
  return {
    ...rawForecast,
    fetchedAt: new Date(rawForecast.fetchedAt),
    points: rawForecast.points.map((point: any) => ({
      ...point,
      time: new Date(point.time),
    })),
  };
}

export async function processForecastServiceEvent({
  forecastServiceEvent,
  client = prismaClient,
}: {
  forecastServiceEvent: ForecastServiceEvent;
  client?: PrismaClient;
}) {
  const { payload } = forecastServiceEvent;
  // Handle both string (from SQS) and object (from Prisma) payloads
  const eventPayload =
    typeof payload === 'string'
      ? (JSON.parse(payload) as ForecastEventPayload)
      : (payload as ForecastEventPayload);

  if (!eventPayload.forecast || !eventPayload.spotId) {
    throw new Error('Could not parse the forecast event payload.');
  }

  const { spotId } = eventPayload;

  const spot = await client.spot.findUnique({
    where: {
      spotId,
    },
  });

  if (!spot) {
    throw new Error(
      'Could not find Spot for the given forecast service event.'
    );
  }

  // Parse dates from JSON strings to Date objects
  const rawForecast = eventPayload.forecast;
  const forecast = parseProviderResponseDates(rawForecast);

  // Validate the forecast data
  validateForecastProviderResponseData(forecast);

  logger.info(
    'Will create %d Forecast records for Spot[%s].',
    forecast.points.length,
    spotId
  );

  await client.forecast.createMany({
    data: forecast.points.map((point) => ({
      spotId,
      timestamp: point.time,
      raw: JSON.stringify(point),
      source: forecast.provider,
    })),
    skipDuplicates: true,
  });
}
