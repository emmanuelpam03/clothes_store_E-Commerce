-- Prevent deleting a collection that still has products.
-- This avoids TOCTOU races in app-level “count then delete” logic.
ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_collectionId_fkey";
ALTER TABLE "Product"
  ADD CONSTRAINT "Product_collectionId_fkey"
  FOREIGN KEY ("collectionId")
  REFERENCES "Collection"("id")
  ON DELETE RESTRICT
  ON UPDATE CASCADE;
