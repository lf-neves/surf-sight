import { randomUUID } from 'node:crypto';
import { drizzleDb, resetDatabasePool } from '../drizzle/client';
import { spots as spotsTable } from '../drizzle/schema';
import type { SpotType } from '../drizzle/schema/enums';
import { eq } from 'drizzle-orm';

function isConnectionError(error: unknown): boolean {
  const msg = String((error as any)?.message ?? '');
  const causeMsg = String((error as any)?.cause?.message ?? '');
  return (
    /connection timeout|Connection terminated|ECONNRESET|ECONNREFUSED/i.test(msg) ||
    /connection timeout|Connection terminated|ECONNRESET|ECONNREFUSED/i.test(causeMsg)
  );
}

interface SpotData {
  name: string;
  slug: string;
  lat: number;
  lon: number;
  type: SpotType;
  meta: {
    description?: string;
    country: string;
    region?: string;
    city?: string;
    difficulty?: string;
    bestSeason?: string;
  };
}

const spots: SpotData[] = [
  // Pipeline - Hawaii (User's favorite)
  {
    name: 'Pipeline',
    slug: 'pipeline-hawaii',
    lat: 21.6569,
    lon: -158.0506,
    type: 'reef' as SpotType,
    meta: {
      description: 'The most famous and dangerous wave in the world',
      country: 'United States',
      region: 'Hawaii',
      city: 'Oahu',
      difficulty: 'expert',
      bestSeason: 'winter',
    },
  },
  // J-Bay - South Africa (User's favorite)
  {
    name: 'Jeffreys Bay',
    slug: 'jeffreys-bay-south-africa',
    lat: -34.0503,
    lon: 24.9133,
    type: 'point' as SpotType,
    meta: {
      description: 'World-class right-hand point break, home of the J-Bay Open',
      country: 'South Africa',
      region: 'Eastern Cape',
      city: 'Jeffreys Bay',
      difficulty: 'intermediate',
      bestSeason: 'winter',
    },
  },
  // Teahupo'o - Tahiti
  {
    name: "Teahupo'o",
    slug: 'teahupoo-tahiti',
    lat: -17.8444,
    lon: -149.2669,
    type: 'reef' as SpotType,
    meta: {
      description: 'Heavy, barreling reef break known for massive waves',
      country: 'French Polynesia',
      region: 'Tahiti',
      city: "Teahupo'o",
      difficulty: 'expert',
      bestSeason: 'summer',
    },
  },
  // Banzai Pipeline - North Shore
  {
    name: 'Sunset Beach',
    slug: 'sunset-beach-hawaii',
    lat: 21.6667,
    lon: -158.05,
    type: 'beach' as SpotType,
    meta: {
      description: 'Iconic big wave beach break on the North Shore',
      country: 'United States',
      region: 'Hawaii',
      city: 'Oahu',
      difficulty: 'advanced',
      bestSeason: 'winter',
    },
  },
  // Mavericks - California
  {
    name: 'Mavericks',
    slug: 'mavericks-california',
    lat: 37.4925,
    lon: -122.5014,
    type: 'reef' as SpotType,
    meta: {
      description: 'Big wave spot known for massive, powerful waves',
      country: 'United States',
      region: 'California',
      city: 'Half Moon Bay',
      difficulty: 'expert',
      bestSeason: 'winter',
    },
  },
  // Nazaré - Portugal
  {
    name: 'Nazaré',
    slug: 'nazare-portugal',
    lat: 39.6011,
    lon: -9.0756,
    type: 'beach' as SpotType,
    meta: {
      description: 'Home to some of the largest waves ever surfed',
      country: 'Portugal',
      region: 'Leiria',
      city: 'Nazaré',
      difficulty: 'expert',
      bestSeason: 'winter',
    },
  },
  // Uluwatu - Bali
  {
    name: 'Uluwatu',
    slug: 'uluwatu-bali',
    lat: -8.8292,
    lon: 115.085,
    type: 'reef' as SpotType,
    meta: {
      description: 'World-famous left-hand reef break with multiple sections',
      country: 'Indonesia',
      region: 'Bali',
      city: 'Uluwatu',
      difficulty: 'intermediate',
      bestSeason: 'dry season',
    },
  },
  // Cloudbreak - Fiji
  {
    name: 'Cloudbreak',
    slug: 'cloudbreak-fiji',
    lat: -18.1667,
    lon: 177.2167,
    type: 'reef' as SpotType,
    meta: {
      description: "Iconic left-hand reef break, one of the world's best waves",
      country: 'Fiji',
      region: 'Mamanuca Islands',
      city: 'Tavarua',
      difficulty: 'advanced',
      bestSeason: 'winter',
    },
  },
  // Raglan - New Zealand
  {
    name: 'Raglan',
    slug: 'raglan-new-zealand',
    lat: -37.8,
    lon: 174.8667,
    type: 'point' as SpotType,
    meta: {
      description: 'Long left-hand point break with multiple sections',
      country: 'New Zealand',
      region: 'Waikato',
      city: 'Raglan',
      difficulty: 'intermediate',
      bestSeason: 'winter',
    },
  },
  // Hossegor - France
  {
    name: 'Hossegor',
    slug: 'hossegor-france',
    lat: 43.65,
    lon: -1.4,
    type: 'beach' as SpotType,
    meta: {
      description: 'Powerful beach breaks, home of the Quiksilver Pro',
      country: 'France',
      region: 'Nouvelle-Aquitaine',
      city: 'Hossegor',
      difficulty: 'intermediate',
      bestSeason: 'autumn',
    },
  },
  // Bells Beach - Australia
  {
    name: 'Bells Beach',
    slug: 'bells-beach-australia',
    lat: -38.3667,
    lon: 144.2833,
    type: 'reef' as SpotType,
    meta: {
      description: 'Iconic right-hand reef break, home of the Rip Curl Pro',
      country: 'Australia',
      region: 'Victoria',
      city: 'Torquay',
      difficulty: 'intermediate',
      bestSeason: 'autumn',
    },
  },
  // Supertubos - Portugal
  {
    name: 'Supertubos',
    slug: 'supertubos-portugal',
    lat: 39.35,
    lon: -9.3333,
    type: 'beach' as SpotType,
    meta: {
      description: 'Barreling beach break, part of the WSL tour',
      country: 'Portugal',
      region: 'Leiria',
      city: 'Peniche',
      difficulty: 'advanced',
      bestSeason: 'autumn',
    },
  },
  // Trestles - California
  {
    name: 'Lower Trestles',
    slug: 'lower-trestles-california',
    lat: 33.3833,
    lon: -117.5833,
    type: 'reef' as SpotType,
    meta: {
      description: 'High-performance right-hand point break',
      country: 'United States',
      region: 'California',
      city: 'San Clemente',
      difficulty: 'intermediate',
      bestSeason: 'summer',
    },
  },
  // Snapper Rocks - Australia
  {
    name: 'Snapper Rocks',
    slug: 'snapper-rocks-australia',
    lat: -28.1833,
    lon: 153.55,
    type: 'point' as SpotType,
    meta: {
      description: 'Superbank, one of the longest waves in the world',
      country: 'Australia',
      region: 'Queensland',
      city: 'Gold Coast',
      difficulty: 'intermediate',
      bestSeason: 'winter',
    },
  },
  // Ericeira - Portugal
  {
    name: "Ribeira d'Ilhas",
    slug: 'ribeira-dilhas-portugal',
    lat: 39.0333,
    lon: -9.4167,
    type: 'reef' as SpotType,
    meta: {
      description:
        'Consistent right-hand reef break in the World Surfing Reserve',
      country: 'Portugal',
      region: 'Lisbon',
      city: 'Ericeira',
      difficulty: 'intermediate',
      bestSeason: 'autumn',
    },
  },
  // Malibu - California
  {
    name: 'Malibu',
    slug: 'malibu-california',
    lat: 34.0333,
    lon: -118.6667,
    type: 'point' as SpotType,
    meta: {
      description:
        'Iconic right-hand point break, birthplace of modern surfing',
      country: 'United States',
      region: 'California',
      city: 'Malibu',
      difficulty: 'beginner',
      bestSeason: 'summer',
    },
  },
  // Mundaka - Spain
  {
    name: 'Mundaka',
    slug: 'mundaka-spain',
    lat: 43.4,
    lon: -2.7,
    type: 'reef' as SpotType,
    meta: {
      description: 'World-class left-hand river mouth wave',
      country: 'Spain',
      region: 'Basque Country',
      city: 'Mundaka',
      difficulty: 'advanced',
      bestSeason: 'autumn',
    },
  },
  // Pichilemu - Chile
  {
    name: 'Punta de Lobos',
    slug: 'punta-de-lobos-chile',
    lat: -34.3833,
    lon: -72.0167,
    type: 'point' as SpotType,
    meta: {
      description: 'Powerful left-hand point break, big wave spot',
      country: 'Chile',
      region: "O'Higgins",
      city: 'Pichilemu',
      difficulty: 'advanced',
      bestSeason: 'winter',
    },
  },
  // Taghazout - Morocco
  {
    name: 'Anchor Point',
    slug: 'anchor-point-morocco',
    lat: 30.5333,
    lon: -9.7,
    type: 'point' as SpotType,
    meta: {
      description: 'Long right-hand point break in Morocco',
      country: 'Morocco',
      region: 'Souss-Massa',
      city: 'Taghazout',
      difficulty: 'intermediate',
      bestSeason: 'winter',
    },
  },
  // Puerto Escondido - Mexico
  {
    name: 'Zicatela',
    slug: 'zicatela-mexico',
    lat: 15.85,
    lon: -97.0667,
    type: 'beach' as SpotType,
    meta: {
      description: 'Powerful beach break known as the Mexican Pipeline',
      country: 'Mexico',
      region: 'Oaxaca',
      city: 'Puerto Escondido',
      difficulty: 'advanced',
      bestSeason: 'summer',
    },
  },
];

async function seedOneSpot(spotData: SpotData): Promise<'created' | 'updated'> {
  const existing = await drizzleDb
    .select()
    .from(spotsTable)
    .where(eq(spotsTable.slug, spotData.slug))
    .limit(1);

  if (existing.length > 0) {
    await drizzleDb
      .update(spotsTable)
      .set({
        name: spotData.name,
        lat: spotData.lat,
        lon: spotData.lon,
        type: spotData.type,
        meta: spotData.meta,
      })
      .where(eq(spotsTable.slug, spotData.slug));
    return 'updated';
  }
  const now = new Date();
  await drizzleDb.insert(spotsTable).values({
    spotId: randomUUID(),
    name: spotData.name,
    slug: spotData.slug,
    lat: spotData.lat,
    lon: spotData.lon,
    type: spotData.type,
    meta: spotData.meta,
    createdAt: now,
    updatedAt: now,
  });
  return 'created';
}

export async function seedSpots() {
  console.log('🌊 Starting spots seeder...');

  let created = 0;
  let updated = 0;

  for (const spotData of spots) {
    try {
      const result = await seedOneSpot(spotData);
      if (result === 'created') created++;
      else updated++;
    } catch (error) {
      if (isConnectionError(error)) {
        console.warn(`⚠️ Connection error for ${spotData.name}, resetting pool and retrying once...`);
        await resetDatabasePool();
        try {
          const result = await seedOneSpot(spotData);
          if (result === 'created') created++;
          else updated++;
        } catch (retryError) {
          console.error(`❌ Failed to seed spot ${spotData.name}:`, retryError);
        }
      } else {
        console.error(`❌ Failed to seed spot ${spotData.name}:`, error);
      }
    }
  }

  console.log(`✅ Spots seeder completed!`);
  console.log(`   Created: ${created} spots`);
  console.log(`   Updated: ${updated} spots`);
  console.log(`   Total: ${spots.length} spots`);
}

// Allow running directly
if (require.main === module) {
  seedSpots()
    .catch((e) => {
      console.error('❌ Spots seeder failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      // Drizzle uses connection pooling, no need to disconnect
    });
}
