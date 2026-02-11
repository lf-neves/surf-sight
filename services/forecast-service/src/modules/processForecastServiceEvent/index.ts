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

/**
 * Persist a provider forecast response to the forecasts table.
 * Used by the worker after fetching from Stormglass (and by legacy event processing).
 */
export async function persistForecastForSpot(
  spotId: string,
  forecast: ProviderResponse
): Promise<void> {
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

export async function processForecastServiceEvent({
  forecastServiceEvent,
}: {
  forecastServiceEvent: ForecastServiceEvent;
}) {
  const { payload } = forecastServiceEvent;
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

  const rawForecast = eventPayload.forecast;
  const forecast = parseProviderResponseDates(rawForecast);
  await persistForecastForSpot(spotId, forecast);
}
