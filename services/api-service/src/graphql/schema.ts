import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { makeExecutableSchema } from '@graphql-tools/schema';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Explicitly define scalars to ensure they're always included
const scalarDefinitions = `
  scalar DateTime
  scalar JSON
`;

// Load all typeDefs
// GraphQL files are included in package via serverless.yaml patterns
// Try multiple paths to find GraphQL files in different environments
const possiblePaths = [
  // Bundled location (when code is bundled by ESBuild)
  path.join(__dirname, 'modules/**/typeDefs.graphql'),
  // Source location (development)
  path.join(process.cwd(), 'src/graphql/modules/**/typeDefs.graphql'),
  // Lambda package location (relative to handler)
  path.join(process.cwd(), 'graphql/modules/**/typeDefs.graphql'),
  // Alternative bundled location
  path.resolve(__dirname, '../graphql/modules/**/typeDefs.graphql'),
];

let typeDefsArray: any[] = [];
let loaded = false;

for (const graphqlPath of possiblePaths) {
  try {
    const loadedFiles = loadFilesSync(graphqlPath);
    if (loadedFiles && loadedFiles.length > 0) {
      typeDefsArray = loadedFiles;
      loaded = true;
      console.log(
        `✅ Loaded ${loadedFiles.length} GraphQL typeDef files from: ${graphqlPath}`
      );
      break;
    }
  } catch (error) {
    // Try next path
    continue;
  }
}

if (!loaded) {
  console.error('❌ Failed to load GraphQL typeDefs from all attempted paths:');
  possiblePaths.forEach((p) => console.error(`  - ${p}`));
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
