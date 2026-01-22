import { GraphqlQueryResolvers } from '../../generated/types';
import { drizzleDb } from '@surf-sight/database';
import { sql } from 'drizzle-orm';

export const healthQueryResolvers: Partial<GraphqlQueryResolvers> = {
  dbStatus: async () => {
    const startTime = Date.now();

    try {
      // Execute a simple query to check database connectivity
      await drizzleDb.execute(sql`SELECT 1`);

      const responseTime = Date.now() - startTime;

      return {
        connected: true,
        responseTime,
        error: null,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      return {
        connected: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
};
