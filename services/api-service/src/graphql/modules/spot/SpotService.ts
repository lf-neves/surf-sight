import { PrismaClient, Spot, SpotType } from "@prisma/client";

export class SpotService {
  constructor(private prisma: PrismaClient) {}

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
    return this.prisma.spot.create({
      data: {
        ...data,
        meta: data.meta || {},
      },
    });
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
    return this.prisma.spot.update({
      where: {
        spotId: id,
      },
      data,
    });
  }

  async delete(id: string): Promise<Spot> {
    return this.prisma.spot.delete({
      where: {
        spotId: id,
      },
    });
  }

  async search(query: string): Promise<Spot[]> {
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
    });
  }
}

