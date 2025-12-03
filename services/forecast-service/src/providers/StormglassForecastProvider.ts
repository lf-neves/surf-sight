import { ForecastProvider, ForecastRequest, ProviderResponse } from './types';

export class StormglassForecastProvider implements ForecastProvider {
  public readonly name = 'stormglass';

  async fetchForecast(request: ForecastRequest): Promise<ProviderResponse> {
    return {};
  }
}
