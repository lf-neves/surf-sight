#!/usr/bin/env tsx

/**
 * Script to generate AI insights for a specific spot
 *
 * Usage:
 *   pnpm tsx src/scripts/generate-ai-insights.ts <spotId>
 *
 * Example:
 *   pnpm tsx src/scripts/generate-ai-insights.ts 97822015-fe55-4d22-b067-f5ff59caa3ea
 */

// Load environment variables from .env file FIRST, before other imports
import { config } from 'dotenv';
import { resolve } from 'path';

// Try to load .env from multiple possible locations
const envPaths = [
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), '..', '.env'),
  resolve(process.cwd(), '..', '..', '.env'),
  resolve(process.cwd(), 'services', 'api-service', '.env'),
];

let envLoaded = false;
for (const envPath of envPaths) {
  try {
    const result = config({ path: envPath });
    if (!result.error) {
      envLoaded = true;
      console.log(`✓ Loaded .env from: ${envPath}`);
      break;
    }
  } catch {
    // Continue to next path
  }
}

if (!envLoaded) {
  console.warn(
    '⚠ No .env file found. Make sure OPENAI_API_KEY is set in your environment.'
  );
} else {
  // Verify OPENAI_API_KEY is loaded
  if (
    !process.env.OPENAI_API_KEY ||
    process.env.OPENAI_API_KEY.includes('placeholder')
  ) {
    console.warn(
      '⚠ OPENAI_API_KEY not found in .env file or is a placeholder.'
    );
    console.log(
      'Current value:',
      process.env.OPENAI_API_KEY ? 'Set (hidden)' : 'Not set'
    );
  } else {
    console.log('✓ OPENAI_API_KEY is set');
  }
}

import { drizzleDb } from '@surf-sight/database';
import { logger } from '@surf-sight/core';
import { SpotService } from '../graphql/modules/spot/SpotService';
import { ForecastService } from '../graphql/modules/forecast/ForecastService';
import { AISummaryService } from '../graphql/modules/ai-summary/AISummaryService';
import { OpenAIService } from '../services/OpenAIService';

async function generateAIInsights(spotId: string) {
  try {
    logger.info('Starting AI insights generation', { spotId });

    // Initialize services
    const spotService = new SpotService(drizzleDb);
    const forecastService = new ForecastService(drizzleDb);

    // Initialize OpenAI service
    const openAIService = new OpenAIService();
    if (!openAIService.isAvailable()) {
      logger.error(
        'OpenAI service is not available. Please configure OPENAI_API_KEY in your .env file.'
      );
      logger.info(
        'Current OPENAI_API_KEY:',
        process.env.OPENAI_API_KEY ? 'Set (hidden)' : 'Not set'
      );
      process.exit(1);
    }

    const aiSummaryService = new AISummaryService(drizzleDb, openAIService);

    // Verify spot exists
    const spot = await spotService.findById(spotId);
    if (!spot) {
      logger.error('Spot not found', { spotId });
      process.exit(1);
    }

    logger.info('Spot found', {
      spotId: spot.spotId,
      name: spot.name,
    });

    // Get latest forecast
    const forecast = await forecastService.findLatestForecastForSpot(spotId);
    if (!forecast) {
      logger.error('No forecast found for this spot', { spotId });
      process.exit(1);
    }

    logger.info('Forecast found', {
      forecastId: forecast.forecastId,
      timestamp: forecast.timestamp,
    });

    // Generate insights
    logger.info('Generating AI insights...');
    const summary = await aiSummaryService.generateInsightsForLatestForecast(
      spotId,
      forecastService,
      spotService
    );

    logger.info('✅ AI insights generated successfully!', {
      summaryId: summary.aiSummaryId,
      spotId: summary.spotId,
      forecastId: summary.forecastId,
      createdAt: summary.createdAt,
    });

    // Display the insights
    const structured = summary.structured as {
      skillLevel?: string;
      rating?: number;
      recommendations?: string[];
      risks?: string[];
    };
    console.log('\n📊 Generated AI Insights:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Summary: ${summary.summary.substring(0, 200)}...`);
    console.log(`Skill Level: ${structured.skillLevel || 'N/A'}`);
    console.log(`Rating: ${structured.rating || 0}/10`);
    console.log(
      `Recommendations: ${structured.recommendations?.length || 0} items`
    );
    console.log(`Risks: ${structured.risks?.length || 0} items`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Drizzle uses connection pooling, no need to disconnect
    logger.info('Script completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error generating AI insights:', error);
    process.exit(1);
  }
}

// Get spot ID from command line arguments
const spotId = process.argv[2];

if (!spotId) {
  logger.error('Please provide a spot ID as an argument');
  logger.info('Usage: pnpm tsx scripts/generate-ai-insights.ts <spotId>');
  logger.info(
    'Example: pnpm tsx scripts/generate-ai-insights.ts 97822015-fe55-4d22-b067-f5ff59caa3ea'
  );
  process.exit(1);
}

// Run the script
generateAIInsights(spotId).catch((error) => {
  logger.error('Unhandled error:', error);
  process.exit(1);
});
