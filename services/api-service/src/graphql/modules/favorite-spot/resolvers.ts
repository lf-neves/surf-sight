import {
  GraphqlFavoriteSpotResolvers,
  GraphqlQueryResolvers,
  GraphqlMutationResolvers,
  GraphqlSubscriptionResolvers,
} from '../../generated/types';
import { FAVORITE_UPDATED } from '../subscription/events';
import { getAuthenticatedUser } from '../../../context';

export const favoriteResolvers: GraphqlFavoriteSpotResolvers = {
  userId: (parent) => parent.userId,
  spotId: (parent) => parent.spotId,

  user: async (parent, _args, context) => {
    const user = await context.services.userService.findById(parent.userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  },

  spot: async (parent, _args, context) => {
    const spot = await context.services.spotService.findById(parent.spotId);
    if (!spot) {
      throw new Error('Spot not found');
    }
    return spot;
  },
};

export const favoriteQueryResolvers: GraphqlQueryResolvers = {
  favorites: async (_parent, _args, context) => {
    const user = getAuthenticatedUser(context);
    return context.services.favoriteSpotService.findForUser(user.userId);
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
    const user = getAuthenticatedUser(context);

    const favorite = await context.services.favoriteSpotService.add(
      user.userId,
      args.spotId,
      args.notifyWhatsapp || undefined
    );

    await context.pubsub.publish(FAVORITE_UPDATED, {
      favoriteUpdated: favorite,
    });

    return favorite;
  },

  removeFavorite: async (_parent, args, context) => {
    const user = getAuthenticatedUser(context);

    await context.services.favoriteSpotService.remove(
      user.userId,
      args.spotId
    );

    return true;
  },

  updateFavorite: async (_parent, args, context) => {
    const user = getAuthenticatedUser(context);

    const favorite = await context.services.favoriteSpotService.update(
      user.userId,
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
    subscribe: async (_parent, _args, context) => {
      return context.pubsub.asyncIterator([FAVORITE_UPDATED]) as any;
    },
    resolve: (payload: any) => payload.favoriteUpdated,
  },
};
