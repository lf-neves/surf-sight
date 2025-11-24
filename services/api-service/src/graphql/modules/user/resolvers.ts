import {
  GraphqlUserResolvers,
  GraphqlQueryResolvers,
  GraphqlMutationResolvers,
} from '../../generated/types';
import { GraphQLContext } from '../../../context';

export const userResolvers: GraphqlUserResolvers = {
  id: (parent) => parent.userId,

  favorites: async (parent, _args, context) => {
    return context.services.favoriteService.findForUser(parent.userId);
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
    return context.services.userService.create(args.input);
  },

  updateUser: async (_parent, args, context) => {
    return context.services.userService.update(args.id, args.input);
  },

  deleteUser: async (_parent, args, context) => {
    await context.services.userService.delete(args.id);
    return true;
  },
};

