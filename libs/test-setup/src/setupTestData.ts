import { SpotType, UserSkillLevel, Spot, User, Forecast, drizzleDb, spots, users, forecasts } from '@surf-sight/database';
import { faker } from '@faker-js/faker';

export async function setupTestData(): Promise<{
  spot: Spot;
  user: User;
  forecast: Forecast;
}> {
  // Create a test spot
  const [spot] = await drizzleDb
    .insert(spots)
    .values({
      name: faker.location.city(),
      slug: faker.lorem.slug(),
      lat: -33.8568,
      lon: 151.2153,
      type: 'beach' as SpotType,
      meta: {
        description: 'Test spot for unit tests',
      },
    })
    .returning();

  if (!spot) {
    throw new Error('Failed to create test spot');
  }

  // Create a test user
  const [user] = await drizzleDb
    .insert(users)
    .values({
      email: faker.internet.email(),
      name: faker.person.fullName(),
      skillLevel: 'intermediate' as UserSkillLevel,
      password: 'hashed-password-placeholder', // Required field
    })
    .returning();

  if (!user) {
    throw new Error('Failed to create test user');
  }

  // Create a test forecast for the spot
  const [forecast] = await drizzleDb
    .insert(forecasts)
    .values({
      spotId: spot.spotId,
      timestamp: faker.date.past({ years: 1 }),
      raw: {
        waveHeight: faker.number.float({ min: 0.5, max: 3.0 }),
        wavePeriod: faker.number.int({ min: 5, max: 15 }),
        waveDirection: faker.number.int({ min: 0, max: 360 }),
        windSpeed: faker.number.float({ min: 0, max: 20 }),
        windDirection: faker.number.int({ min: 0, max: 360 }),
      },
      source: 'stormglass',
    })
    .returning();

  if (!forecast) {
    throw new Error('Failed to create test forecast');
  }

  return {
    spot,
    user,
    forecast,
  };
}

export type TestData = Awaited<ReturnType<typeof setupTestData>>;
