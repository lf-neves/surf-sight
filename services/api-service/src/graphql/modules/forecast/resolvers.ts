import {
  GraphqlForecastResolvers,
  GraphqlQueryResolvers,
  GraphqlMutationResolvers,
  GraphqlSubscriptionResolvers,
} from '../../generated/types';
import { FORECAST_UPDATED } from '../subscription/events';

export const forecastResolvers: GraphqlForecastResolvers = {
  id: (parent) => parent.forecastId,
  spotId: (parent) => parent.spotId,

  spot: async (parent, _args, context) => {
    const spot = await context.services.spotService.findById(parent.spotId);
    if (!spot) {
      throw new Error('Spot not found');
    }
    return spot;
  },

  summaries: async (parent, _args, context) => {
    // Use the service to find summaries for this forecast
    return context.services.aiSummaryService.findByForecastId(parent.forecastId);
  },
};

export const forecastQueryResolvers: GraphqlQueryResolvers = {
  forecast: async (_parent, args, context) => {
    return context.services.forecastService.findById(args.id);
  },

  latestForecastForSpot: async (_parent, args, context) => {
    return context.services.forecastService.findLatestForecastForSpot(args.spotId);
  },

  forecastsForSpot: async (_parent, args, context) => {
    return context.services.forecastService.findForSpot(args.spotId, args.nextHours ?? undefined);
  },
};

export const forecastMutationResolvers: GraphqlMutationResolvers = {
  createForecast: async (_parent, args, context) => {
    const forecast = await context.services.forecastService.create({
      spotId: args.input.spotId,
      timestamp: new Date(args.input.timestamp),
      raw: args.input.raw || {},
      source: args.input.source || 'stormglass',
    });

    // Publish subscription event
    await context.pubsub.publish(FORECAST_UPDATED, {
      forecastUpdated: forecast,
    });

    return forecast;
  },

  updateForecast: async (_parent, args, context) => {
    const forecast = await context.services.forecastService.update(args.id, {
      ...(args.input.timestamp && {
        timestamp: new Date(args.input.timestamp),
      }),
      ...(args.input.raw && { raw: args.input.raw }),
      ...(args.input.source && { source: args.input.source }),
    });

    await context.pubsub.publish(FORECAST_UPDATED, {
      forecastUpdated: forecast,
    });

    return forecast;
  },

  deleteForecast: async (_parent, args, context) => {
    await context.services.forecastService.delete(args.id);
    return true;
  },
};

export const forecastSubscriptionResolvers: GraphqlSubscriptionResolvers = {
  forecastUpdated: {
    subscribe: async (_parent, _args, context) => {
      return context.pubsub.asyncIterator([FORECAST_UPDATED]) as any;
    },
    resolve: (payload: any) => {
      // Filter by spotId if provided
      return payload.forecastUpdated;
    },
  },
};
