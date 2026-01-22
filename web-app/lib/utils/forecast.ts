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
 * Handles various forecast data formats from different sources
 */
export function parseForecastRaw(raw: any): ForecastPoint {
  // Handle both string and object formats
  let data: any;
  try {
    data = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (e) {
    // If parsing fails, try to use raw as-is or provide defaults
    data = raw || {};
  }

  // Handle nested data structures (e.g., Stormglass format)
  const waveData = data.waveHeight !== undefined ? data : (data.wave || data.swell || {});
  const windData = data.windSpeed !== undefined ? data : (data.wind || {});
  const tempData = data.waterTemperature !== undefined ? data : (data.temperature || {});

  // Extract time - handle various formats
  let time: Date;
  if (data.time) {
    time = new Date(data.time);
  } else if (data.timestamp) {
    time = new Date(data.timestamp);
  } else {
    time = new Date(); // Fallback to now
  }

  // Extract wave/swell data with fallbacks
  const waveHeight = waveData.waveHeight || waveData.swellHeight || waveData.height || 0;
  const wavePeriod = waveData.wavePeriod || waveData.swellPeriod || waveData.period || 0;
  const waveDirection = waveData.waveDirection || waveData.swellDirection || waveData.direction || 0;

  // Extract wind data
  const windSpeed = windData.windSpeed || windData.speed || 0;
  const windDirection = windData.windDirection || windData.direction || 0;

  // Extract temperature data
  const waterTemp = tempData.waterTemperature || tempData.water || tempData.seaTemperature;
  const airTemp = tempData.airTemperature || tempData.air || tempData.airTemp;

  return {
    time,
    waveHeight: waveHeight || 0,
    wavePeriod: wavePeriod || 0,
    waveDirection: waveDirection || 0,
    windSpeed: windSpeed || 0,
    windDirection: windDirection || 0,
    waterTemperature: waterTemp,
    airTemperature: airTemp,
    swellHeight: waveHeight || 0,
    swellPeriod: wavePeriod || 0,
    swellDirection: waveDirection || 0,
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
