import { handleSqsMessage } from '../handleSqsMessage';
import { ForecastServiceEvent, prismaClient } from '@surf-sight/database';
import {
  makeSqsEvent,
  mocked,
  setupTestData,
  SQSEvent,
  TestData,
} from '@surf-sight/test-setup';
import { processForecastServiceEvent } from '../../modules/processForecastServiceEvent';
import { ProviderResponse } from '../../providers/types';

jest.mock('../../modules/processForecastServiceEvent');

describe('handleSqsMessage', () => {
  let sqsEvent: SQSEvent;
  let forecastServiceEvent: ForecastServiceEvent;
  let testData: TestData;
  let mockForecast: ProviderResponse;

  beforeEach(async () => {
    // Clear mock call history between tests
    jest.clearAllMocks();

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

    forecastServiceEvent = await prismaClient.forecastServiceEvent.create({
      data: {
        payload: {
          spotId: testData.spot.spotId,
          forecast: JSON.parse(JSON.stringify(mockForecast)),
        },
        eventType: 'create_new_forecasts',
      },
    });

    sqsEvent = makeSqsEvent(forecastServiceEvent);
  });

  test('process and marks ForecastServiceEvent processing status as completed', async () => {
    expect(forecastServiceEvent.processingStatus).toBe('pending');
    expect(forecastServiceEvent.processorAwsRequestIds).toHaveLength(0);

    // act
    await handleSqsMessage(sqsEvent);

    // assert
    const updatedEvent = await prismaClient.forecastServiceEvent.findUnique({
      where: {
        forecastServiceEventId: forecastServiceEvent.forecastServiceEventId,
      },
    });

    expect(updatedEvent?.processingStatus).toBe('completed');
    expect(updatedEvent?.processorAwsRequestIds).toHaveLength(1);
    expect(processForecastServiceEvent).toHaveBeenCalledWith({
      forecastServiceEvent: expect.objectContaining({
        forecastServiceEventId: forecastServiceEvent.forecastServiceEventId,
      }),
    });
  });

  test('throws if ForecastServiceEvent processing status is not pending', async () => {
    await prismaClient.forecastServiceEvent.update({
      where: {
        forecastServiceEventId: forecastServiceEvent.forecastServiceEventId,
      },
      data: {
        processingStatus: 'failed',
      },
    });

    const updatedEvent = await prismaClient.forecastServiceEvent.findUnique({
      where: {
        forecastServiceEventId: forecastServiceEvent.forecastServiceEventId,
      },
    });

    expect(updatedEvent?.processingStatus).toBe('failed');

    // act
    await expect(handleSqsMessage(sqsEvent)).rejects.toThrow(/to be pending/i);

    // assert - status should remain failed
    const finalEvent = await prismaClient.forecastServiceEvent.findUnique({
      where: {
        forecastServiceEventId: forecastServiceEvent.forecastServiceEventId,
      },
    });

    expect(finalEvent?.processingStatus).toBe('failed');
  });

  test('does not throw if ForecastServiceEvent processing status is completed', async () => {
    await prismaClient.forecastServiceEvent.update({
      where: {
        forecastServiceEventId: forecastServiceEvent.forecastServiceEventId,
      },
      data: {
        processingStatus: 'completed',
      },
    });

    const updatedEvent = await prismaClient.forecastServiceEvent.findUnique({
      where: {
        forecastServiceEventId: forecastServiceEvent.forecastServiceEventId,
      },
    });

    expect(updatedEvent?.processingStatus).toBe('completed');

    // act
    await expect(handleSqsMessage(sqsEvent)).resolves.not.toThrow();

    // assert - status should remain completed
    const finalEvent = await prismaClient.forecastServiceEvent.findUnique({
      where: {
        forecastServiceEventId: forecastServiceEvent.forecastServiceEventId,
      },
    });

    expect(finalEvent?.processingStatus).toBe('completed');
    expect(processForecastServiceEvent).not.toHaveBeenCalled();
  });

  test('retries three times before marking ForecastServiceEvent instance processing status as failed', async () => {
    mocked(processForecastServiceEvent).mockRejectedValue(new Error());

    let currentEvent = await prismaClient.forecastServiceEvent.findUnique({
      where: {
        forecastServiceEventId: forecastServiceEvent.forecastServiceEventId,
      },
    });

    expect(currentEvent).toEqual(
      expect.objectContaining({ retries: 0, processingStatus: 'pending' })
    );

    // act: first retry
    await expect(handleSqsMessage(sqsEvent)).rejects.toThrow();

    currentEvent = await prismaClient.forecastServiceEvent.findUnique({
      where: {
        forecastServiceEventId: forecastServiceEvent.forecastServiceEventId,
      },
    });

    expect(currentEvent).toEqual(
      expect.objectContaining({ retries: 1, processingStatus: 'pending' })
    );

    // act: second retry
    await expect(handleSqsMessage(sqsEvent)).rejects.toThrow();

    currentEvent = await prismaClient.forecastServiceEvent.findUnique({
      where: {
        forecastServiceEventId: forecastServiceEvent.forecastServiceEventId,
      },
    });

    expect(currentEvent).toEqual(
      expect.objectContaining({ retries: 2, processingStatus: 'pending' })
    );

    // act: third retry
    await expect(handleSqsMessage(sqsEvent)).rejects.toThrow();

    currentEvent = await prismaClient.forecastServiceEvent.findUnique({
      where: {
        forecastServiceEventId: forecastServiceEvent.forecastServiceEventId,
      },
    });

    expect(currentEvent).toEqual(
      expect.objectContaining({ retries: 3, processingStatus: 'pending' })
    );

    // act: fourth retry (marks as failed)
    await expect(handleSqsMessage(sqsEvent)).rejects.toThrow(
      /has retried 3 times/i
    );

    currentEvent = await prismaClient.forecastServiceEvent.findUnique({
      where: {
        forecastServiceEventId: forecastServiceEvent.forecastServiceEventId,
      },
    });

    expect(currentEvent).toEqual(
      expect.objectContaining({ retries: 3, processingStatus: 'failed' })
    );
  });
});
