import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.HABIT_FLOW_DATABASE_URL,
    },
  },
});

export default prisma;
