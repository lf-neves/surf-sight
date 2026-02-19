import {
  pgTable,
  uuid,
  varchar,
  doublePrecision,
  jsonb,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { spotTypeEnum } from './enums';

export const spots = pgTable(
  'spots',
  {
    spotId: uuid('spot_id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    lat: doublePrecision('lat').notNull(),
    lon: doublePrecision('lon').notNull(),
    type: spotTypeEnum('type').notNull(),
    meta: jsonb('meta').default({}),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    slugIdx: index('spots_slug_idx').on(table.slug),
    locationIdx: index('spots_location_idx').on(table.lat, table.lon),
  })
);

// Export types
export type Spot = typeof spots.$inferSelect;
export type NewSpot = typeof spots.$inferInsert;
