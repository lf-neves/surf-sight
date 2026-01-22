import { faker, setupTestData, TestData } from '@surf-sight/test-setup';
import { ForecastServiceEvent, drizzleDb, forecastServiceEvents, forecasts, spots } from '@surf-sight/database';
import { eq } from 'drizzle-orm';
import { processForecastServiceEvent } from '..';
import * as validateModule from '../validateForecastProviderResponseData';
import { ProviderResponse } from '../../../providers/types';

describe('processForecastServiceEvent', () => {
  let testData: TestData;
  let forecastServiceEvent: ForecastServiceEvent;
  let mockForecast: ProviderResponse;

  beforeEach(async () => {
    testData = await setupTestData();

    mockForecast = {
      provider: 'stormglass',
      fetchedAt: new Date(),
      location: {
        lat: testData.spot.lat,
        lng: testData.spot.lon,
      },
      points: [
        {
          time: new Date(Date.now() + 3600000), // 1 hour from now
          waveHeight: 1.5,
          wavePeriod: 8,
          waveDirection: 180,
          windSpeed: 10,
          windDirection: 200,
        },
      ],
    };

    const [created] = await drizzleDb
      .insert(forecastServiceEvents)
      .values({
        payload: {
          spotId: testData.spot.spotId,
          forecast: mockForecast,
        },
        eventType: 'create_new_forecasts',
      })
      .returning();

    if (!created) {
      throw new Error('Failed to create forecast service event');
    }

    forecastServiceEvent = created;
  });

  test('should process forecast service event', async () => {
    let allForecasts = await drizzleDb
      .select()
      .from(forecasts)
      .where(eq(forecasts.spotId, testData.spot.spotId));

    expect(allForecasts).toHaveLength(1);

    // act
    await processForecastServiceEvent({ forecastServiceEvent });

    allForecasts = await drizzleDb
      .select()
      .from(forecasts)
      .where(eq(forecasts.spotId, testData.spot.spotId));

    // assert
    expect(allForecasts).toHaveLength(2);
  });

  test('should not process ForecastServiceEvent if forecast is not valid', async () => {
    const initialForecasts = await drizzleDb
      .select()
      .from(forecasts)
      .where(eq(forecasts.spotId, testData.spot.spotId));

    const initialCount = initialForecasts.length;

    jest
      .spyOn(validateModule, 'validateForecastProviderResponseData')
      .mockImplementation(() => {
        throw new Error('Invalid forecast data');
      });

    // act
    await expect(
      processForecastServiceEvent({ forecastServiceEvent })
    ).rejects.toThrow('Invalid forecast data');

    // Verify no new forecasts were created
    const finalForecasts = await drizzleDb
      .select()
      .from(forecasts)
      .where(eq(forecasts.spotId, testData.spot.spotId));

    // assert
    expect(finalForecasts).toHaveLength(initialCount);
  });

  test('should not process ForecastServiceEvent if Spot is not found', async () => {
    const invalidSpotId = faker.string.uuid();
    const [invalidForecastServiceEvent] = await drizzleDb
      .insert(forecastServiceEvents)
      .values({
        payload: {
          spotId: invalidSpotId,
          forecast: mockForecast,
        },
        eventType: 'create_new_forecasts',
      })
      .returning();

    if (!invalidForecastServiceEvent) {
      throw new Error('Failed to create invalid forecast service event');
    }

    await expect(
      processForecastServiceEvent({
        forecastServiceEvent: invalidForecastServiceEvent,
      })
    ).rejects.toThrow(
      'Could not find Spot for the given forecast service event.'
    );
  });
});
