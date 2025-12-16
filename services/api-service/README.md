# @surf-sight/api-service

GraphQL API service for SurfSight using Apollo Server with subscriptions support.

## Features

- 🚀 Apollo Server v5 with AWS Lambda
- 📡 GraphQL subscriptions via graphql-ws
- 🔄 DataLoader for efficient data fetching
- 📦 Service layer pattern
- 🧩 Co-located typeDefs and resolvers
- 🔧 GraphQL Code Generator for type safety
- 🔌 In-memory PubSub (easily replaceable with Redis)

## Structure

```
src/
├── index.ts                    # Entry point
├── server.ts                   # Apollo Server setup
├── context.ts                  # GraphQL context with services and loaders
├── env.ts                      # Environment variables
├── graphql/
│   ├── modules/               # Co-located GraphQL modules
│   │   ├── spot/
│   │   │   ├── typeDefs.graphql
│   │   │   ├── resolvers.ts
│   │   │   └── SpotService.ts
│   │   ├── forecast/
│   │   │   ├── typeDefs.graphql
│   │   │   ├── resolvers.ts
│   │   │   └── ForecastService.ts
│   │   ├── ai-summary/
│   │   │   ├── typeDefs.graphql
│   │   │   ├── resolvers.ts
│   │   │   └── AISummaryService.ts
│   │   ├── user/
│   │   │   ├── typeDefs.graphql
│   │   │   ├── resolvers.ts
│   │   │   └── UserService.ts
│   │   ├── favorite-spot/
│   │   │   ├── typeDefs.graphql
│   │   │   ├── resolvers.ts
│   │   │   └── FavoriteSpotService.ts
│   │   └── subscription/
│   ├── schema.ts              # Merged schema
│   ├── scalars.ts             # Custom scalar types
│   └── generated/
│       └── types.ts           # Generated TypeScript types (run codegen)
├── loaders/                   # DataLoader instances
│   ├── forecastLoader.ts
│   └── summaryLoader.ts
└── pubsub/
    └── index.ts               # PubSub implementation
```

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Generate GraphQL types:
```bash
pnpm codegen
```

3. Create `.env` file (copy from `.env.example`):
```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/surf-app?schema=public
JWT_SECRET=your-secret-key-here
PORT=4000
```

4. Start the server:
```bash
pnpm dev
```

The server will be available at:
- HTTP: `http://localhost:4000/graphql`
- WebSocket: `ws://localhost:4000/graphql`

## Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm codegen` - Generate GraphQL types
- `pnpm codegen:watch` - Watch mode for codegen

## GraphQL Code Generator

The project uses GraphQL Code Generator to generate TypeScript types from your GraphQL schema. All types are prefixed with `Graphql` (e.g., `GraphqlUser`, `GraphqlSpot`).

### Configuration

See `codegen.yml` for configuration details. The generator:
- Loads all `.graphql` files from `src/graphql/modules/**`
- Generates types to `src/graphql/generated/types.ts`
- Maps Prisma models to GraphQL types
- Uses resolver types with proper context typing

## Adding a New Module

1. Create a new folder in `src/graphql/modules/`
2. Add `typeDefs.graphql` with your schema
3. Add `resolvers.ts` with typed resolvers:
   ```typescript
   import { GraphqlYourTypeResolvers } from '../../generated/types';
   
   export const yourTypeResolvers: GraphqlYourTypeResolvers = {
     // your resolvers
   };
   ```
4. Update `src/graphql/schema.ts` to import and merge your resolvers
5. Run `pnpm codegen` to generate types

## Services

Services are co-located with their GraphQL modules and contain business logic that interacts with Prisma:

```typescript
import { SpotService } from './graphql/modules/spot/SpotService';
import { AISummaryService } from './graphql/modules/ai-summary/AISummaryService';
import { FavoriteSpotService } from './graphql/modules/favorite-spot/FavoriteSpotService';

const spotService = new SpotService(prisma);
const spots = await spotService.findAll();
```

Each module contains:
- `typeDefs.graphql` - GraphQL schema definitions
- `resolvers.ts` - GraphQL resolvers with type safety
- `*Service.ts` - Business logic layer (co-located with descriptive names)

Module naming follows a descriptive pattern:
- `spot` - Spot module
- `forecast` - Forecast module
- `ai-summary` - AI Summary module (was `ai`)
- `user` - User module
- `favorite-spot` - Favorite Spot module (was `favorite`)

## DataLoaders

DataLoaders batch and cache database queries:

```typescript
// In a resolver
const forecasts = await context.loaders.forecastLoader.load({
  spotId: parent.spotId,
  hours: 24,
});
```

## PubSub

The PubSub implementation is currently in-memory but designed to be easily replaceable:

```typescript
// Current: In-memory PubSub
import { pubsub } from './pubsub';

// Later: Swap for Redis
// import { pubsub } from './pubsub/redis';
```

## Authentication

Authentication is handled via JWT tokens in the `Authorization` header. The `getUserFromRequest` function in `context.ts` extracts the user. Currently, it's a placeholder - implement JWT decoding based on your auth provider.

## Subscriptions

Subscriptions use graphql-ws WebSocket protocol. The WebSocket server is set up at `/graphql` and shares the same schema and context as the HTTP server.

Example subscription:
```graphql
subscription {
  forecastUpdated(spotId: "spot-id") {
    id
    timestamp
    raw
  }
}
```

