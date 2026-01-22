// Drizzle client - replaces PrismaClient
export { drizzleDb as prismaClient } from './drizzle/client';
// Re-export for backward compatibility during migration
export { drizzleDb } from './drizzle/client';
