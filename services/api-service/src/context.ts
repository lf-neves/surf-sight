import { prisma } from "@surf-sight/database";
import { PubSub } from "graphql-subscriptions";
import { SpotService } from "./graphql/modules/spot/SpotService";
import { ForecastService } from "./graphql/modules/forecast/ForecastService";
import { AISummaryService } from "./graphql/modules/ai-summary/AISummaryService";
import { UserService } from "./graphql/modules/user/UserService";
import { FavoriteSpotService } from "./graphql/modules/favorite-spot/FavoriteSpotService";
import { createForecastLoader } from "./loaders/forecastLoader";
import { createSummaryLoader } from "./loaders/summaryLoader";
import { pubsub } from "./pubsub";

export interface User {
  userId: string;
  email: string;
}

export interface GraphQLContext {
  prisma: typeof prisma;
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
  const spotService = new SpotService(prisma);
  const forecastService = new ForecastService(prisma);
  const aiSummaryService = new AISummaryService(prisma);
  const userService = new UserService(prisma);
  const favoriteSpotService = new FavoriteSpotService(prisma);

  // Initialize loaders
  const forecastLoader = createForecastLoader(prisma);
  const summaryLoader = createSummaryLoader(prisma);

  return {
    prisma,
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
  // TODO: Implement JWT decoding
  // For now, return null (no auth)
  const authHeader = headers.authorization || headers.Authorization;

  if (!authHeader || typeof authHeader !== "string") {
    return null;
  }

  // Simple token extraction (Bearer token)
  const token = authHeader.replace("Bearer ", "");

  if (!token) {
    return null;
  }

  // TODO: Decode JWT and extract user
  // For now, return null
  return null;
}
