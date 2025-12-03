import { PrismaClient } from '@prisma/client';

function createPrismaClient() {
  return new PrismaClient();
}

export const prismaClient = createPrismaClient();
