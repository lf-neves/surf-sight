#!/usr/bin/env tsx
/**
 * Script to create a test ForecastServiceEvent for local testing
 * 
 * Usage:
 *   pnpm tsx scripts/create-test-event.ts
 * 
 * This will create a test event and output the event ID to use in events/sqs-event.json
 */

import { drizzleDb, spots, forecastServiceEvents } from '@surf-sight/database';
import { asc, eq } from 'drizzle-orm';

async function createTestEvent() {
  try {
    // Get the first spot from the database
    const spotResults = await drizzleDb
      .select()
      .from(spots)
      .orderBy(asc(spots.createdAt))
      .limit(1);

    const spot = spotResults[0];

    if (!spot) {
      console.error('❌ No spots found in database. Please seed the database first.');
      console.log('Run: pnpm db:seed');
      process.exit(1);
    }

    // Create the payload structure (matching the handler's structure)
    const payload = {
      forecast: {
        provider: 'stormglass',
        fetchedAt: new Date().toISOString(),
        location: {
          lat: spot.lat,
          lng: spot.lon,
        },
        points: [
          {
            time: new Date().toISOString(),
            waveHeight: 1.5,
            wavePeriod: 10,
            waveDirection: 180,
            windSpeed: 5,
            windDirection: 270,
          },
        ],
      },
      spotId: spot.spotId,
    };

    // Create a test event with minimal payload
    const [testEvent] = await drizzleDb
      .insert(forecastServiceEvents)
      .values({
        eventType: 'FORECASTS_UPDATE_ENQUEUED',
        payload: payload,
        enqueuerAwsRequestId: 'test-enqueuer-id',
      })
      .returning();

    if (!testEvent) {
      throw new Error('Failed to create test event');
    }

    // Verify the payload was stored correctly
    const retrievedEventResults = await drizzleDb
      .select()
      .from(forecastServiceEvents)
      .where(eq(forecastServiceEvents.forecastServiceEventId, testEvent.forecastServiceEventId))
      .limit(1);

    const retrievedEvent = retrievedEventResults[0];

    if (!retrievedEvent) {
      throw new Error('Failed to retrieve created event');
    }

    const retrievedPayload = retrievedEvent.payload as any;
    if (!retrievedPayload?.forecast?.points || !Array.isArray(retrievedPayload.forecast.points)) {
      console.error('⚠️  Warning: Payload structure may be incorrect');
      console.log('Retrieved payload:', JSON.stringify(retrievedPayload, null, 2));
    }

    console.log('✅ Test event created successfully!');
    console.log(`\nEvent ID: ${testEvent.forecastServiceEventId}`);
    console.log('\nUpdate events/sqs-event.json with this ID:');
    console.log(JSON.stringify({
      Records: [
        {
          body: JSON.stringify({ forecastServiceEventId: testEvent.forecastServiceEventId }),
          awsRequestId: 'test-request-id-123',
        },
      ],
    }, null, 2));
  } catch (error) {
    console.error('❌ Error creating test event:', error);
    process.exit(1);
  }
}

createTestEvent();
