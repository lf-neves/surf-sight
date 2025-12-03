import { SpotType, UserSkillLevel } from '@prisma/client';
import { Spot, User, Forecast, prismaClient } from '@surf-sight/database';
import { faker } from '@faker-js/faker';

export async function setupTestData(): Promise<{
  spot: Spot;
  user: User;
  forecast: Forecast;
}> {
  // Create a test spot
  const spot = await prismaClient.spot.create({
    data: {
      name: faker.location.city(),
      slug: faker.lorem.slug(),
      lat: -33.8568,
      lon: 151.2153,
      type: SpotType.beach,
      meta: {
        description: 'Test spot for unit tests',
      },
    },
  });

  // Create a test user
  const user = await prismaClient.user.create({
    data: {
      email: faker.internet.email(),
      name: faker.person.fullName(),
      skillLevel: UserSkillLevel.intermediate,
    },
  });

  // Create a test forecast for the spot
  const forecast = await prismaClient.forecast.create({
    data: {
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
    },
  });

  return {
    spot,
    user,
    forecast,
  };
}

export type TestData = Awaited<ReturnType<typeof setupTestData>>;
