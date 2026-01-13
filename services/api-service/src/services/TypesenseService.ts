import Typesense, { Client } from 'typesense';
import { env } from '../env';
import { logger } from '@surf-sight/core';
import { Spot } from '@prisma/client';

const COLLECTION_NAME = 'spots';

export interface SpotDocument {
  id: string;
  name: string;
  slug: string;
  lat: number;
  lon: number;
  type: string;
  meta?: any;
}

export class TypesenseService {
  private client: Client;

  constructor() {
    this.client = new Typesense.Client({
      nodes: env.typesense.nodes,
      apiKey: env.typesense.apiKey,
      connectionTimeoutSeconds: env.typesense.connectionTimeoutSeconds,
    });
  }

  /**
   * Initialize the spots collection in Typesense
   * This should be called once during application startup
   */
  async initializeCollection(): Promise<void> {
    try {
      // Check if collection exists
      try {
        await this.client.collections(COLLECTION_NAME).retrieve();
        logger.info('Typesense collection "spots" already exists');
        return;
      } catch (error: any) {
        // Collection doesn't exist, create it
        if (error.httpStatus === 404) {
          logger.info('Creating Typesense collection "spots"');
          await this.client.collections().create({
            name: COLLECTION_NAME,
            fields: [
              { name: 'id', type: 'string' },
              { name: 'name', type: 'string' },
              { name: 'slug', type: 'string' },
              { name: 'lat', type: 'float' },
              { name: 'lon', type: 'float' },
              { name: 'type', type: 'string' },
              { name: 'meta', type: 'object', optional: true },
            ],
            default_sorting_field: 'name',
          });
          logger.info('Typesense collection "spots" created successfully');
        } else {
          throw error;
        }
      }
    } catch (error) {
      logger.error('Error initializing Typesense collection:', error);
      throw error;
    }
  }

  /**
   * Index a spot document in Typesense
   */
  async indexSpot(spot: Spot): Promise<void> {
    try {
      const document: SpotDocument = {
        id: spot.spotId,
        name: spot.name,
        slug: spot.slug,
        lat: spot.lat,
        lon: spot.lon,
        type: spot.type,
        meta: spot.meta as any || {},
      };

      await this.client
        .collections(COLLECTION_NAME)
        .documents()
        .upsert(document);
    } catch (error) {
      logger.error('Error indexing spot in Typesense:', error);
      throw error;
    }
  }

  /**
   * Index multiple spot documents in Typesense
   */
  async indexSpots(spots: Spot[]): Promise<void> {
    try {
      const documents: SpotDocument[] = spots.map((spot) => ({
        id: spot.spotId,
        name: spot.name,
        slug: spot.slug,
        lat: spot.lat,
        lon: spot.lon,
        type: spot.type,
        meta: spot.meta as any || {},
      }));

      // Typesense supports batch import
      const importResults = await this.client
        .collections(COLLECTION_NAME)
        .documents()
        .import(documents, { action: 'upsert' });

      // Check for any errors in the import
      const errors = importResults.filter((result: any) => result.success === false);
      if (errors.length > 0) {
        logger.warn(`Typesense import had ${errors.length} errors:`, errors);
      }
    } catch (error) {
      logger.error('Error indexing spots in Typesense:', error);
      throw error;
    }
  }

  /**
   * Delete a spot document from Typesense
   */
  async deleteSpot(spotId: string): Promise<void> {
    try {
      await this.client
        .collections(COLLECTION_NAME)
        .documents(spotId)
        .delete();
    } catch (error: any) {
      // Ignore 404 errors (document doesn't exist)
      if (error.httpStatus !== 404) {
        logger.error('Error deleting spot from Typesense:', error);
        throw error;
      }
    }
  }

  /**
   * Search for spots using Typesense
   */
  async searchSpots(query: string, limit: number = 10): Promise<SpotDocument[]> {
    try {
      const searchParameters = {
        q: query,
        query_by: 'name,slug',
        limit,
        sort_by: '_text_match:desc,name:asc',
      };

      const searchResults = await this.client
        .collections(COLLECTION_NAME)
        .documents()
        .search(searchParameters);

      return (searchResults.hits || []).map((hit: any) => hit.document as SpotDocument);
    } catch (error) {
      logger.error('Error searching spots in Typesense:', error);
      // Fallback: return empty array instead of throwing
      // This allows the application to continue working even if Typesense is unavailable
      return [];
    }
  }

  /**
   * Get all spots from Typesense (for syncing)
   */
  async getAllSpots(limit: number = 250): Promise<SpotDocument[]> {
    try {
      const searchResults = await this.client
        .collections(COLLECTION_NAME)
        .documents()
        .search({
          q: '*',
          query_by: 'name',
          limit,
        });

      return (searchResults.hits || []).map((hit: any) => hit.document as SpotDocument);
    } catch (error) {
      logger.error('Error getting all spots from Typesense:', error);
      return [];
    }
  }
}
