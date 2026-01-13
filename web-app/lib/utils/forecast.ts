/**
 * Utility functions for parsing and transforming forecast data
 */

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface ForecastPoint {
  time: Date;
  waveHeight: number; // in meters
  wavePeriod: number; // in seconds
  waveDirection: number; // in degrees (0-360)
  windSpeed: number; // in m/s
  windDirection: number; // in degrees (0-360)
  waterTemperature?: number; // in Celsius
  airTemperature?: number; // in Celsius
  swellHeight?: number; // in meters
  swellPeriod?: number; // in seconds
  swellDirection?: number; // in degrees (0-360)
}

export interface ParsedForecast {
  timestamp: Date;
  raw: ForecastPoint;
}

/**
 * Parse a forecast's raw JSON data into a ForecastPoint
 */
export function parseForecastRaw(raw: any): ForecastPoint {
  // Handle both string and object formats
  const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
  
  return {
    time: new Date(data.time),
    waveHeight: data.waveHeight || data.swellHeight || 0,
    wavePeriod: data.wavePeriod || data.swellPeriod || 0,
    waveDirection: data.waveDirection || data.swellDirection || 0,
    windSpeed: data.windSpeed || 0,
    windDirection: data.windDirection || 0,
    waterTemperature: data.waterTemperature,
    airTemperature: data.airTemperature,
    swellHeight: data.swellHeight || data.waveHeight,
    swellPeriod: data.swellPeriod || data.wavePeriod,
    swellDirection: data.swellDirection || data.waveDirection,
  };
}

/**
 * Convert wind speed from m/s to km/h
 */
export function windSpeedToKmh(ms: number): number {
  return ms * 3.6;
}

/**
 * Convert degrees to compass direction abbreviation
 */
export function degreesToDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

/**
 * Calculate surfability score based on conditions
 * This is a simplified scoring algorithm
 */
export function calculateSurfabilityScore(forecast: ForecastPoint): number {
  let score = 5; // Base score

  // Wave height (optimal around 1-2m)
  if (forecast.waveHeight >= 0.5 && forecast.waveHeight <= 2.5) {
    score += 2;
  } else if (forecast.waveHeight > 2.5) {
    score += 1;
  }

  // Wave period (longer is better, optimal >10s)
  if (forecast.wavePeriod >= 10) {
    score += 2;
  } else if (forecast.wavePeriod >= 8) {
    score += 1;
  }

  // Wind (offshore is better, onshore is worse)
  // Simplified: assume spot faces a certain direction
  // For now, lower wind speed is better
  if (forecast.windSpeed < 5) {
    score += 1;
  } else if (forecast.windSpeed > 15) {
    score -= 1;
  }

  // Water temperature (comfort factor)
  if (forecast.waterTemperature && forecast.waterTemperature >= 20) {
    score += 0.5;
  }

  return Math.min(10, Math.max(0, score));
}

/**
 * Format time to display format using date-fns
 * @param date - Date to format
 * @param formatType - 'short' for "14h" or 'long' for "14:00"
 */
export function formatTime(date: Date, formatType: 'short' | 'long' = 'short'): string {
  if (formatType === 'short') {
    return format(date, "H'h'", { locale: ptBR });
  }
  return format(date, 'HH:mm', { locale: ptBR });
}

/**
 * Format date to day name in Portuguese using date-fns
 * @param date - Date to format
 * @returns Day name abbreviation (e.g., "Dom", "Seg")
 */
export function formatDayName(date: Date): string {
  return format(date, 'EEE', { locale: ptBR });
}
