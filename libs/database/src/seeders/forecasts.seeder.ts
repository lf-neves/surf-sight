import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { drizzleDb, resetDatabasePool } from '../drizzle/client';
import { forecasts as forecastsTable, spots as spotsTable } from '../drizzle/schema';

function isConnectionError(error: unknown): boolean {
  const msg = String((error as any)?.message ?? '');
  const causeMsg = String((error as any)?.cause?.message ?? '');
  return (
    /connection timeout|Connection terminated|ECONNRESET|ECONNREFUSED/i.test(msg) ||
    /connection timeout|Connection terminated|ECONNREFUSED/i.test(causeMsg)
  );
}

/** Raw forecast payload shape expected by parseForecastRaw (flat format) */
interface RawForecast {
  waveHeight: number;
  wavePeriod: number;
  waveDirection: number;
  swellHeight: number;
  swellPeriod: number;
  swellDirection: number;
  windSpeed: number;
  windDirection: number;
  waterTemperature?: number;
  time: string; // ISO
}

function buildRaw(overrides: Partial<RawForecast> & { time: string }): RawForecast {
  return {
    waveHeight: 1.2,
    wavePeriod: 11,
    waveDirection: 270,
    swellHeight: 1.2,
    swellPeriod: 11,
    swellDirection: 270,
    windSpeed: 4.5,
    windDirection: 280,
    waterTemperature: 22,
    ...overrides,
  };
}

export async function seedForecasts() {
  console.log('📊 Starting forecasts seeder...');

  const spotRows = await drizzleDb
    .select({ spotId: spotsTable.spotId })
    .from(spotsTable);

  if (spotRows.length === 0) {
    console.log('   No spots found. Run spots seeder first (pnpm run db:seed).');
    return;
  }

  const now = new Date();
  const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
  const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);

  let ok = 0;
  let failed = 0;

  for (const { spotId } of spotRows) {
    const timestamps = [now, sixHoursAgo, twelveHoursAgo];
    const raws: RawForecast[] = [
      buildRaw({ time: now.toISOString(), waveHeight: 1.5, swellHeight: 1.5, windSpeed: 5 }),
      buildRaw({ time: sixHoursAgo.toISOString(), waveHeight: 1.2, swellHeight: 1.2, windSpeed: 6 }),
      buildRaw({ time: twelveHoursAgo.toISOString(), waveHeight: 1.0, swellHeight: 1.0, windSpeed: 4 }),
    ];

    const nowForRow = new Date();
    for (let i = 0; i < timestamps.length; i++) {
      try {
        const ts = timestamps[i];
        const raw = raws[i];
        await drizzleDb
          .insert(forecastsTable)
          .values({
            forecastId: randomUUID(),
            spotId,
            timestamp: ts,
            raw: raw as unknown as Record<string, unknown>,
            source: 'stormglass',
            createdAt: nowForRow,
            updatedAt: nowForRow,
          })
          .onConflictDoNothing({ target: [forecastsTable.spotId, forecastsTable.timestamp] });
        ok++;
      } catch (error) {
        if (isConnectionError(error)) {
          console.warn(`⚠️ Connection error for spot ${spotId}, resetting pool and retrying once...`);
          await resetDatabasePool();
          try {
            await drizzleDb
              .insert(forecastsTable)
              .values({
                forecastId: randomUUID(),
                spotId,
                timestamp: timestamps[i],
                raw: raws[i] as unknown as Record<string, unknown>,
                source: 'stormglass',
                createdAt: nowForRow,
                updatedAt: nowForRow,
              })
              .onConflictDoNothing({ target: [forecastsTable.spotId, forecastsTable.timestamp] });
            ok++;
          } catch (retryError) {
            console.error(`❌ Failed to seed forecast for spot ${spotId}:`, retryError);
            failed++;
          }
        } else {
          console.error(`❌ Failed to seed forecast for spot ${spotId}:`, error);
          failed++;
        }
      }
    }
  }

  const total = spotRows.length * 3;
  console.log(`✅ Forecasts seeder completed!`);
  console.log(`   Spots with forecasts: ${spotRows.length}`);
  console.log(`   Forecast points: ${ok} ok, ${failed} failed (3 per spot: latest, -6h, -12h)`);
}

if (require.main === module) {
  seedForecasts()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error('❌ Forecasts seeder failed:', e);
      process.exit(1);
    });
}
