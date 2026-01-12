import { prismaClient } from '@surf-sight/database';
import { PubSub } from 'graphql-subscriptions';
import jwt from 'jsonwebtoken';
import { logger } from '@surf-sight/core';
import { SpotService } from './graphql/modules/spot/SpotService';
import { ForecastService } from './graphql/modules/forecast/ForecastService';
import { AISummaryService } from './graphql/modules/ai-summary/AISummaryService';
import { UserService } from './graphql/modules/user/UserService';
import { FavoriteSpotService } from './graphql/modules/favorite-spot/FavoriteSpotService';
import { createForecastLoader } from './loaders/forecastLoader';
import { createSummaryLoader } from './loaders/summaryLoader';
import { pubsub } from './pubsub';
import { env } from './env';

export interface User {
  userId: string;
  email: string;
}

export interface GraphQLContext {
  prisma: typeof prismaClient;
  services: {
    spotService: SpotService;
    forecastService: ForecastService;
    aiSummaryService: AISummaryService;
    userService: UserService;
    favoriteSpotService: FavoriteSpotService;
  };
  loaders: {
    forecastLoader: ReturnType<typeof createForecastLoader>;
    summaryLoader: ReturnType<typeof createSummaryLoader>;
  };
  pubsub: PubSub;
  user: User | null;
}

export function createContext(user: User | null = null): GraphQLContext {
  // Initialize services
  const spotService = new SpotService(prismaClient);
  const forecastService = new ForecastService(prismaClient);
  const aiSummaryService = new AISummaryService(prismaClient);
  const userService = new UserService(prismaClient);
  const favoriteSpotService = new FavoriteSpotService(prismaClient);

  // Initialize loaders
  const forecastLoader = createForecastLoader(prismaClient);
  const summaryLoader = createSummaryLoader(prismaClient);

  return {
    prisma: prismaClient,
    services: {
      spotService,
      forecastService,
      aiSummaryService,
      userService,
      favoriteSpotService,
    },
    loaders: {
      forecastLoader,
      summaryLoader,
    },
    pubsub,
    user,
  };
}

// Helper function to extract user from request headers
export function getUserFromRequest(
  headers: Record<string, string | string[] | undefined>
): User | null {
  const authHeader = headers.authorization || headers.Authorization;

  if (!authHeader || typeof authHeader !== 'string') {
    return null;
  }

  // Extract Bearer token
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    return null;
  }

  // If JWT_SECRET is not set, skip verification (for development)
  if (!env.jwtSecret) {
    logger.warn('JWT_SECRET not set, skipping JWT verification');
    return null;
  }

  try {
    // Verify and decode JWT token
    const decoded = jwt.verify(token, env.jwtSecret) as jwt.JwtPayload;

    // Extract user information from token payload
    // Expected payload structure: { userId: string, email: string, ... }
    if (!decoded.userId || !decoded.email) {
      logger.warn('JWT token missing required fields (userId, email)');
      return null;
    }

    return {
      userId: decoded.userId as string,
      email: decoded.email as string,
    };
  } catch (error) {
    // Handle JWT verification errors
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid JWT token:', error.message);
    } else if (error instanceof jwt.TokenExpiredError) {
      logger.warn('JWT token expired');
    } else if (error instanceof jwt.NotBeforeError) {
      logger.warn('JWT token not active yet');
    } else {
      logger.error('Error verifying JWT token:', error);
    }
    return null;
  }
}

/**
 * Gets the authenticated user from the context
 * Throws an error if user is not authenticated
 */
export function getAuthenticatedUser(context: GraphQLContext): User {
  if (!context.user) {
    throw new Error('Authentication required');
  }
  return context.user;
}
