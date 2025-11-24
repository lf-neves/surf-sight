import { PrismaClient, User, UserSkillLevel } from "@prisma/client";

export class UserService {
  constructor(private prisma: PrismaClient) {}

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      orderBy: {
        email: "asc",
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        userId: id,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async create(data: {
    email: string;
    name?: string;
    phone?: string;
    skillLevel?: UserSkillLevel;
  }): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async update(
    id: string,
    data: Partial<{
      email: string;
      name: string;
      phone: string;
      skillLevel: UserSkillLevel;
    }>
  ): Promise<User> {
    return this.prisma.user.update({
      where: {
        userId: id,
      },
      data,
    });
  }

  async delete(id: string): Promise<User> {
    return this.prisma.user.delete({
      where: {
        userId: id,
      },
    });
  }
}

