import DataLoader from 'dataloader';
import { drizzleDb, forecasts, Forecast } from '@surf-sight/database';
import { inArray, asc } from 'drizzle-orm';

type ForecastKey = {
  spotId: string;
  hours?: number;
};

export function createForecastLoader(db: typeof drizzleDb) {
  return new DataLoader<ForecastKey, Forecast[]>(
    async (keys) => {
      // Group keys by spotId
      const spotIds = [...new Set(keys.map((k) => k.spotId))];
      const hoursMap = new Map<string, number>();

      keys.forEach((key) => {
        if (key.hours) {
          hoursMap.set(key.spotId, key.hours);
        }
      });

      // Fetch all forecasts for these spots
      const result = await db
        .select()
        .from(forecasts)
        .where(inArray(forecasts.spotId, spotIds))
        .orderBy(asc(forecasts.timestamp));

      // Group by spotId
      const forecastsBySpot = new Map<string, Forecast[]>();
      result.forEach((forecast) => {
        const existing = forecastsBySpot.get(forecast.spotId) || [];
        existing.push(forecast);
        forecastsBySpot.set(forecast.spotId, existing);
      });

      // Return results in the same order as keys
      return keys.map((key) => {
        const spotForecasts = forecastsBySpot.get(key.spotId) || [];

        if (key.hours) {
          const now = new Date();
          const cutoff = new Date(now.getTime() + key.hours * 60 * 60 * 1000);
          return spotForecasts.filter((f) => new Date(f.timestamp) <= cutoff);
        }

        return spotForecasts;
      });
    },
    {
      cacheKeyFn: (key: ForecastKey) => ({
        spotId: key.spotId,
        hours: key.hours,
      }),
    }
  );
}
