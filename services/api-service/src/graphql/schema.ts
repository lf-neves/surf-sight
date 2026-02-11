import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { makeExecutableSchema } from '@graphql-tools/schema';
import path from 'path';
import { logger } from '@surf-sight/core';

const scalarDefinitions = `
  scalar DateTime
  scalar JSON
`;

// Load all typeDefs
// GraphQL files are included in package via serverless.yaml patterns
// Try multiple paths to find GraphQL files in different environments
logger.info('Loading GraphQL typeDefs...');
logger.info(`Current working directory: ${process.cwd()}`);
logger.info(`__dirname: ${__dirname}`);

const possiblePaths = [
  // Lambda package location (most likely in production)
  // In Lambda, process.cwd() is /var/task, and files are at src/graphql/modules/
  path.join(process.cwd(), 'src/graphql/modules/**/typeDefs.graphql'),
  // Alternative Lambda location
  path.join(process.cwd(), 'graphql/modules/**/typeDefs.graphql'),
  // Bundled location (when code is bundled by ESBuild)
  path.join(__dirname, 'modules/**/typeDefs.graphql'),
  // Alternative bundled location
  path.resolve(__dirname, '../graphql/modules/**/typeDefs.graphql'),
  // Development location
  path.resolve(process.cwd(), 'src/graphql/modules/**/typeDefs.graphql'),
];

let typeDefsArray: any[] = [];
let loaded = false;

for (const graphqlPath of possiblePaths) {
  try {
    logger.info(`Attempting to load from: ${graphqlPath}`);
    const loadedFiles = loadFilesSync(graphqlPath);
    if (loadedFiles && loadedFiles.length > 0) {
      typeDefsArray = loadedFiles;
      loaded = true;
      logger.info(
        `✅ Loaded ${loadedFiles.length} GraphQL typeDef files from: ${graphqlPath}`
      );
      break;
    }
  } catch (error) {
    logger.warn(`Failed to load from ${graphqlPath}:`, error);
    // Try next path
    continue;
  }
}

if (!loaded) {
  logger.error('❌ Failed to load GraphQL typeDefs from all attempted paths:');
  possiblePaths.forEach((p) => logger.error(`  - ${p}`));
  throw new Error(
    'Could not load GraphQL typeDef files. Check that GraphQL files are included in the package.'
  );
}

// Merge type definitions (include scalars first)
const typeDefs = mergeTypeDefs([scalarDefinitions, ...typeDefsArray]);

// Import resolver modules
import {
  spotResolvers,
  spotQueryResolvers,
  spotMutationResolvers,
} from './modules/spot/resolvers';
import {
  forecastResolvers,
  forecastQueryResolvers,
  forecastMutationResolvers,
  forecastSubscriptionResolvers,
} from './modules/forecast/resolvers';
import {
  aiResolvers,
  aiQueryResolvers,
  aiMutationResolvers,
} from './modules/ai-summary/resolvers';
import {
  userResolvers,
  userQueryResolvers,
  userMutationResolvers,
} from './modules/user/resolvers';
import {
  favoriteResolvers,
  favoriteQueryResolvers,
  favoriteMutationResolvers,
  favoriteSubscriptionResolvers,
} from './modules/favorite-spot/resolvers';
import { tidePointResolvers, tideQueryResolvers } from './modules/tide/resolvers';
import { healthQueryResolvers } from './modules/health/resolvers';
import {
  authPayloadResolvers,
  authMutationResolvers,
} from './modules/auth/resolvers';

// Import scalar resolvers
import { DateTimeScalar, JSONScalar } from './scalars';

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
    ...tideQueryResolvers,
    ...healthQueryResolvers,
  },
  Mutation: {
    ...userMutationResolvers,
    ...spotMutationResolvers,
    ...forecastMutationResolvers,
    ...aiMutationResolvers,
    ...favoriteMutationResolvers,
    ...authMutationResolvers,
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
  TidePoint: tidePointResolvers,
  AuthPayload: authPayloadResolvers,
};

// Create executable schema
export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
