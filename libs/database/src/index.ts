// Export Drizzle client and types
export { drizzleDb, prismaClient } from './client';
export * from './drizzle/schema';
// Export ForecastServiceEvent type for backward compatibility
export type { ForecastServiceEvent } from './drizzle/schema/ForecastServiceEvent';
