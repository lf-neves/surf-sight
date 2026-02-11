import { drizzleDb, spots, Spot, SpotType, resetDatabasePool } from '@surf-sight/database';
import { eq, asc, like, or } from 'drizzle-orm';
import { logger } from '@surf-sight/core';

function isConnectionError(error: any): boolean {
  const msg = error?.message ?? '';
  const causeMsg = error?.cause?.message ?? '';
  return (
    /connection timeout|Connection terminated|ECONNRESET|ECONNREFUSED/i.test(msg) ||
    /connection timeout|Connection terminated|ECONNRESET|ECONNREFUSED/i.test(causeMsg)
  );
}

export class SpotService {
  constructor(private db: typeof drizzleDb) {}

  async findAll(isRetry = false): Promise<Spot[]> {
    try {
      const result = await this.db.select().from(spots).orderBy(asc(spots.name));
      return result;
    } catch (error: any) {
      if (!isRetry && isConnectionError(error)) {
        logger.warn('SpotService.findAll: connection error, resetting pool and retrying once');
        await resetDatabasePool();
        return this.findAll(true);
      }
      logger.error('SpotService.findAll error:', {
        error: error?.message,
        stack: error?.stack,
        cause: error?.cause,
        code: error?.code,
        detail: error?.detail,
      });
      throw error;
    }
  }

  async findById(id: string, isRetry = false): Promise<Spot | null> {
    try {
      const result = await this.db
        .select()
        .from(spots)
        .where(eq(spots.spotId, id))
        .limit(1);
      return result[0] || null;
    } catch (error: any) {
      if (!isRetry && isConnectionError(error)) {
        logger.warn('SpotService.findById: connection error, resetting pool and retrying once');
        await resetDatabasePool();
        return this.findById(id, true);
      }
      logger.error('SpotService.findById error:', {
        spotId: id,
        message: error?.message,
        stack: error?.stack,
        cause: error?.cause,
        code: error?.code,
        detail: error?.detail,
      });
      throw error;
    }
  }

  async findBySlug(slug: string): Promise<Spot | null> {
    const result = await this.db
      .select()
      .from(spots)
      .where(eq(spots.slug, slug))
      .limit(1);
    return result[0] || null;
  }

  async create(data: {
    name: string;
    slug: string;
    lat: number;
    lon: number;
    type: SpotType;
    meta?: any;
  }): Promise<Spot> {
    const result = await this.db
      .insert(spots)
      .values({
        name: data.name,
        slug: data.slug,
        lat: data.lat,
        lon: data.lon,
        type: data.type,
        meta: data.meta || {},
      })
      .returning();
    return result[0];
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      slug: string;
      lat: number;
      lon: number;
      type: SpotType;
      meta: any;
    }>
  ): Promise<Spot> {
    const result = await this.db
      .update(spots)
      .set(data)
      .where(eq(spots.spotId, id))
      .returning();
    return result[0];
  }

  async delete(id: string): Promise<Spot> {
    const result = await this.db
      .delete(spots)
      .where(eq(spots.spotId, id))
      .returning();
    return result[0];
  }

  async search(query: string): Promise<Spot[]> {
    const searchPattern = `%${query}%`;
    const result = await this.db
      .select()
      .from(spots)
      .where(
        or(
          like(spots.name, searchPattern),
          like(spots.slug, searchPattern)
        )
      )
      .orderBy(asc(spots.name));
    return result;
  }
}
