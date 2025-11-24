import DataLoader from 'dataloader';
import { AISummary, PrismaClient } from '@prisma/client';

type SummaryKey = {
  spotId: string;
  timestamp?: Date;
};

export function createSummaryLoader(prisma: PrismaClient) {
  return new DataLoader<SummaryKey, AISummary | null>(
    async (keys) => {
      const spotIds = [...new Set(keys.map((k) => k.spotId))];
      
      // Fetch all summaries for these spots
      const summaries = await prisma.aISummary.findMany({
        where: {
          spotId: { in: spotIds },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Group by spotId, keeping the latest or matching timestamp
      const summariesBySpot = new Map<string, AISummary[]>();
      summaries.forEach((summary) => {
        const existing = summariesBySpot.get(summary.spotId) || [];
        existing.push(summary);
        summariesBySpot.set(summary.spotId, existing);
      });

      // Return results matching the keys
      return keys.map((key) => {
        const spotSummaries = summariesBySpot.get(key.spotId) || [];
        
        if (key.timestamp) {
          // Find summary for the specific timestamp (or closest)
          const matching = spotSummaries.find(
            (s) => new Date(s.createdAt).getTime() === key.timestamp!.getTime()
          );
          return matching || spotSummaries[0] || null;
        }
        
        // Return latest summary
        return spotSummaries[0] || null;
      });
    },
    {
      cacheKeyFn: (key) => `${key.spotId}:${key.timestamp?.toISOString() || 'latest'}`,
    }
  );
}

