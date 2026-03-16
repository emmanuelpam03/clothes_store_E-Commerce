-- If the homepage featured collection points to a legacy (non-admin-created) collection,
-- clear it so the UI forces an explicit admin choice.
UPDATE "store_settings" s
SET "home_collection_id" = NULL
WHERE s."id" = 'default'
  AND s."home_collection_id" IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM "Collection" c
    WHERE c."id" = s."home_collection_id"
      AND c."is_admin_created" = false
  );
