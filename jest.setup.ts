/// <reference types="jest" />
import { prismaClient } from '@surf-sight/database';

afterAll(async () => {
  await prismaClient.$disconnect();
});


