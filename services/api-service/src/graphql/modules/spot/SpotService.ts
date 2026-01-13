import { PrismaClient, Spot, SpotType } from "@prisma/client";
import { TypesenseService } from "../../../services/TypesenseService";

export class SpotService {
  constructor(
    private prisma: PrismaClient,
    private typesense?: TypesenseService
  ) {}

  async findAll(): Promise<Spot[]> {
    return this.prisma.spot.findMany({
      orderBy: {
        name: "asc",
      },
    });
  }

  async findById(id: string): Promise<Spot | null> {
    return this.prisma.spot.findUnique({
      where: {
        spotId: id,
      },
    });
  }

  async findBySlug(slug: string): Promise<Spot | null> {
    return this.prisma.spot.findUnique({
      where: {
        slug,
      },
    });
  }

  async create(data: {
    name: string;
    slug: string;
    lat: number;
    lon: number;
    type: SpotType;
    meta?: any;
  }): Promise<Spot> {
    const spot = await this.prisma.spot.create({
      data: {
        ...data,
        meta: data.meta || {},
      },
    });
    
    // Index in Typesense
    await this.indexSpotInTypesense(spot);
    
    return spot;
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
    const spot = await this.prisma.spot.update({
      where: {
        spotId: id,
      },
      data,
    });
    
    // Update in Typesense
    await this.indexSpotInTypesense(spot);
    
    return spot;
  }

  async delete(id: string): Promise<Spot> {
    const spot = await this.prisma.spot.delete({
      where: {
        spotId: id,
      },
    });
    
    // Remove from Typesense
    await this.removeSpotFromTypesense(id);
    
    return spot;
  }

  async search(query: string): Promise<Spot[]> {
    // Try Typesense first if available
    if (this.typesense && query.trim()) {
      try {
        const typesenseResults = await this.typesense.searchSpots(query, 20);
        
        if (typesenseResults.length > 0) {
          // Fetch full spot records from Prisma using the IDs from Typesense
          const spotIds = typesenseResults.map((doc) => doc.id);
          const spots = await this.prisma.spot.findMany({
            where: {
              spotId: {
                in: spotIds,
              },
            },
          });
          
          // Return spots in the same order as Typesense results
          const spotMap = new Map(spots.map((spot) => [spot.spotId, spot]));
          return typesenseResults
            .map((doc) => spotMap.get(doc.id))
            .filter((spot): spot is Spot => spot !== undefined);
        }
      } catch (error) {
        // Fall through to Prisma search if Typesense fails
        console.warn('Typesense search failed, falling back to Prisma:', error);
      }
    }

    // Fallback to Prisma search
    return this.prisma.spot.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            slug: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      orderBy: {
        name: "asc",
      },
      take: 20,
    });
  }

  /**
   * Index a spot in Typesense (call after create/update)
   */
  async indexSpotInTypesense(spot: Spot): Promise<void> {
    if (this.typesense) {
      try {
        await this.typesense.indexSpot(spot);
      } catch (error) {
        console.warn('Failed to index spot in Typesense:', error);
        // Don't throw - indexing failure shouldn't break the main operation
      }
    }
  }

  /**
   * Remove a spot from Typesense (call after delete)
   */
  async removeSpotFromTypesense(spotId: string): Promise<void> {
    if (this.typesense) {
      try {
        await this.typesense.deleteSpot(spotId);
      } catch (error) {
        console.warn('Failed to remove spot from Typesense:', error);
        // Don't throw - deletion failure shouldn't break the main operation
      }
    }
  }
}

