-- Add delivered timestamp to orders
ALTER TABLE "Order" ADD COLUMN "deliveredAt" TIMESTAMP(3);

-- Create order status history table
CREATE TABLE "order_status_history" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_status_history_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "order_status_history_orderId_status_changedAt_idx"
ON "order_status_history"("orderId", "status", "changedAt");

ALTER TABLE "order_status_history"
ADD CONSTRAINT "order_status_history_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
