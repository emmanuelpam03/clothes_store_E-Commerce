-- AlterTable
ALTER TABLE "store_settings"
ADD COLUMN IF NOT EXISTS "home_collection_id" TEXT;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'store_settings_home_collection_id_fkey'
  ) THEN
    ALTER TABLE "store_settings"
    ADD CONSTRAINT "store_settings_home_collection_id_fkey"
    FOREIGN KEY ("home_collection_id") REFERENCES "Collection"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Best-effort migrate legacy home_collection_label to home_collection_id (if the old column exists)
DO $$
DECLARE
  has_legacy_label boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'store_settings'
      AND column_name = 'home_collection_label'
  ) INTO has_legacy_label;

  IF has_legacy_label THEN
    UPDATE "store_settings" s
    SET "home_collection_id" = c."id"
    FROM "Collection" c
    WHERE s."id" = 'default'
      AND s."home_collection_id" IS NULL
      AND c."name" = s."home_collection_label";
  END IF;
END $$;
