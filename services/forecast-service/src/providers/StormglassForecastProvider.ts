import { ForecastProvider, ForecastRequest, ProviderResponse } from './types';

export class StormglassForecastProvider implements ForecastProvider {
  public readonly name = 'stormglass';

  async fetchForecast(request: ForecastRequest): Promise<ProviderResponse> {
    // TODO: Implement actual Stormglass API integration
    return {
      provider: this.name,
      fetchedAt: new Date(),
      location: {
        lat: request.lat,
        lng: request.lng,
      },
      points: [],
    };
  }
}
