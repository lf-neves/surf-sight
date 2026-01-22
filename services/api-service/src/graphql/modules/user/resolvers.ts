import {
  GraphqlUserResolvers,
  GraphqlQueryResolvers,
  GraphqlMutationResolvers,
} from '../../generated/types';
import { hashPassword } from '../../../auth/password';
import { randomBytes } from 'crypto';

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

    // Note: This mutation creates a user without a password (for admin use)
    // Regular user creation should use AuthService.signup which handles password hashing
    // For this mutation, we'll create a user with a placeholder password that must be reset
    // In production, you might want to require password or remove this mutation entirely
    
    // Generate a random password that must be reset (user can't login with this)
    const randomPassword = randomBytes(32).toString('hex');
    const hashedPassword = await hashPassword(randomPassword);

    const user = await context.services.userService.create({
      email: args.input.email,
      password: hashedPassword, // Random password - user must reset it
      name: args.input.name || undefined,
      phone: args.input.phone || undefined,
      skillLevel: args.input.skillLevel || undefined,
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
