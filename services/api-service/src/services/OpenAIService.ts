import OpenAI from 'openai';
import { logger } from '@surf-sight/core';
import { Spot, Forecast } from '@surf-sight/database';

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

      const prompt = `Você é um especialista em previsão de surf analisando condições para ${spot.name}${location ? ` em ${location}` : ''}.

Condições Atuais da Previsão:
- Altura da Onda: ${waveHeight.toFixed(1)}m
- Período da Onda: ${wavePeriod.toFixed(1)}s
- Direção da Onda: ${waveDirection}°
- Velocidade do Vento: ${windSpeed.toFixed(1)} m/s
- Direção do Vento: ${windDirection}°
${waterTemp ? `- Temperatura da Água: ${waterTemp.toFixed(1)}°C` : ''}
- Tipo de Pico: ${spot.type}
- Nível de Dificuldade: ${difficulty}
- Melhor Estação: ${bestSeason}

Analise essas condições e forneça:
1. **Nível de Habilidade** (uma palavra: "iniciante", "intermediário", "avançado", ou "expert")
2. **Avaliação** (número inteiro de 1-10, onde 10 são condições perfeitas)
3. **Recomendações** (3-5 recomendações acionáveis como array de strings em português)
4. **Riscos** (2-4 riscos potenciais ou avisos como array de strings em português)

Responda APENAS com JSON válido neste formato exato:
{
  "skillLevel": "intermediário",
  "rating": 7,
  "recommendations": ["Recomendação 1", "Recomendação 2", "Recomendação 3"],
  "risks": ["Risco 1", "Risco 2"]
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
              'Você é um especialista em previsão de surf. Sempre responda APENAS com JSON válido em português brasileiro, sem texto adicional. Todas as strings devem estar em português.',
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
      // Map skill level to Portuguese if needed
      const skillLevelMap: Record<string, string> = {
        beginner: 'iniciante',
        intermediate: 'intermediário',
        advanced: 'avançado',
        expert: 'expert',
        iniciante: 'iniciante',
        intermediário: 'intermediário',
        avançado: 'avançado',
      };

      const skillLevel = insights.skillLevel 
        ? skillLevelMap[insights.skillLevel.toLowerCase()] || insights.skillLevel
        : 'intermediário';

      return {
        skillLevel,
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
      const prompt = `Escreva um resumo conciso de 2-3 frases sobre as condições de surf para ${spotName} baseado nestes insights:

Nível de Habilidade: ${insights.skillLevel}
Avaliação: ${insights.rating}/10
Recomendações: ${insights.recommendations.join(', ')}
Riscos: ${insights.risks.join(', ')}

Escreva um resumo natural e envolvente em português brasileiro que surfistas acharão útil.`;

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
              'Você é um especialista em previsão de surf escrevendo resumos concisos e envolventes em português brasileiro para surfistas brasileiros.',
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
