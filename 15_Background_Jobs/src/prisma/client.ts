import { PrismaClient } from '@prisma/client';

// Singleton pattern — reuse one client across the app
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
});
