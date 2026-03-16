import prisma from "../lib/prisma";

async function main() {
  const columns = await prisma.$queryRaw<
    Array<{ table_name: string; column_name: string; data_type: string }>
  >`
    SELECT table_name, column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name IN ('Cart', 'CartItem')
    ORDER BY table_name, ordinal_position;
  `;

  const indexes = await prisma.$queryRaw<
    Array<{ tablename: string; indexname: string; indexdef: string }>
  >`
    SELECT tablename, indexname, indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename IN ('Cart', 'CartItem')
    ORDER BY tablename, indexname;
  `;

  console.log("\nColumns:");
  for (const c of columns) {
    console.log(`${c.table_name}.${c.column_name} (${c.data_type})`);
  }

  console.log("\nIndexes:");
  for (const i of indexes) {
    console.log(`${i.tablename}: ${i.indexname} -> ${i.indexdef}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
