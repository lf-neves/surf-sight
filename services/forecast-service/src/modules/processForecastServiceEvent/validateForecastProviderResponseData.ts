import { ProviderResponse } from '../../providers/types';

function validateCoordinate(
  value: number,
  min: number,
  max: number,
  coordinateType: 'latitude' | 'longitude'
): void {
  const name = coordinateType === 'latitude' ? 'Latitude' : 'Longitude';

  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    throw new Error(`${name} must be a finite number.`);
  }

  if (value < min || value > max) {
    throw new Error(`${name} must be between ${min} and ${max} degrees.`);
  }

  return;
}

export function validateForecastProviderResponseData(
  providerResponse: ProviderResponse
): ProviderResponse {
  if (!providerResponse?.provider) {
    throw new Error('Provider response is missing required field: provider');
  }

  if (
    !providerResponse?.fetchedAt ||
    !(providerResponse.fetchedAt instanceof Date)
  ) {
    throw new Error('Provider response is missing required field: fetchedAt.');
  }

  if (!providerResponse?.location) {
    throw new Error('Provider response is missing required field: location.');
  }

  validateCoordinate(providerResponse.location.lat, -90, 90, 'latitude');
  validateCoordinate(providerResponse.location.lng, -180, 180, 'longitude');

  if (!providerResponse?.points || !Array.isArray(providerResponse.points)) {
    throw new Error('Provider response is missing required field: points.');
  }

  if (providerResponse.points.length === 0) {
    throw new Error('Points array cannot be empty.');
  }

  return providerResponse;
}
