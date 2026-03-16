import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const cached = globalForPrisma.prisma;
const prisma = (() => {
  if (!cached) {
    return new PrismaClient({ adapter });
  }

  const maybeClient = cached as unknown as {
    product?: { findMany?: unknown };
    collection?: { findMany?: unknown };
  };

  // In dev/HMR the global singleton can outlive a Prisma generate.
  // Ensure we don't reuse a client instance that predates newer models.
  const hasProductDelegate =
    typeof maybeClient.product?.findMany === "function";
  const hasCollectionDelegate =
    typeof maybeClient.collection?.findMany === "function";

  if (hasProductDelegate && hasCollectionDelegate) {
    return cached;
  }

  return new PrismaClient({ adapter });
})();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
