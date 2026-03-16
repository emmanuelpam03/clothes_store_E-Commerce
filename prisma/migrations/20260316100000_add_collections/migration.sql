-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Collection_name_key" ON "Collection"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_slug_key" ON "Collection"("slug");

-- AlterTable
ALTER TABLE "Product" ADD COLUMN "collectionId" TEXT;

-- Backfill from legacy Product.collection string column (if present)
DO $$
DECLARE
  has_legacy_collection boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Product'
      AND column_name = 'collection'
  ) INTO has_legacy_collection;

  IF has_legacy_collection THEN
    INSERT INTO "Collection" ("id", "name", "slug")
    SELECT
      md5(btrim("collection")) AS "id",
      btrim("collection") AS "name",
      COALESCE(
        NULLIF(
          trim(both '-' from lower(regexp_replace(btrim("collection"), '[^a-zA-Z0-9]+', '-', 'g'))),
          ''
        ),
        md5(btrim("collection"))
      ) AS "slug"
    FROM "Product"
    WHERE "collection" IS NOT NULL AND btrim("collection") <> ''
    GROUP BY btrim("collection")
    ON CONFLICT DO NOTHING;
    UPDATE "Product"
    UPDATE "Product"
    SET "collectionId" = c."id"
    FROM "Collection" c
    WHERE "Product"."collection" IS NOT NULL 
      AND btrim("Product"."collection") <> ''
      AND c."id" = md5(btrim("Product"."collection"));    ALTER TABLE "Product" DROP COLUMN IF EXISTS "collection";
  END IF;
END $$;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
