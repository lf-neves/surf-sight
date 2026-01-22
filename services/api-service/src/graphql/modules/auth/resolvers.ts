import {
  GraphqlMutationResolvers,
  GraphqlAuthPayloadResolvers,
} from '../../generated/types';
import { AuthService } from '../../../auth/AuthService';
import { drizzleDb } from '@surf-sight/database';
import { UserFacingError } from '../../../errors';
import { HttpStatusCode } from '@surf-sight/core';

const authService = new AuthService(drizzleDb);

export const authPayloadResolvers: GraphqlAuthPayloadResolvers = {
  token: (parent) => parent.token,
  user: (parent) => parent.user,
};

export const authMutationResolvers: GraphqlMutationResolvers = {
  signup: async (_parent, args) => {
    if (!args.input) {
      throw new UserFacingError('Input is required', 'INVALID_INPUT', HttpStatusCode.BAD_REQUEST);
    }

    try {
      const result = await authService.signup({
        email: args.input.email,
        password: args.input.password,
        name: args.input.name || undefined,
      });

      return result;
    } catch (error) {
      throw UserFacingError.fromError(error);
    }
  },

  login: async (_parent, args) => {
    if (!args.input) {
      throw new UserFacingError('Input is required', 'INVALID_INPUT', HttpStatusCode.BAD_REQUEST);
    }

    try {
      const result = await authService.login({
        email: args.input.email,
        password: args.input.password,
      });

      return result;
    } catch (error) {
      throw UserFacingError.fromError(error);
    }
  },

  requestPasswordReset: async (_parent, args) => {
    try {
      const result = await authService.requestPasswordReset(args.email);
      return result.success;
    } catch (error) {
      throw UserFacingError.fromError(error);
    }
  },

  resetPassword: async (_parent, args) => {
    try {
      const result = await authService.resetPassword(
        args.token,
        args.newPassword
      );
      return result.success;
    } catch (error) {
      throw UserFacingError.fromError(error);
    }
  },
};
