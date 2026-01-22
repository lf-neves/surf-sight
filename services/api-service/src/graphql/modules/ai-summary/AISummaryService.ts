import { drizzleDb, aiSummaries, AISummary, Forecast, Spot } from '@surf-sight/database';
import { OpenAIService } from '../../../services/OpenAIService';
import { logger } from '@surf-sight/core';
import { eq, desc, lte, and } from 'drizzle-orm';

export interface AIInsights {
  conditions: string;
  skillLevel: string;
  recommendations: string[];
  risks: string[];
  rating: number;
}

export class AISummaryService {
  constructor(
    private db: typeof drizzleDb,
    private openAIService?: OpenAIService
  ) {}

  async getLatestSummary(
    spotId: string,
    timestamp?: Date
  ): Promise<AISummary | null> {
    const conditions: any[] = [eq(aiSummaries.spotId, spotId)];

    if (timestamp) {
      conditions.push(lte(aiSummaries.createdAt, timestamp));
    }

    const result = await this.db
      .select()
      .from(aiSummaries)
      .where(and(...conditions))
      .orderBy(desc(aiSummaries.createdAt))
      .limit(1);
    
    return result[0] || null;
  }

  async getLatestInsights(
    spotId: string,
    timestamp?: Date
  ): Promise<AIInsights | null> {
    logger.info('[AISummaryService] getLatestInsights called', {
      spotId,
      timestamp,
    });
    
    const startTime = Date.now();
    const summary = await this.getLatestSummary(spotId, timestamp);
    const duration = Date.now() - startTime;

    if (!summary) {
      logger.info('[AISummaryService] getLatestInsights result: no summary found', {
        spotId,
        duration: `${duration}ms`,
      });
      return null;
    }

    const structured = summary.structured as any;

    const insights = {
      conditions: summary.summary || '',
      skillLevel: structured.skillLevel || 'intermediate',
      recommendations: structured.recommendations || [],
      risks: structured.risks || [],
      rating: structured.rating || 0,
    };
    
    logger.info('[AISummaryService] getLatestInsights result', {
      spotId,
      found: true,
      hasRating: !!insights.rating,
      recommendationsCount: insights.recommendations.length,
      risksCount: insights.risks.length,
      duration: `${duration}ms`,
    });

    return insights;
  }

  async create(data: {
    forecastId: string;
    spotId: string;
    summary: string;
    structured?: any;
    modelInfo?: any;
  }): Promise<AISummary> {
    const result = await this.db
      .insert(aiSummaries)
      .values({
        forecastId: data.forecastId,
        spotId: data.spotId,
        summary: data.summary,
        structured: data.structured || {},
        modelInfo: data.modelInfo || {},
      })
      .returning();
    return result[0];
  }

  async findById(id: string): Promise<AISummary | null> {
    const result = await this.db
      .select()
      .from(aiSummaries)
      .where(eq(aiSummaries.aiSummaryId, id))
      .limit(1);
    return result[0] || null;
  }

  async findByForecastId(forecastId: string): Promise<AISummary[]> {
    const result = await this.db
      .select()
      .from(aiSummaries)
      .where(eq(aiSummaries.forecastId, forecastId))
      .orderBy(desc(aiSummaries.createdAt));
    return result;
  }

  async delete(id: string): Promise<AISummary> {
    const result = await this.db
      .delete(aiSummaries)
      .where(eq(aiSummaries.aiSummaryId, id))
      .returning();
    return result[0];
  }

  /**
   * Generate and save AI insights for a forecast
   */
  async generateAndSaveInsights(
    spot: Spot,
    forecast: Forecast
  ): Promise<AISummary> {
    if (!this.openAIService || !this.openAIService.isAvailable()) {
      throw new Error(
        'OpenAI service is not available. Please configure OPENAI_API_KEY.'
      );
    }

    try {
      // Generate insights using OpenAI
      const insights = await this.openAIService.generateInsights(
        spot,
        forecast
      );

      // Generate summary text
      const summary = await this.openAIService.generateSummary(
        insights,
        spot.name
      );

      // Check if summary already exists for this forecast
      const existing = await this.db
        .select()
        .from(aiSummaries)
        .where(
          and(
            eq(aiSummaries.forecastId, forecast.forecastId),
            eq(aiSummaries.spotId, spot.spotId)
          )
        )
        .limit(1);

      const structured = {
        skillLevel: insights.skillLevel,
        recommendations: insights.recommendations,
        risks: insights.risks,
        rating: insights.rating,
      };

      const modelInfo = {
        model: 'gpt-4o-mini',
        timestamp: new Date().toISOString(),
      };

      if (existing[0]) {
        // Update existing summary
        const result = await this.db
          .update(aiSummaries)
          .set({
            summary,
            structured,
            modelInfo,
          })
          .where(eq(aiSummaries.aiSummaryId, existing[0].aiSummaryId))
          .returning();
        return result[0];
      } else {
        // Create new summary
        const result = await this.db
          .insert(aiSummaries)
          .values({
            forecastId: forecast.forecastId,
            spotId: spot.spotId,
            summary,
            structured,
            modelInfo,
          })
          .returning();
        return result[0];
      }
    } catch (error) {
      logger.error('Error generating and saving AI insights:', error);
      throw error;
    }
  }

  /**
   * Generate insights for the latest forecast of a spot
   */
  async generateInsightsForLatestForecast(
    spotId: string,
    forecastService: {
      findLatestForecastForSpot: (spotId: string) => Promise<Forecast | null>;
    },
    spotService: { findById: (id: string) => Promise<Spot | null> }
  ): Promise<AISummary> {
    const spot = await spotService.findById(spotId);
    if (!spot) {
      throw new Error('Spot not found');
    }

    const forecast = await forecastService.findLatestForecastForSpot(spotId);
    if (!forecast) {
      throw new Error('No forecast found for this spot');
    }

    return this.generateAndSaveInsights(spot, forecast);
  }
}
