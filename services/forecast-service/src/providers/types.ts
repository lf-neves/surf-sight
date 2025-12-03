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

export interface ForecastRequest {
  lat: number;
  lng: number;
  start: Date;
  end: Date;
}
export interface ProviderResponse {
  points: ForecastPoint[];
  provider: string;
  fetchedAt: Date;
  location: {
    lat: number;
    lng: number;
  };
}

export interface ForecastProvider {
  name: string;
  fetchForecast(request: ForecastRequest): Promise<ProviderResponse>;
}
