import { pgTable, uuid, text, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import { forecasts } from './Forecast';
import { spots } from './Spot';

export const aiSummaries = pgTable(
  'ai_summaries',
  {
    aiSummaryId: uuid('ai_summary_id').primaryKey().defaultRandom(),
    forecastId: uuid('forecast_id')
      .notNull()
      .references(() => forecasts.forecastId, { onDelete: 'cascade' }),
    spotId: uuid('spot_id')
      .notNull()
      .references(() => spots.spotId, { onDelete: 'cascade' }),
    summary: text('summary').notNull(),
    structured: jsonb('structured').default({}),
    modelInfo: jsonb('model_info').default({}),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => ({
    spotIdIdx: index('ai_summaries_spot_id_idx').on(table.spotId),
    forecastIdIdx: index('ai_summaries_forecast_id_idx').on(table.forecastId),
    createdAtIdx: index('ai_summaries_created_at_idx').on(table.createdAt),
  })
);

// Export types
export type AISummary = typeof aiSummaries.$inferSelect;
export type NewAISummary = typeof aiSummaries.$inferInsert;
