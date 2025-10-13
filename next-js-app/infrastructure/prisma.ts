import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create the base client
const prismaBase =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// Only save prisma in global object in development (prevents memory leaks in prod)
if (process.env.NODE_ENV === 'development') globalForPrisma.prisma = prismaBase;

// Export the client without extensions for now
const prisma = prismaBase;

export { prisma }; 