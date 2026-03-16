-- AlterTable
ALTER TABLE "Collection" ADD COLUMN IF NOT EXISTS "is_admin_created" BOOLEAN NOT NULL DEFAULT true;

-- Mark legacy backfilled collections (md5 ids) as NOT admin-created
UPDATE "Collection"
SET "is_admin_created" = false
WHERE "id" ~ '^[0-9a-f]{32}$';
