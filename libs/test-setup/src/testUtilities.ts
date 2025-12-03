import { faker } from '@faker-js/faker';
import { ForecastServiceEvent } from '@surf-sight/database';

/**
 * Jest mocked helper - re-exported for convenience
 */
export const mocked = jest.mocked;

/**
 * SQS Event type for testing
 */
export type SQSEvent = {
  Records: {
    body: string;
    awsRequestId: string;
  }[];
};

/**
 * Creates a mock SQS event for testing handlers that process ForecastServiceEvent messages
 * @param forecastServiceEvent - The ForecastServiceEvent to include in the SQS message body
 * @returns A mock SQSEvent with the forecastServiceEventId in the body
 */
export function makeSqsEvent(
  forecastServiceEvent: ForecastServiceEvent
): SQSEvent {
  return {
    Records: [
      {
        body: JSON.stringify({
          forecastServiceEventId: forecastServiceEvent.forecastServiceEventId,
        }),
        awsRequestId: faker.string.uuid(),
      },
    ],
  };
}
