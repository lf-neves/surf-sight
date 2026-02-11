import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { drizzleDb, resetDatabasePool } from '../drizzle/client';
import { aiSummaries, forecasts, spots } from '../drizzle/schema';
import { eq, desc } from 'drizzle-orm';

function isConnectionError(error: unknown): boolean {
  const msg = String((error as any)?.message ?? '');
  const causeMsg = String((error as any)?.cause?.message ?? '');
  return (
    /connection timeout|Connection terminated|ECONNRESET|ECONNREFUSED/i.test(msg) ||
    /connection timeout|Connection terminated|ECONNRESET|ECONNREFUSED/i.test(causeMsg)
  );
}

/** Placeholder AI insights for local dev so the Education Panel shows content without OpenAI. */
const PLACEHOLDER_INSIGHTS = {
  summary:
    'Condições adequadas para surf com ondas moderadas. Vento favorável no período da manhã. Ideal para praticantes intermediários.',
  structured: {
    skillLevel: 'intermediate',
    recommendations: [
      'Melhor horário: manhã (ventos mais fracos)',
      'Leve prancha de tamanho médio',
      'Verifique a maré antes de entrar',
    ],
    risks: [
      'Correntes podem estar fortes na maré cheia',
      'Respeite as sinalizações do pico',
    ],
    rating: 7,
  },
};

export async function seedAISummaries() {
  console.log('🤖 Starting AI summaries seeder...');

  const spotRows = await drizzleDb
    .select({ spotId: spots.spotId })
    .from(spots);

  if (spotRows.length === 0) {
    console.log('   No spots found. Run spots seeder first (pnpm run db:seed).');
    return;
  }

  let ok = 0;
  let failed = 0;

  for (const { spotId } of spotRows) {
    const [latestForecast] = await drizzleDb
      .select()
      .from(forecasts)
      .where(eq(forecasts.spotId, spotId))
      .orderBy(desc(forecasts.timestamp))
      .limit(1);

    if (!latestForecast) {
      console.warn(`   No forecast for spot ${spotId}, skipping AI summary.`);
      failed++;
      continue;
    }

    const now = new Date();
    try {
      await drizzleDb.insert(aiSummaries).values({
        aiSummaryId: randomUUID(),
        forecastId: latestForecast.forecastId,
        spotId,
        summary: PLACEHOLDER_INSIGHTS.summary,
        structured: PLACEHOLDER_INSIGHTS.structured as unknown as Record<string, unknown>,
        modelInfo: { source: 'seed', model: 'placeholder' },
        createdAt: now,
        updatedAt: now,
      });
      ok++;
    } catch (error) {
      if (isConnectionError(error)) {
        console.warn(`⚠️ Connection error for spot ${spotId}, resetting pool and retrying once...`);
        await resetDatabasePool();
        try {
          await drizzleDb.insert(aiSummaries).values({
            aiSummaryId: randomUUID(),
            forecastId: latestForecast.forecastId,
            spotId,
            summary: PLACEHOLDER_INSIGHTS.summary,
            structured: PLACEHOLDER_INSIGHTS.structured as unknown as Record<string, unknown>,
            modelInfo: { source: 'seed', model: 'placeholder' },
            createdAt: now,
            updatedAt: now,
          });
          ok++;
        } catch (retryError) {
          console.error(`❌ Failed to seed AI summary for spot ${spotId}:`, retryError);
          failed++;
        }
      } else {
        console.error(`❌ Failed to seed AI summary for spot ${spotId}:`, error);
        failed++;
      }
    }
  }

  console.log(`✅ AI summaries seeder completed!`);
  console.log(`   Spots with AI insights: ${ok} ok, ${failed} failed`);
}

if (require.main === module) {
  seedAISummaries()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error('❌ AI summaries seeder failed:', e);
      process.exit(1);
    });
}
