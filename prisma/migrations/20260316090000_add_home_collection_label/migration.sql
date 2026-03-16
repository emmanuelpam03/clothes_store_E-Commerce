-- Add admin-controlled homepage collection label
ALTER TABLE "store_settings"
ADD COLUMN "home_collection_label" TEXT NOT NULL DEFAULT 'Summer 2025';
