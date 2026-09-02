import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

/**
 * Check if the database connection is active and reachable.
 * @returns {Promise<boolean>} True if DB responds, false otherwise.
 */
export async function checkDbConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
}
