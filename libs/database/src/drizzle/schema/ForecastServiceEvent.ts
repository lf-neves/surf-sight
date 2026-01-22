import { pgTable, uuid, varchar, jsonb, integer, timestamp, text, index } from 'drizzle-orm/pg-core';
import { jobStatusEnum } from './enums';

export const forecastServiceEvents = pgTable(
  'forecast_service_events',
  {
    forecastServiceEventId: uuid('forecast_service_event_id').primaryKey().defaultRandom(),
    eventType: varchar('event_type', { length: 100 }).notNull(),
    payload: jsonb('payload').notNull(),
    processingStatus: jobStatusEnum('processing_status').notNull().default('pending'),
    retries: integer('retries').notNull().default(0),
    enqueuerAwsRequestId: text('enqueuer_aws_request_id'),
    processorAwsRequestIds: text('processor_aws_request_ids').array().default([]),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => ({
    processingStatusIdx: index('forecast_service_events_processing_status_idx').on(table.processingStatus),
    eventTypeIdx: index('forecast_service_events_event_type_idx').on(table.eventType),
    createdAtIdx: index('forecast_service_events_created_at_idx').on(table.createdAt),
  })
);

// Export types
export type ForecastServiceEvent = typeof forecastServiceEvents.$inferSelect;
export type NewForecastServiceEvent = typeof forecastServiceEvents.$inferInsert;
