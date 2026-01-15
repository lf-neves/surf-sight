import { PrismaClient, AISummary, Forecast, Spot } from '@prisma/client';
import { OpenAIService } from '../../../services/OpenAIService';
import { logger } from '@surf-sight/core';

export interface AIInsights {
  conditions: string;
  skillLevel: string;
  recommendations: string[];
  risks: string[];
  rating: number;
}

export class AISummaryService {
  constructor(
    private prisma: PrismaClient,
    private openAIService?: OpenAIService
  ) {}

  async getLatestSummary(
    spotId: string,
    timestamp?: Date
  ): Promise<AISummary | null> {
    const where: any = { spotId };

    if (timestamp) {
      where.createdAt = {
        lte: timestamp,
      };
    }

    return this.prisma.aISummary.findFirst({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
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
    return this.prisma.aISummary.create({
      data: {
        ...data,
        structured: data.structured || {},
        modelInfo: data.modelInfo || {},
      },
    });
  }

  async findById(id: string): Promise<AISummary | null> {
    return this.prisma.aISummary.findUnique({
      where: {
        aiSummaryId: id,
      },
    });
  }

  async delete(id: string): Promise<AISummary> {
    return this.prisma.aISummary.delete({
      where: {
        aiSummaryId: id,
      },
    });
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
      const existing = await this.prisma.aISummary.findFirst({
        where: {
          forecastId: forecast.forecastId,
          spotId: spot.spotId,
        },
      });

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

      if (existing) {
        // Update existing summary
        return this.prisma.aISummary.update({
          where: {
            aiSummaryId: existing.aiSummaryId,
          },
          data: {
            summary,
            structured,
            modelInfo,
          },
        });
      } else {
        // Create new summary
        return this.prisma.aISummary.create({
          data: {
            forecastId: forecast.forecastId,
            spotId: spot.spotId,
            summary,
            structured,
            modelInfo,
          },
        });
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
