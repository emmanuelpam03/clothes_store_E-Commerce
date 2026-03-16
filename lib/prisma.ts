import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const cached = globalForPrisma.prisma;
const prisma =
  cached && (cached as unknown as { department?: unknown }).department
    ? cached
    : new PrismaClient({
        adapter,
      });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
