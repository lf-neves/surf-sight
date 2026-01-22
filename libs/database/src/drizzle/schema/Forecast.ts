import { pgTable, uuid, timestamp, jsonb, varchar, unique, index } from 'drizzle-orm/pg-core';
import { spots } from './Spot';

export const forecasts = pgTable(
  'forecasts',
  {
    forecastId: uuid('forecast_id').primaryKey().defaultRandom(),
    spotId: uuid('spot_id')
      .notNull()
      .references(() => spots.spotId, { onDelete: 'cascade' }),
    timestamp: timestamp('timestamp').notNull(),
    raw: jsonb('raw').notNull().default({}),
    source: varchar('source', { length: 50 }).notNull().default('stormglass'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => ({
    spotTimestampUnique: unique('forecasts_spot_id_timestamp_key').on(table.spotId, table.timestamp),
    spotIdIdx: index('forecasts_spot_id_idx').on(table.spotId),
    timestampIdx: index('forecasts_timestamp_idx').on(table.timestamp),
  })
);

// Export types
export type Forecast = typeof forecasts.$inferSelect;
export type NewForecast = typeof forecasts.$inferInsert;
