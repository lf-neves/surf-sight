import {
  GraphqlAiSummaryResolvers,
  GraphqlQueryResolvers,
  GraphqlMutationResolvers,
} from '../../generated/types';

export const aiResolvers: GraphqlAiSummaryResolvers = {
  id: (parent) => parent.aiSummaryId,
  forecastId: (parent) => parent.forecastId,
  spotId: (parent) => parent.spotId,

  forecast: async (parent, _args, context) => {
    const forecast = await context.services.forecastService.findById(
      parent.forecastId
    );

    if (!forecast) {
      throw new Error('Forecast not found');
    }

    return forecast;
  },

  spot: async (parent, _args, context) => {
    const spot = await context.services.spotService.findById(parent.spotId);

    if (!spot) {
      throw new Error('Spot not found');
    }

    return spot;
  },
};

export const aiQueryResolvers: GraphqlQueryResolvers = {
  aiSummary: async (_parent, args, context) => {
    return context.services.aiSummaryService.findById(args.id);
  },

  latestAISummary: async (_parent, args, context) => {
    return context.services.aiSummaryService.getLatestSummary(
      args.spotId,
      args.timestamp ? new Date(args.timestamp) : undefined
    );
  },
};

export const aiMutationResolvers: GraphqlMutationResolvers = {
  createAISummary: async (_parent, args, context) => {
    return context.services.aiSummaryService.create({
      forecastId: args.input.forecastId,
      spotId: args.input.spotId,
      summary: args.input.summary,
      structured: args.input.structured || {},
      modelInfo: args.input.modelInfo || {},
    });
  },

  deleteAISummary: async (_parent, args, context) => {
    await context.services.aiSummaryService.delete(args.id);
    return true;
  },
};
