import { prismaClient } from '../src/client';
import { SpotType } from '@prisma/client';

async function main() {
  console.log('🌱 Starting database seed...');

  // Create example spot
  const exampleSpot = await prismaClient.spot.upsert({
    where: { slug: 'arpoador-rio' },
    update: {},
    create: {
      name: 'Arpoador',
      slug: 'arpoador-rio',
      lat: -22.9874,
      lon: -43.1933,
      type: SpotType.beach,
      meta: {
        description: 'Iconic beach break in Rio de Janeiro',
        country: 'Brazil',
        region: 'Rio de Janeiro',
        city: 'Rio de Janeiro',
      },
    },
  });

  console.log('✅ Created example spot:', exampleSpot.name);

  // Create example user
  const exampleUser = await prismaClient.user.upsert({
    where: { email: 'surfer@example.com' },
    update: {},
    create: {
      email: 'surfer@example.com',
      name: 'John Surfer',
      phone: '+5511999999999',
      skillLevel: 'intermediate',
    },
  });

  console.log('✅ Created example user:', exampleUser.email);

  // Add spot to user's favorites
  await prismaClient.favoriteSpot.upsert({
    where: {
      userId_spotId: {
        userId: exampleUser.userId,
        spotId: exampleSpot.spotId,
      },
    },
    update: {},
    create: {
      userId: exampleUser.userId,
      spotId: exampleSpot.spotId,
      notifyWhatsapp: true,
    },
  });

  console.log('✅ Added spot to user favorites');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
