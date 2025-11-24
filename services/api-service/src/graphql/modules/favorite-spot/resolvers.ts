import {
  GraphqlFavoriteSpotResolvers,
  GraphqlQueryResolvers,
  GraphqlMutationResolvers,
  GraphqlSubscriptionResolvers,
} from '../../generated/types';
import { GraphQLContext } from '../../../context';
import { FAVORITE_UPDATED } from '../subscription/events';

export const favoriteResolvers: GraphqlFavoriteSpotResolvers = {
  userId: (parent) => parent.userId,
  spotId: (parent) => parent.spotId,

  user: async (parent, _args, context) => {
    return context.services.userService.findById(parent.userId);
  },

  spot: async (parent, _args, context) => {
    return context.services.spotService.findById(parent.spotId);
  },
};

export const favoriteQueryResolvers: GraphqlQueryResolvers = {
  favorites: async (_parent, _args, context) => {
    if (!context.user) {
      throw new Error('Authentication required.');
    }
    return context.services.favoriteSpotService.findForUser(context.user.userId);
  },

  isFavorite: async (_parent, args, context) => {
    if (!context.user) {
      return false;
    }
    return context.services.favoriteSpotService.isFavorite(
      context.user.userId,
      args.spotId
    );
  },
};

export const favoriteMutationResolvers: GraphqlMutationResolvers = {
  addFavorite: async (_parent, args, context) => {
    if (!context.user) {
      throw new Error('Authentication required.');
    }

    const favorite = await context.services.favoriteSpotService.add(
      context.user.userId,
      args.spotId,
      args.notifyWhatsapp || undefined
    );

    await context.pubsub.publish(FAVORITE_UPDATED, {
      favoriteUpdated: favorite,
    });

    return favorite;
  },

  removeFavorite: async (_parent, args, context) => {
    if (!context.user) {
      throw new Error('Authentication required.');
    }

    await context.services.favoriteSpotService.remove(
      context.user.userId,
      args.spotId
    );

    return true;
  },

  updateFavorite: async (_parent, args, context) => {
    if (!context.user) {
      throw new Error('Authentication required.');
    }

    const favorite = await context.services.favoriteSpotService.update(
      context.user.userId,
      args.spotId,
      args.notifyWhatsapp
    );

    await context.pubsub.publish(FAVORITE_UPDATED, {
      favoriteUpdated: favorite,
    });

    return favorite;
  },
};

export const favoriteSubscriptionResolvers: GraphqlSubscriptionResolvers = {
  favoriteUpdated: {
    subscribe: (_parent, _args, context) => {
      return context.pubsub.asyncIterator([FAVORITE_UPDATED]);
    },
    resolve: (payload: any) => payload.favoriteUpdated,
  },
};

