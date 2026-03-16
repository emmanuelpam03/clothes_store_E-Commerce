"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getStoreSettings } from "@/lib/store-settings";

export type AdminStoreSettingsFormValues = {
  brandName: string;
  supportEmail: string;
  currency: string;
  sizeSystem: string;
  homeCollectionId: string;
  shippingOrigin: string;
  shippingCost: number;
  freeShippingThreshold: number;
  lowStockThreshold: number;
  returnWindowDays: number;
};

function ensureAdmin(sessionRole?: string) {
  if (sessionRole !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function getPublicStoreSettingsAction() {
  return getStoreSettings();
}

export async function getAdminStoreSettingsAction(): Promise<AdminStoreSettingsFormValues> {
  const session = await auth();
  ensureAdmin(session?.user?.role);

  const settings = await getStoreSettings();

  return {
    brandName: settings.brandName,
    supportEmail: settings.supportEmail,
    currency: settings.currency,
    sizeSystem: settings.sizeSystem,
    homeCollectionId: settings.homeCollectionId ?? "",
    shippingOrigin: settings.shippingOrigin,
    shippingCost: settings.shippingCostCents / 100,
    freeShippingThreshold: settings.freeShippingThresholdCents / 100,
    lowStockThreshold: settings.lowStockThreshold,
    returnWindowDays: settings.returnWindowDays,
  };
}

export async function getAvailableProductCollectionsAction(): Promise<
  { id: string; name: string }[]
> {
  const session = await auth();
  ensureAdmin(session?.user?.role);

  return prisma.collection.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function updateAdminStoreSettingsAction(
  values: AdminStoreSettingsFormValues,
) {
  const session = await auth();
  ensureAdmin(session?.user?.role);

  const brandName = values.brandName.trim();
  const supportEmail = values.supportEmail.trim().toLowerCase();
  const currency = values.currency.trim().toUpperCase();
  const sizeSystem = values.sizeSystem.trim().toUpperCase();
  const homeCollectionId = values.homeCollectionId.trim();
  const shippingOrigin = values.shippingOrigin.trim();

  if (!brandName) throw new Error("Brand name is required");
  if (!supportEmail) throw new Error("Support email is required");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail)) {
    throw new Error("Support email is invalid");
  }

  if (!homeCollectionId) {
    throw new Error("Homepage featured collection is required");
  }

  const featuredCollectionExists = await prisma.product.findFirst({
    where: {
      active: true,
      isFeatured: true,
      collectionId: homeCollectionId,
    },
    select: {
      id: true,
    },
  });

  if (!featuredCollectionExists) {
    throw new Error(
      "Selected homepage collection must have at least one active featured product",
    );
  }

  if (values.shippingCost < 0)
    throw new Error("Shipping cost cannot be negative");
  if (values.freeShippingThreshold < 0) {
    throw new Error("Free shipping threshold cannot be negative");
  }
  if (values.lowStockThreshold < 0)
    throw new Error("Low stock threshold cannot be negative");
  if (values.returnWindowDays < 1)
    throw new Error("Return window must be at least 1 day");

  const shippingCostCents = Math.round(values.shippingCost * 100);
  const freeShippingThresholdCents = Math.round(
    values.freeShippingThreshold * 100,
  );

  const hasLabelColumnRows = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'store_settings'
        AND column_name = 'home_collection_id'
    ) AS "exists"
  `;

  const hasLabelColumn = hasLabelColumnRows[0]?.exists ?? false;

  if (hasLabelColumn) {
    await prisma.$executeRaw`
      INSERT INTO "store_settings" (
        "id",
        "brand_name",
        "support_email",
        "currency",
        "size_system",
        "home_collection_id",
        "shipping_origin",
        "shipping_cost_cents",
        "free_shipping_threshold_cents",
        "low_stock_threshold",
        "return_window_days",
        "updated_at"
      )
      VALUES (
        'default',
        ${brandName},
        ${supportEmail},
        ${currency},
        ${sizeSystem},
        ${homeCollectionId},
        ${shippingOrigin},
        ${shippingCostCents},
        ${freeShippingThresholdCents},
        ${values.lowStockThreshold},
        ${values.returnWindowDays},
        NOW()
      )
      ON CONFLICT ("id") DO UPDATE SET
        "brand_name" = EXCLUDED."brand_name",
        "support_email" = EXCLUDED."support_email",
        "currency" = EXCLUDED."currency",
        "size_system" = EXCLUDED."size_system",
        "home_collection_id" = EXCLUDED."home_collection_id",
        "shipping_origin" = EXCLUDED."shipping_origin",
        "shipping_cost_cents" = EXCLUDED."shipping_cost_cents",
        "free_shipping_threshold_cents" = EXCLUDED."free_shipping_threshold_cents",
        "low_stock_threshold" = EXCLUDED."low_stock_threshold",
        "return_window_days" = EXCLUDED."return_window_days",
        "updated_at" = NOW()
    `;
  } else {
    await prisma.$executeRaw`
      INSERT INTO "store_settings" (
        "id",
        "brand_name",
        "support_email",
        "currency",
        "size_system",
        "shipping_origin",
        "shipping_cost_cents",
        "free_shipping_threshold_cents",
        "low_stock_threshold",
        "return_window_days",
        "updated_at"
      )
      VALUES (
        'default',
        ${brandName},
        ${supportEmail},
        ${currency},
        ${sizeSystem},
        ${shippingOrigin},
        ${shippingCostCents},
        ${freeShippingThresholdCents},
        ${values.lowStockThreshold},
        ${values.returnWindowDays},
        NOW()
      )
      ON CONFLICT ("id") DO UPDATE SET
        "brand_name" = EXCLUDED."brand_name",
        "support_email" = EXCLUDED."support_email",
        "currency" = EXCLUDED."currency",
        "size_system" = EXCLUDED."size_system",
        "shipping_origin" = EXCLUDED."shipping_origin",
        "shipping_cost_cents" = EXCLUDED."shipping_cost_cents",
        "free_shipping_threshold_cents" = EXCLUDED."free_shipping_threshold_cents",
        "low_stock_threshold" = EXCLUDED."low_stock_threshold",
        "return_window_days" = EXCLUDED."return_window_days",
        "updated_at" = NOW()
    `;
  }

  revalidatePath("/admin/settings");
  revalidatePath("/cart");
  revalidatePath("/checkout");
  revalidatePath("/order");

  return { success: true };
}
