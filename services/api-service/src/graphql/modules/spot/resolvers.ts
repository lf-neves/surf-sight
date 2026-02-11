import {
  GraphqlSpotResolvers,
  GraphqlQueryResolvers,
  GraphqlMutationResolvers,
} from '../../generated/types.js';
import { logger } from '@surf-sight/core';

export const spotResolvers: GraphqlSpotResolvers = {
  id: (parent) => parent.spotId,

  latestForecastForSpot: async (parent, _args, context) => {
    const spotId = parent.spotId;
    const forecast = await context.services.forecastService.findLatestForecastForSpot(spotId);
    if (!forecast) {
      logger.info('[Resolver] latestForecastForSpot', { spotId, found: false });
    }
    return forecast;
  },

  aiSummary: async (parent, args, context) => {
    if (args.timestamp) {
      return context.loaders.summaryLoader.load({
        spotId: parent.spotId,
        timestamp: args.timestamp ? new Date(args.timestamp) : undefined,
      });
    }
    return context.loaders.summaryLoader.load({
      spotId: parent.spotId,
    });
  },

  aiInsights: async (parent, args, context) => {
    return context.services.aiSummaryService.getLatestInsights(
      parent.spotId,
      args.timestamp ? new Date(args.timestamp) : undefined
    );
  },
};

export const spotQueryResolvers: Partial<GraphqlQueryResolvers> = {
  spots: async (_parent, _args, context) => {
    const list = await context.services.spotService.findAll();
    logger.info('[Resolver] spots', { count: list.length });
    return list;
  },

  spot: async (_parent, args, context) => {
    const spot = await context.services.spotService.findById(args.id);
    logger.info('[Resolver] spot(id)', { id: args.id, found: !!spot, name: spot?.name });
    return spot;
  },

  spotBySlug: async (_parent, args, context) => {
    return context.services.spotService.findBySlug(args.slug);
  },

  searchSpots: async (_parent, args, context) => {
    return context.services.spotService.search(args.query);
  },
};

export const spotMutationResolvers: Partial<GraphqlMutationResolvers> = {
  createSpot: async (_parent, args, context) => {
    return context.services.spotService.create(args.input);
  },

  updateSpot: async (_parent, args, context) => {
    return context.services.spotService.update(args.id, {
      name: args.input.name || undefined,
      slug: args.input.slug || undefined,
      lat: args.input.lat || undefined,
      lon: args.input.lon || undefined,
      type: args.input.type || undefined,
      meta: args.input.meta || undefined,
    });
  },

  deleteSpot: async (_parent, args, context) => {
    await context.services.spotService.delete(args.id);
    return true;
  },
};
