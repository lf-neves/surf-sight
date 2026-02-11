import 'dotenv/config';
import { seedSpots } from './spots.seeder';
import { seedForecasts } from './forecasts.seeder';

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is required. Set it in .env or the environment.');
    process.exit(1);
  }
  console.log('🌱 Running Drizzle seed...\n');
  await seedSpots();
  console.log('');
  await seedForecasts();
  console.log('\n✅ Seed completed.');
}

function isConnectionError(error: unknown): boolean {
  const msg = String((error as any)?.message ?? '');
  const causeMsg = String((error as any)?.cause?.message ?? '');
  return (
    /connection timeout|Connection terminated|ECONNRESET|ECONNREFUSED/i.test(msg) ||
    /connection timeout|Connection terminated|ECONNRESET|ECONNREFUSED/i.test(causeMsg)
  );
}

main().catch((e) => {
  console.error('❌ Seed failed:', e);
  if (isConnectionError(e)) {
    console.error('\n💡 Tip: Connection timeouts usually mean the DB is unreachable from this machine.');
    console.error('   - For local dev, use a local Postgres (e.g. Docker) and set DATABASE_URL to it.');
    console.error('   - For a remote DB (e.g. RDS), ensure VPN/network access and try DATABASE_CONNECTION_TIMEOUT_MS=30000 in .env');
  }
  process.exit(1);
});
