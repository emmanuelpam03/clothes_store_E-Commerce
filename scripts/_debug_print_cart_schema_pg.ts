import "dotenv/config";
import { Client } from "pg";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = new Client({ connectionString });
  await client.connect();

  try {
    const cols = await client.query<{
      table_name: string;
      column_name: string;
      data_type: string;
      is_nullable: string;
      column_default: string | null;
    }>(
      `
      SELECT table_name, column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name IN ('Cart', 'CartItem')
      ORDER BY table_name, ordinal_position;
      `,
    );

    const idx = await client.query<{
      tablename: string;
      indexname: string;
      indexdef: string;
    }>(
      `
      SELECT tablename, indexname, indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename IN ('Cart', 'CartItem')
      ORDER BY tablename, indexname;
      `,
    );

    console.log("\nColumns:");
    for (const r of cols.rows) {
      console.log(
        `${r.table_name}.${r.column_name} (${r.data_type}) nullable=${r.is_nullable} default=${r.column_default ?? ""}`,
      );
    }

    console.log("\nIndexes:");
    for (const r of idx.rows) {
      console.log(`${r.tablename}: ${r.indexname} -> ${r.indexdef}`);
    }
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
