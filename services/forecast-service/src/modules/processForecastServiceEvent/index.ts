import {
  ForecastServiceEvent,
  drizzleDb,
  spots,
  forecasts,
} from '@surf-sight/database';
import { eq } from 'drizzle-orm';
import { ProviderResponse } from '../../providers/types';
import { logger } from '@surf-sight/core';
import { validateForecastProviderResponseData } from './validateForecastProviderResponseData';

type ForecastEventPayload = {
  forecast: ProviderResponse | any;
  spotId: string;
};

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

export async function processForecastServiceEvent({
  forecastServiceEvent,
}: {
  forecastServiceEvent: ForecastServiceEvent;
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

  const spotResults = await drizzleDb
    .select()
    .from(spots)
    .where(eq(spots.spotId, spotId))
    .limit(1);

  const spot = spotResults[0] || null;

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

  await drizzleDb.insert(forecasts).values(
    forecast.points.map((point) => ({
      spotId,
      timestamp: point.time,
      raw: point,
      source: forecast.provider,
    }))
  );
}
