import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client Singleton
 *
 * In development, prevent multiple instances of Prisma Client to avoid exhausting the database connection limit.
 * In production, create a single instance.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
