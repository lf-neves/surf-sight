import {
  GraphqlAISummaryResolvers,
  GraphqlQueryResolvers,
  GraphqlMutationResolvers,
} from "../../generated/types";
import { GraphQLContext } from "../../../context";

export const aiResolvers: GraphqlAISummaryResolvers = {
  id: (parent) => parent.aiSummaryId,
  forecastId: (parent) => parent.forecastId,
  spotId: (parent) => parent.spotId,

  forecast: async (parent, _args, context) => {
    return context.services.forecastService.findById(parent.forecastId);
  },

  spot: async (parent, _args, context) => {
    return context.services.spotService.findById(parent.spotId);
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

