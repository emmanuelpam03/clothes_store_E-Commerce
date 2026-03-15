import prisma from "@/lib/prisma";

async function main() {
  try {
    console.log("Running a simple Prisma query...");
    const user = await prisma.user.findFirst({
      select: { id: true, email: true },
    });
    console.log("Prisma query succeeded. Sample user:", user);
  } catch (err) {
    console.error("Prisma query failed:", err);
  }
}

main().finally(() => process.exit());
