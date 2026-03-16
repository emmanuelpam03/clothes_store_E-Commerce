-- Drops legacy flag; collections are admin-managed by design.
ALTER TABLE "Collection" DROP COLUMN IF EXISTS "is_admin_created";
