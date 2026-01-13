import { useMemo } from 'react';
import { useForecastsForSpotQuery } from '@/lib/graphql/generated/apollo-graphql-hooks';
import {
  parseForecastRaw,
  windSpeedToKmh,
  degreesToDirection,
  calculateSurfabilityScore,
  formatTime,
  formatDayName,
  ForecastPoint,
} from '@/lib/utils/forecast';

export interface TransformedForecast {
  id: string;
  spotId: string;
  timestamp: Date;
  formattedTime: string;
  dayName: string;
  parsed: ForecastPoint;
  // Convenience fields - pre-calculated
  swellHeight: number;
  swellPeriod: number;
  swellDirection: number;
  swellDirectionName: string;
  windSpeed: number; // in km/h
  windSpeedMs: number; // in m/s
  windDirection: number;
  windDirectionName: string;
  waterTemperature?: number;
  airTemperature?: number;
  surfabilityScore: number;
  // Raw data
  raw: any;
  source: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UseForecastsForSpotOptions {
  spotId: string;
  nextHours?: number;
  skip?: boolean;
}

export function useForecastsForSpot({
  spotId,
  nextHours,
  skip = false,
}: UseForecastsForSpotOptions) {
  const { data, loading, error } = useForecastsForSpotQuery({
    variables: { spotId, nextHours },
    skip: skip || !spotId,
  });

  const forecasts = useMemo<TransformedForecast[]>(() => {
    if (!data?.forecastsForSpot) {
      return [];
    }

    return data.forecastsForSpot.map((f) => {
      const timestamp = new Date(f.timestamp);
      const parsed = parseForecastRaw(f.raw);

      return {
        id: f.id,
        spotId: f.spotId,
        timestamp,
        formattedTime: formatTime(timestamp),
        dayName: formatDayName(timestamp),
        parsed,
        // Pre-calculated convenience fields
        swellHeight: parsed.swellHeight || parsed.waveHeight || 0,
        swellPeriod: parsed.swellPeriod || parsed.wavePeriod || 0,
        swellDirection: parsed.swellDirection || parsed.waveDirection || 0,
        swellDirectionName: degreesToDirection(
          parsed.swellDirection || parsed.waveDirection || 0
        ),
        windSpeed: Math.round(windSpeedToKmh(parsed.windSpeed)),
        windSpeedMs: parsed.windSpeed,
        windDirection: parsed.windDirection,
        windDirectionName: degreesToDirection(parsed.windDirection),
        waterTemperature: parsed.waterTemperature,
        airTemperature: parsed.airTemperature,
        surfabilityScore: calculateSurfabilityScore(parsed),
        // Raw data
        raw: f.raw,
        source: f.source,
        createdAt: new Date(f.createdAt),
        updatedAt: new Date(f.updatedAt),
      };
    });
  }, [data?.forecastsForSpot]);

  const latestForecast = useMemo(() => {
    return forecasts.length > 0 ? forecasts[0] : null;
  }, [forecasts]);

  return {
    forecasts,
    latestForecast,
    loading,
    error,
  };
}
