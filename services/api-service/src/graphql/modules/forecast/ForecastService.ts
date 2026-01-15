import { PrismaClient, Forecast } from '@prisma/client';
import { logger } from '@surf-sight/core';

export class ForecastService {
  constructor(private prisma: PrismaClient) {}

  async findForSpot(spotId: string, nextHours?: number): Promise<Forecast[]> {
    logger.info('[ForecastService] findForSpot called', {
      spotId,
      nextHours,
    });
    
    const now = new Date();
    const where: any = {
      spotId,
    };

    if (nextHours) {
      // Include forecasts from slightly in the past to future
      const pastWindow = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
      const cutoff = new Date(now.getTime() + nextHours * 60 * 60 * 1000);
      where.timestamp = {
        gte: pastWindow, // Include recent past forecasts
        lte: cutoff,
      };
    } else {
      // If no hours specified, get forecasts from past 2 days to future 2 days
      // Reduced from 7 days to prevent timeouts
      const pastWindow = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
      const futureWindow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days ahead
      where.timestamp = {
        gte: pastWindow,
        lte: futureWindow,
      };
    }

    // Add a reasonable limit to prevent timeouts
    // Cap at 50 records to prevent Lambda timeouts
    // This should be enough for most use cases (about 2 days of hourly forecasts)
    const maxRecords = nextHours ? Math.min(nextHours + 2, 50) : 50;

    const startTime = Date.now();
    const forecasts = await this.prisma.forecast.findMany({
      where,
      orderBy: {
        timestamp: 'asc',
      },
      take: maxRecords, // Limit to prevent fetching too many records
    });
    const duration = Date.now() - startTime;
    
    logger.info('[ForecastService] findForSpot result', {
      spotId,
      nextHours,
      forecastCount: forecasts.length,
      maxRecords,
      duration: `${duration}ms`,
    });

    return forecasts;
  }

  async findById(id: string): Promise<Forecast | null> {
    return this.prisma.forecast.findUnique({
      where: {
        forecastId: id,
      },
    });
  }

  async findLatestForecastForSpot(spotId: string): Promise<Forecast | null> {
    logger.info('[ForecastService] findLatestForecastForSpot called', {
      spotId,
    });
    
    const startTime = Date.now();
    const forecast = await this.prisma.forecast.findFirst({
      where: {
        spotId,
      },
      orderBy: {
        timestamp: 'desc', // Get the most recent forecast
      },
    });
    const duration = Date.now() - startTime;
    
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
    return this.prisma.forecast.create({
      data: {
        ...data,
        source: data.source || 'stormglass',
        raw: data.raw || {},
      },
    });
  }

  async upsert(data: {
    spotId: string;
    timestamp: Date;
    raw: any;
    source?: string;
  }): Promise<Forecast> {
    return this.prisma.forecast.upsert({
      where: {
        spotId_timestamp: {
          spotId: data.spotId,
          timestamp: data.timestamp,
        },
      },
      update: {
        raw: data.raw,
        source: data.source || 'stormglass',
      },
      create: {
        ...data,
        source: data.source || 'stormglass',
        raw: data.raw || {},
      },
    });
  }

  async delete(id: string): Promise<Forecast> {
    return this.prisma.forecast.delete({
      where: {
        forecastId: id,
      },
    });
  }
}
