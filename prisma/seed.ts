import { PrismaClient } from "@/app/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  await prisma.category.createMany({
    data: [
      { name: "Shirts", slug: "shirts" },
      { name: "T-Shirts", slug: "t-shirts" },
      { name: "Polo Shirts", slug: "polo-shirts" },
      { name: "Jeans", slug: "jeans" },
      { name: "Jackets", slug: "jackets" },
      { name: "Shorts", slug: "shorts" },
    ],
    skipDuplicates: true,
  });

  console.log("Categories seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
