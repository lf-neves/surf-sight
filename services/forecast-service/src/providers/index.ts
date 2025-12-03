import { ForecastProvider } from './types';

const forecastProviders = new Map<string, ForecastProvider>();

export function registerProvider(provider: ForecastProvider) {
  forecastProviders.set(provider.name, provider);
}

export function getProvider(name: string) {
  return forecastProviders.get(name);
}
