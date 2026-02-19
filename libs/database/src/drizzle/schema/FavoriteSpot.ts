import {
  pgTable,
  uuid,
  boolean,
  timestamp,
  primaryKey,
  index,
} from 'drizzle-orm/pg-core';
import { users } from './User';
import { spots } from './Spot';

export const favoriteSpots = pgTable(
  'favorite_spots',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.userId, { onDelete: 'cascade' }),
    spotId: uuid('spot_id')
      .notNull()
      .references(() => spots.spotId, { onDelete: 'cascade' }),
    notifyWhatsapp: boolean('notify_whatsapp').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.spotId] }),
    userIdIdx: index('favorite_spots_user_id_idx').on(table.userId),
    spotIdIdx: index('favorite_spots_spot_id_idx').on(table.spotId),
  })
);

// Export types
export type FavoriteSpot = typeof favoriteSpots.$inferSelect;
export type NewFavoriteSpot = typeof favoriteSpots.$inferInsert;
