import { PrismaClient, AISummary } from "@prisma/client";

export interface AIInsights {
  conditions: string;
  skillLevel: string;
  recommendations: string[];
  risks: string[];
  rating: number;
}

export class AISummaryService {
  constructor(private prisma: PrismaClient) {}

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
        createdAt: "desc",
      },
    });
  }

  async getLatestInsights(
    spotId: string,
    timestamp?: Date
  ): Promise<AIInsights | null> {
    const summary = await this.getLatestSummary(spotId, timestamp);

    if (!summary) {
      return null;
    }

    const structured = summary.structured as any;

    return {
      conditions: summary.summary || "",
      skillLevel: structured.skillLevel || "intermediate",
      recommendations: structured.recommendations || [],
      risks: structured.risks || [],
      rating: structured.rating || 0,
    };
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
}
