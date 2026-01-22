import { drizzleDb, forecasts, Forecast } from '@surf-sight/database';
import { logger } from '@surf-sight/core';
import { eq, asc, desc, gte, lte, and } from 'drizzle-orm';

export class ForecastService {
  constructor(private db: typeof drizzleDb) {}

  async findForSpot(spotId: string, nextHours?: number): Promise<Forecast[]> {
    logger.info('[ForecastService] findForSpot called', {
      spotId,
      nextHours,
    });
    
    const now = new Date();
    let whereConditions: any[] = [eq(forecasts.spotId, spotId)];

    if (nextHours) {
      // Include forecasts from slightly in the past to future
      const pastWindow = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
      const cutoff = new Date(now.getTime() + nextHours * 60 * 60 * 1000);
      whereConditions.push(
        gte(forecasts.timestamp, pastWindow),
        lte(forecasts.timestamp, cutoff)
      );
    } else {
      // If no hours specified, get forecasts from past 2 days to future 2 days
      const pastWindow = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
      const futureWindow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days ahead
      whereConditions.push(
        gte(forecasts.timestamp, pastWindow),
        lte(forecasts.timestamp, futureWindow)
      );
    }

    // Add a reasonable limit to prevent timeouts
    const maxRecords = nextHours ? Math.min(nextHours + 2, 50) : 50;

    const startTime = Date.now();
    const result = await this.db
      .select()
      .from(forecasts)
      .where(and(...whereConditions))
      .orderBy(asc(forecasts.timestamp))
      .limit(maxRecords);
    const duration = Date.now() - startTime;
    
    logger.info('[ForecastService] findForSpot result', {
      spotId,
      nextHours,
      forecastCount: result.length,
      maxRecords,
      duration: `${duration}ms`,
    });

    return result;
  }

  async findById(id: string): Promise<Forecast | null> {
    const result = await this.db
      .select()
      .from(forecasts)
      .where(eq(forecasts.forecastId, id))
      .limit(1);
    return result[0] || null;
  }

  async findLatestForecastForSpot(spotId: string): Promise<Forecast | null> {
    logger.info('[ForecastService] findLatestForecastForSpot called', {
      spotId,
    });
    
    const startTime = Date.now();
    const result = await this.db
      .select()
      .from(forecasts)
      .where(eq(forecasts.spotId, spotId))
      .orderBy(desc(forecasts.timestamp))
      .limit(1);
    const duration = Date.now() - startTime;
    
    const forecast = result[0] || null;
    logger.info('[ForecastService] findLatestForecastForSpot result', {
      spotId,
      found: !!forecast,
      forecastId: forecast?.forecastId,
      forecastTimestamp: forecast?.timestamp,
      duration: `${duration}ms`,
    });
    
    return forecast;
  }

  async create(data: {
    spotId: string;
    timestamp: Date;
    raw: any;
    source?: string;
  }): Promise<Forecast> {
    const result = await this.db
      .insert(forecasts)
      .values({
        spotId: data.spotId,
        timestamp: data.timestamp,
        raw: data.raw || {},
        source: data.source || 'stormglass',
      })
      .returning();
    return result[0];
  }

  async upsert(data: {
    spotId: string;
    timestamp: Date;
    raw: any;
    source?: string;
  }): Promise<Forecast> {
    // Drizzle doesn't have built-in upsert, so we use ON CONFLICT
    const result = await this.db
      .insert(forecasts)
      .values({
        spotId: data.spotId,
        timestamp: data.timestamp,
        raw: data.raw || {},
        source: data.source || 'stormglass',
      })
      .onConflictDoUpdate({
        target: [forecasts.spotId, forecasts.timestamp],
        set: {
          raw: data.raw,
          source: data.source || 'stormglass',
        },
      })
      .returning();
    return result[0];
  }

  async update(
    id: string,
    data: Partial<{
      timestamp: Date;
      raw: any;
      source: string;
    }>
  ): Promise<Forecast> {
    const result = await this.db
      .update(forecasts)
      .set(data)
      .where(eq(forecasts.forecastId, id))
      .returning();
    return result[0];
  }

  async delete(id: string): Promise<Forecast> {
    const result = await this.db
      .delete(forecasts)
      .where(eq(forecasts.forecastId, id))
      .returning();
    return result[0];
  }
}
