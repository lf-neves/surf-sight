import { drizzleDb } from '@surf-sight/database';
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
import { OpenAIService } from './services/OpenAIService';

export interface User {
  userId: string;
  email: string;
}

export interface GraphQLContext {
  prisma: typeof drizzleDb; // Keep name for backward compatibility
  db: typeof drizzleDb; // New name
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
  // Initialize services with Drizzle
  const spotService = new SpotService(drizzleDb);
  const forecastService = new ForecastService(drizzleDb);
  const openAIService = new OpenAIService();
  const aiSummaryService = new AISummaryService(drizzleDb, openAIService);
  const userService = new UserService(drizzleDb);
  const favoriteSpotService = new FavoriteSpotService(drizzleDb);

  // Initialize loaders
  const forecastLoader = createForecastLoader(drizzleDb);
  const summaryLoader = createSummaryLoader(drizzleDb);

  return {
    prisma: drizzleDb, // Backward compatibility
    db: drizzleDb, // New name
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
    const reason =
      error instanceof jwt.TokenExpiredError
        ? 'expired'
        : error instanceof jwt.JsonWebTokenError
          ? (error as jwt.JsonWebTokenError).message
          : error instanceof jwt.NotBeforeError
            ? 'not_active_yet'
            : 'unknown';
    if (reason === 'expired') {
      logger.info('[AUTH] JWT expired (request continues as unauthenticated)');
    } else {
      logger.warn('[AUTH] JWT invalid or missing', { reason });
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
