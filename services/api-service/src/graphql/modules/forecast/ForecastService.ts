import { PrismaClient, Forecast } from "@prisma/client";

export class ForecastService {
  constructor(private prisma: PrismaClient) {}

  async findForSpot(spotId: string, nextHours?: number): Promise<Forecast[]> {
    const now = new Date();
    const where: any = {
      spotId,
    };

    if (nextHours) {
      const cutoff = new Date(now.getTime() + nextHours * 60 * 60 * 1000);
      where.timestamp = {
        gte: now,
        lte: cutoff,
      };
    } else {
      where.timestamp = {
        gte: now,
      };
    }

    return this.prisma.forecast.findMany({
      where,
      orderBy: {
        timestamp: "asc",
      },
    });
  }

  async findById(id: string): Promise<Forecast | null> {
    return this.prisma.forecast.findUnique({
      where: {
        forecastId: id,
      },
    });
  }

  async findLatestForecastForSpot(spotId: string): Promise<Forecast | null> {
    return this.prisma.forecast.findFirst({
      where: {
        spotId,
        timestamp: {
          gte: new Date(), // Only future forecasts
        },
      },
      orderBy: {
        timestamp: 'asc', // Get the earliest future forecast (most current)
      },
    });
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
        source: data.source || "stormglass",
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
        source: data.source || "stormglass",
      },
      create: {
        ...data,
        source: data.source || "stormglass",
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

