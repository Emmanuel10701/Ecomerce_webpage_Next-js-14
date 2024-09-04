import { PrismaClient } from '@prisma/client';

// Extend the global object to include a PrismaClient instance
declare global {
  var prisma: PrismaClient | undefined;
}

// Initialize the Prisma client
const client = global.prisma || new PrismaClient();

// If in production, set the global prisma instance
if (process.env.NODE_ENV === 'production') {
  global.prisma = client;

}

export default client;
