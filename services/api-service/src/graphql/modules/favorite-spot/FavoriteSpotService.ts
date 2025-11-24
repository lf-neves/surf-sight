import { PrismaClient, FavoriteSpot } from "@prisma/client";

export class FavoriteSpotService {
  constructor(private prisma: PrismaClient) {}

  async findForUser(userId: string): Promise<FavoriteSpot[]> {
    return this.prisma.favoriteSpot.findMany({
      where: {
        userId,
      },
      include: {
        spot: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async isFavorite(userId: string, spotId: string): Promise<boolean> {
    const favorite = await this.prisma.favoriteSpot.findUnique({
      where: {
        userId_spotId: {
          userId,
          spotId,
        },
      },
    });
    return !!favorite;
  }

  async add(
    userId: string,
    spotId: string,
    notifyWhatsapp?: boolean
  ): Promise<FavoriteSpot> {
    return this.prisma.favoriteSpot.create({
      data: {
        userId,
        spotId,
        notifyWhatsapp: notifyWhatsapp || false,
      },
    });
  }

  async remove(userId: string, spotId: string): Promise<FavoriteSpot> {
    return this.prisma.favoriteSpot.delete({
      where: {
        userId_spotId: {
          userId,
          spotId,
        },
      },
    });
  }

  async update(
    userId: string,
    spotId: string,
    notifyWhatsapp: boolean
  ): Promise<FavoriteSpot> {
    return this.prisma.favoriteSpot.update({
      where: {
        userId_spotId: {
          userId,
          spotId,
        },
      },
      data: {
        notifyWhatsapp,
      },
    });
  }
}

