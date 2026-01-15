import OpenAI from 'openai';
import { logger } from '@surf-sight/core';
import { Spot, Forecast } from '@prisma/client';

export interface AIInsights {
  skillLevel: string;
  recommendations: string[];
  risks: string[];
  rating: number;
}

export class OpenAIService {
  private client: OpenAI | null = null;
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    if (this.apiKey && this.apiKey !== '' && !this.apiKey.includes('placeholder')) {
      this.client = new OpenAI({
        apiKey: this.apiKey,
      });
      logger.info('OpenAI service initialized');
    } else {
      logger.warn(
        'OPENAI_API_KEY not set or using placeholder. AI insights generation will be disabled.'
      );
    }
  }

  isAvailable(): boolean {
    return this.client !== null;
  }

  async generateInsights(spot: Spot, forecast: Forecast): Promise<AIInsights> {
    if (!this.client) {
      throw new Error('OpenAI client is not initialized');
    }

    try {
      // Parse forecast raw data
      const rawData = typeof forecast.raw === 'string' 
        ? JSON.parse(forecast.raw) 
        : forecast.raw;

      const waveHeight = rawData.waveHeight || rawData.swellHeight || 0;
      const wavePeriod = rawData.wavePeriod || rawData.swellPeriod || 0;
      const waveDirection = rawData.waveDirection || rawData.swellDirection || 0;
      const windSpeed = rawData.windSpeed || 0;
      const windDirection = rawData.windDirection || 0;
      const waterTemp = rawData.waterTemperature || rawData.waterTemp || null;

      // Get spot metadata
      const spotMeta = spot.meta as any;
      const difficulty = spotMeta?.difficulty || 'intermediate';
      const bestSeason = spotMeta?.bestSeason || 'all year';
      const location = `${spotMeta?.city || ''} ${spotMeta?.region || ''} ${spotMeta?.country || ''}`.trim();

      const prompt = `You are an expert surf forecaster analyzing conditions for ${spot.name}${location ? ` in ${location}` : ''}.

Current Forecast Conditions:
- Wave Height: ${waveHeight.toFixed(1)}m
- Wave Period: ${wavePeriod.toFixed(1)}s
- Wave Direction: ${waveDirection}°
- Wind Speed: ${windSpeed.toFixed(1)} m/s
- Wind Direction: ${windDirection}°
${waterTemp ? `- Water Temperature: ${waterTemp.toFixed(1)}°C` : ''}
- Spot Type: ${spot.type}
- Difficulty Level: ${difficulty}
- Best Season: ${bestSeason}

Analyze these conditions and provide:
1. **Skill Level** (one word: "beginner", "intermediate", "advanced", or "expert")
2. **Rating** (1-10 integer, where 10 is perfect conditions)
3. **Recommendations** (3-5 actionable recommendations as an array of strings)
4. **Risks** (2-4 potential risks or warnings as an array of strings)

Respond ONLY with valid JSON in this exact format:
{
  "skillLevel": "intermediate",
  "rating": 7,
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
  "risks": ["Risk 1", "Risk 2"]
}`;

      logger.info('[OpenAIService] Generating insights with OpenAI', {
        spotId: spot.spotId,
        forecastId: forecast.forecastId,
        model: 'gpt-4o-mini',
      });

      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert surf forecaster. Always respond with valid JSON only, no additional text.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response content from OpenAI');
      }

      const insights = JSON.parse(content) as AIInsights;

      // Validate and normalize the response
      return {
        skillLevel: insights.skillLevel || 'intermediate',
        rating: Math.max(1, Math.min(10, Math.round(insights.rating || 5))),
        recommendations: Array.isArray(insights.recommendations)
          ? insights.recommendations
          : [],
        risks: Array.isArray(insights.risks) ? insights.risks : [],
      };
    } catch (error) {
      logger.error('[OpenAIService] Error generating insights:', error);
      throw error;
    }
  }

  async generateSummary(insights: AIInsights, spotName: string): Promise<string> {
    if (!this.client) {
      throw new Error('OpenAI client is not initialized');
    }

    try {
      const prompt = `Write a concise 2-3 sentence summary of surf conditions for ${spotName} based on these insights:

Skill Level: ${insights.skillLevel}
Rating: ${insights.rating}/10
Recommendations: ${insights.recommendations.join(', ')}
Risks: ${insights.risks.join(', ')}

Write a natural, engaging summary in Portuguese that surfers would find useful.`;

      logger.info('[OpenAIService] Generating summary with OpenAI', {
        spotName,
        model: 'gpt-4o-mini',
      });

      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a surf forecasting expert writing concise, engaging summaries in Portuguese for Brazilian surfers.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      });

      const summary = response.choices[0]?.message?.content?.trim();
      if (!summary) {
        throw new Error('No summary content from OpenAI');
      }

      return summary;
    } catch (error) {
      logger.error('[OpenAIService] Error generating summary:', error);
      throw error;
    }
  }
}
