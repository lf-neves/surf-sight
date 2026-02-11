import { GraphqlQueryResolvers, GraphqlTidePointResolvers } from '../../generated/types';
import { fetchTidesByCoordinates } from '../../../services/StormglassTideService';
import { env } from '../../../env';
import { logger } from '@surf-sight/core';

export const tidePointResolvers: GraphqlTidePointResolvers = {
  time: (parent) => parent.time,
  height: (parent) => parent.height,
  type: (parent) => parent.type ?? null,
};

export const tideQueryResolvers: Partial<GraphqlQueryResolvers> = {
  tidesForSpot: async (_parent, args, context) => {
    logger.info('[tidesForSpot] called', { spotId: args.spotId });
    const spot = await context.services.spotService.findById(args.spotId);
    if (!spot) {
      logger.warn('[tidesForSpot] Spot not found', { spotId: args.spotId });
      return { stationName: null, points: [] };
    }
    const apiKey = env.stormglassApiKey;
    logger.info('[tidesForSpot] spot found, calling Stormglass', { lat: spot.lat, lon: spot.lon, hasApiKey: !!apiKey });
    try {
      const result = await fetchTidesByCoordinates(
        spot.lat,
        spot.lon,
        apiKey
      );
      return {
        stationName: result.stationName ?? null,
        points: result.points,
      };
    } catch (error) {
      logger.error('[tidesForSpot] Stormglass fetch failed', { spotId: args.spotId, error });
      return { stationName: null, points: [] };
    }
  },
};
