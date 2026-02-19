import {
  pgTable,
  uuid,
  varchar,
  jsonb,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { jobStatusEnum } from './enums';

export const jobEvents = pgTable(
  'job_events',
  {
    jobId: uuid('job_id').primaryKey().defaultRandom(),
    type: varchar('type', { length: 100 }).notNull(),
    payload: jsonb('payload').default({}),
    status: jobStatusEnum('status').notNull().default('pending'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    statusIdx: index('job_events_status_idx').on(table.status),
    typeIdx: index('job_events_type_idx').on(table.type),
    createdAtIdx: index('job_events_created_at_idx').on(table.createdAt),
  })
);

// Export types
export type JobEvent = typeof jobEvents.$inferSelect;
export type NewJobEvent = typeof jobEvents.$inferInsert;
