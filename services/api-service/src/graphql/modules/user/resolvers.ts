import {
  GraphqlUserResolvers,
  GraphqlQueryResolvers,
  GraphqlMutationResolvers,
} from '../../generated/types';

export const userResolvers: GraphqlUserResolvers = {
  id: (parent) => parent.userId,

  favorites: async (parent, _args, context) => {
    return context.services.favoriteSpotService.findForUser(parent.userId);
  },
};

export const userQueryResolvers: GraphqlQueryResolvers = {
  users: async (_parent, _args, context) => {
    return context.services.userService.findAll();
  },

  user: async (_parent, args, context) => {
    return context.services.userService.findById(args.id);
  },

  userByEmail: async (_parent, args, context) => {
    return context.services.userService.findByEmail(args.email);
  },

  me: async (_parent, _args, context) => {
    if (!context.user) {
      return null;
    }
    return context.services.userService.findById(context.user.userId);
  },
};

export const userMutationResolvers: GraphqlMutationResolvers = {
  createUser: async (_parent, args, context) => {
    if (!args.input) {
      throw new Error('Input is required');
    }

    const user = await context.services.userService.create({
      email: args.input.email,
    });

    if (!user) {
      throw new Error('User not created');
    }
    return user;
  },

  updateUser: async (_parent, args, context) => {
    const user = await context.services.userService.update(args.id, {
      email: args.input.email!,
    });

    if (!user) {
      throw new Error('User not found');
    }
    return user;
  },

  deleteUser: async (_parent, args, context) => {
    await context.services.userService.delete(args.id);
    return true;
  },
};
