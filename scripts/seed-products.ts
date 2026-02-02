// scripts/seed-products.ts
import prisma from "@/lib/prisma";

async function seed() {
  const product = await prisma.product.create({
    data: {
      name: "Basic Heavy T-Shirt",
      description: "Cotton tee",
      price: 999,
      active: true,
      inventory: {
        create: {
          quantity: 10,
        },
      },
    },
  });

  console.log(product.id);
}

seed();
