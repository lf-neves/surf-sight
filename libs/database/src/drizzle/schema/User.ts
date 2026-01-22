import { pgTable, uuid, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { userSkillLevelEnum } from './enums';
import { favoriteSpots } from './FavoriteSpot';

export const users = pgTable(
  'users',
  {
    userId: uuid('user_id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(), // Hashed password
    name: varchar('name', { length: 255 }),
    phone: varchar('phone', { length: 50 }),
    skillLevel: userSkillLevelEnum('skill_level'),
    resetToken: varchar('reset_token', { length: 255 }),
    resetTokenExpiry: timestamp('reset_token_expiry'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => ({
    emailIdx: index('users_email_idx').on(table.email),
  })
);

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
