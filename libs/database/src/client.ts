// Drizzle client - replaces PrismaClient
export { drizzleDb as prismaClient, resetDatabasePool } from './drizzle/client';
// Re-export for backward compatibility during migration
export { drizzleDb } from './drizzle/client';
