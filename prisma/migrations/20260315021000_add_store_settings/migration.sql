-- CreateTable
CREATE TABLE "store_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "brand_name" TEXT NOT NULL DEFAULT 'Clothes Store',
    "support_email" TEXT NOT NULL DEFAULT 'support@clothesstore.com',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "size_system" TEXT NOT NULL DEFAULT 'US',
    "shipping_origin" TEXT NOT NULL DEFAULT 'United States',
    "shipping_cost_cents" INTEGER NOT NULL DEFAULT 1000,
    "free_shipping_threshold_cents" INTEGER NOT NULL DEFAULT 10000,
    "low_stock_threshold" INTEGER NOT NULL DEFAULT 10,
    "return_window_days" INTEGER NOT NULL DEFAULT 30,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_settings_pkey" PRIMARY KEY ("id")
);

-- Ensure one default singleton row exists
INSERT INTO "store_settings" ("id", "updated_at")
VALUES ('default', NOW())
ON CONFLICT ("id") DO NOTHING;
