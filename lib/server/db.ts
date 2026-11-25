import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as typeof globalThis & { prisma?: PrismaClient };

export function getDb() {
  if (!globalForPrisma.prisma) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("DATABASE_URL is required.");
    globalForPrisma.prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString, connectionTimeoutMillis: 5000 }),
    });
  }

  return globalForPrisma.prisma;
}
