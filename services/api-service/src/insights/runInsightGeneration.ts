import { drizzleDb } from '@surf-sight/database';
import { logger } from '@surf-sight/core';
import { SpotService } from '../graphql/modules/spot/SpotService';
import { ForecastService } from '../graphql/modules/forecast/ForecastService';
import { AISummaryService } from '../graphql/modules/ai-summary/AISummaryService';
import { OpenAIService } from '../services/OpenAIService';

/**
 * Generate and save AI insights for a spot's latest forecast.
 * Used by insights-service (agents) and by scripts/GraphQL.
 */
export async function runInsightGeneration(spotId: string): Promise<void> {
  const spotService = new SpotService(drizzleDb);
  const forecastService = new ForecastService(drizzleDb);
  const openAIService = new OpenAIService();
  const aiSummaryService = new AISummaryService(drizzleDb, openAIService);

  const spot = await spotService.findById(spotId);
  if (!spot) {
    logger.warn('[runInsightGeneration] Spot not found', { spotId });
    return;
  }

  const forecast = await forecastService.findLatestForecastForSpot(spotId);
  if (!forecast) {
    logger.warn('[runInsightGeneration] No forecast found for spot', { spotId });
    return;
  }

  if (!openAIService.isAvailable()) {
    logger.warn('[runInsightGeneration] OpenAI not available, skipping', { spotId });
    return;
  }

  await aiSummaryService.generateAndSaveInsights(spot, forecast);
  logger.info('[runInsightGeneration] Generated and saved AI insights', {
    spotId,
    forecastId: forecast.forecastId,
  });
}
