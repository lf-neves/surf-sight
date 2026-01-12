import { GraphqlQueryResolvers } from '../../generated/types';
import { prismaClient } from '@surf-sight/database';

export const healthQueryResolvers: Partial<GraphqlQueryResolvers> = {
  dbStatus: async () => {
    const startTime = Date.now();

    try {
      // Execute a simple query to check database connectivity
      await prismaClient.$queryRaw`SELECT 1`;

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
