import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeTypeDefs } from "@graphql-tools/merge";
import { makeExecutableSchema } from "@graphql-tools/schema";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load all typeDefs
const typeDefsArray = loadFilesSync(
  path.join(__dirname, "modules/**/typeDefs.graphql")
);

// Merge type definitions
const typeDefs = mergeTypeDefs(typeDefsArray);

// Import resolver modules
import {
  spotResolvers,
  spotQueryResolvers,
  spotMutationResolvers,
} from "./modules/spot/resolvers";
import {
  forecastResolvers,
  forecastQueryResolvers,
  forecastMutationResolvers,
  forecastSubscriptionResolvers,
} from "./modules/forecast/resolvers";
import {
  aiResolvers,
  aiQueryResolvers,
  aiMutationResolvers,
} from "./modules/ai-summary/resolvers";
import {
  userResolvers,
  userQueryResolvers,
  userMutationResolvers,
} from "./modules/user/resolvers";
import {
  favoriteResolvers,
  favoriteQueryResolvers,
  favoriteMutationResolvers,
  favoriteSubscriptionResolvers,
} from "./modules/favorite-spot/resolvers";

// Import scalar resolvers
import { DateTimeScalar, JSONScalar } from "./scalars";

// Merge resolvers
const resolvers = {
  DateTime: DateTimeScalar,
  JSON: JSONScalar,
  Query: {
    ...userQueryResolvers,
    ...spotQueryResolvers,
    ...forecastQueryResolvers,
    ...aiQueryResolvers,
    ...favoriteQueryResolvers,
  },
  Mutation: {
    ...userMutationResolvers,
    ...spotMutationResolvers,
    ...forecastMutationResolvers,
    ...aiMutationResolvers,
    ...favoriteMutationResolvers,
  },
  Subscription: {
    ...forecastSubscriptionResolvers,
    ...favoriteSubscriptionResolvers,
  },
  Spot: spotResolvers,
  Forecast: forecastResolvers,
  AISummary: aiResolvers,
  User: userResolvers,
  FavoriteSpot: favoriteResolvers,
};

// Create executable schema
export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
