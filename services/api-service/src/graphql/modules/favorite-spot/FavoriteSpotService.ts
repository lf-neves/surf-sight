import { drizzleDb, favoriteSpots, FavoriteSpot, spots } from '@surf-sight/database';
import { eq, desc, and } from 'drizzle-orm';

export class FavoriteSpotService {
  constructor(private db: typeof drizzleDb) {}

  async findForUser(userId: string): Promise<(FavoriteSpot & { spot: typeof spots.$inferSelect })[]> {
    // Join with spots to include spot data
    const result = await this.db
      .select({
        userId: favoriteSpots.userId,
        spotId: favoriteSpots.spotId,
        notifyWhatsapp: favoriteSpots.notifyWhatsapp,
        createdAt: favoriteSpots.createdAt,
        updatedAt: favoriteSpots.updatedAt,
        spot: spots,
      })
      .from(favoriteSpots)
      .innerJoin(spots, eq(favoriteSpots.spotId, spots.spotId))
      .where(eq(favoriteSpots.userId, userId))
      .orderBy(desc(favoriteSpots.createdAt));
    
    // Return with spot relation included
    return result as any;
  }

  async isFavorite(userId: string, spotId: string): Promise<boolean> {
    const result = await this.db
      .select()
      .from(favoriteSpots)
      .where(
        and(
          eq(favoriteSpots.userId, userId),
          eq(favoriteSpots.spotId, spotId)
        )
      )
      .limit(1);
    return result.length > 0;
  }

  async add(
    userId: string,
    spotId: string,
    notifyWhatsapp?: boolean
  ): Promise<FavoriteSpot> {
    const result = await this.db
      .insert(favoriteSpots)
      .values({
        userId,
        spotId,
        notifyWhatsapp: notifyWhatsapp || false,
      })
      .returning();
    return result[0];
  }

  async remove(userId: string, spotId: string): Promise<FavoriteSpot> {
    const result = await this.db
      .delete(favoriteSpots)
      .where(
        and(
          eq(favoriteSpots.userId, userId),
          eq(favoriteSpots.spotId, spotId)
        )
      )
      .returning();
    return result[0];
  }

  async update(
    userId: string,
    spotId: string,
    notifyWhatsapp: boolean
  ): Promise<FavoriteSpot> {
    const result = await this.db
      .update(favoriteSpots)
      .set({ notifyWhatsapp })
      .where(
        and(
          eq(favoriteSpots.userId, userId),
          eq(favoriteSpots.spotId, spotId)
        )
      )
      .returning();
    return result[0];
  }
}
