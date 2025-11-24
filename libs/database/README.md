# @surf-sight/database

Prisma database package for SurfSight. Contains the database schema, migrations, and Prisma client.

## Structure

The Prisma schema uses Prisma's native multi-file schema support for better organization:

```
prisma/
├── schema/
│   ├── schema.prisma      # Generator and datasource configuration
│   ├── User.prisma        # User model with UserSkillLevel enum
│   ├── Spot.prisma        # Spot model with SpotType enum
│   ├── Forecast.prisma    # Forecast model
│   ├── AISummary.prisma   # AI Summary model
│   ├── FavoriteSpot.prisma # Favorite model
│   └── JobEvent.prisma    # Job model with JobStatus enum
├── migrations/            # Database migrations
└── seed.ts               # Database seed file
```

**Important:** 
- Edit the individual model files directly (e.g., `schema/User.prisma`)
- `schema.prisma` contains only the generator and datasource configuration
- Prisma automatically merges all `.prisma` files in the `schema/` directory

## Usage

```typescript
import { prisma } from '@surf-sight/database';

// Use Prisma client
const spots = await prisma.spot.findMany();
```

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Generate Prisma Client:
```bash
pnpm db:generate
```

3. Run migrations:
```bash
pnpm db:migrate
```

4. (Optional) Seed the database:
```bash
pnpm db:seed
```

## Scripts

- `db:push` - Push schema changes to database (development)
- `db:migrate` - Create and apply migrations
- `db:studio` - Open Prisma Studio
- `db:seed` - Seed the database with example data
- `db:generate` - Generate Prisma Client
- `db:format` - Format Prisma schema files

## Models

- **User** - User accounts with skill levels (UserSkillLevel enum)
- **Spot** - Surf spots with location data (SpotType enum)
- **Forecast** - Raw forecast data from marine APIs
- **AISummary** - LLM-generated summaries and insights
- **FavoriteSpot** - User favorite spots (composite key)
- **JobEvent** - Background job tracking (JobStatus enum)

## Editing the Schema

1. Edit the appropriate model file in `prisma/schema/` (e.g., `User.prisma`, `Spot.prisma`)
2. Run `pnpm db:migrate` to create and apply a migration

## Environment Variables

Set `DATABASE_URL` in your `.env` file:

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/surf-app?schema=public"
```

