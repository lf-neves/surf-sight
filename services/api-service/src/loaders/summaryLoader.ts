import DataLoader from 'dataloader';
import { drizzleDb, aiSummaries, AISummary } from '@surf-sight/database';
import { inArray, desc } from 'drizzle-orm';

type SummaryKey = {
  spotId: string;
  timestamp?: Date;
};

export function createSummaryLoader(db: typeof drizzleDb) {
  return new DataLoader<SummaryKey, AISummary | null>(
    async (keys) => {
      const spotIds = [...new Set(keys.map((k) => k.spotId))];

      // Fetch all summaries for these spots
      const result = await db
        .select()
        .from(aiSummaries)
        .where(inArray(aiSummaries.spotId, spotIds))
        .orderBy(desc(aiSummaries.createdAt));

      // Group by spotId, keeping the latest or matching timestamp
      const summariesBySpot = new Map<string, AISummary[]>();
      result.forEach((summary) => {
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
      cacheKeyFn: (key: SummaryKey) => ({
        spotId: key.spotId,
        timestamp: key.timestamp,
      }),
    }
  );
}
