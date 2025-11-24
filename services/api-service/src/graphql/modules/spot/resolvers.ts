import {
  GraphqlSpotResolvers,
  GraphqlQueryResolvers,
  GraphqlMutationResolvers,
} from '../../generated/types';
import { GraphQLContext } from '../../../context';

export const spotResolvers: GraphqlSpotResolvers = {
  id: (parent) => parent.spotId,
  
  forecast: async (parent, args, context) => {
    return context.services.forecastService.findForSpot(
      parent.spotId,
      args.nextHours || undefined
    );
  },

  aiSummary: async (parent, args, context) => {
    if (args.timestamp) {
      return context.loaders.summaryLoader.load({
        spotId: parent.spotId,
        timestamp: args.timestamp,
      });
    }
    return context.loaders.summaryLoader.load({
      spotId: parent.spotId,
    });
  },

  aiInsights: async (parent, args, context) => {
    return context.services.aiSummaryService.getLatestInsights(
      parent.spotId,
      args.timestamp || undefined
    );
  },
};

export const spotQueryResolvers: Partial<GraphqlQueryResolvers> = {
  spots: async (_parent, _args, context) => {
    return context.services.spotService.findAll();
  },

  spot: async (_parent, args, context) => {
    return context.services.spotService.findById(args.id);
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
    return context.services.spotService.update(args.id, args.input);
  },

  deleteSpot: async (_parent, args, context) => {
    await context.services.spotService.delete(args.id);
    return true;
  },
};

