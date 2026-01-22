// Export all schemas
export * from './enums';
export * from './User';
export * from './Spot';
export * from './Forecast';
export * from './AISummary';
export * from './FavoriteSpot';
export * from './JobEvent';
export * from './ForecastServiceEvent';

// Export relations (for Drizzle relational queries)
import { relations } from 'drizzle-orm';
import { users } from './User';
import { spots } from './Spot';
import { forecasts } from './Forecast';
import { aiSummaries } from './AISummary';
import { favoriteSpots } from './FavoriteSpot';

export const usersRelations = relations(users, ({ many }) => ({
  favorites: many(favoriteSpots),
}));

export const spotsRelations = relations(spots, ({ many }) => ({
  forecasts: many(forecasts),
  summaries: many(aiSummaries),
  favorites: many(favoriteSpots),
}));

export const forecastsRelations = relations(forecasts, ({ one, many }) => ({
  spot: one(spots, {
    fields: [forecasts.spotId],
    references: [spots.spotId],
  }),
  summaries: many(aiSummaries),
}));

export const aiSummariesRelations = relations(aiSummaries, ({ one }) => ({
  forecast: one(forecasts, {
    fields: [aiSummaries.forecastId],
    references: [forecasts.forecastId],
  }),
  spot: one(spots, {
    fields: [aiSummaries.spotId],
    references: [spots.spotId],
  }),
}));

export const favoriteSpotsRelations = relations(favoriteSpots, ({ one }) => ({
  user: one(users, {
    fields: [favoriteSpots.userId],
    references: [users.userId],
  }),
  spot: one(spots, {
    fields: [favoriteSpots.spotId],
    references: [spots.spotId],
  }),
}));
