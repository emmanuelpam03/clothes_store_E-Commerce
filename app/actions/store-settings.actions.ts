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
    shippingOrigin: settings.shippingOrigin,
    shippingCost: settings.shippingCostCents / 100,
    freeShippingThreshold: settings.freeShippingThresholdCents / 100,
    lowStockThreshold: settings.lowStockThreshold,
    returnWindowDays: settings.returnWindowDays,
  };
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
  const shippingOrigin = values.shippingOrigin.trim();

  if (!brandName) throw new Error("Brand name is required");
  if (!supportEmail) throw new Error("Support email is required");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail)) {
    throw new Error("Support email is invalid");
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

  await prisma.storeSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      brandName,
      supportEmail,
      currency,
      sizeSystem,
      shippingOrigin,
      shippingCostCents,
      freeShippingThresholdCents,
      lowStockThreshold: values.lowStockThreshold,
      returnWindowDays: values.returnWindowDays,
    },
    update: {
      brandName,
      supportEmail,
      currency,
      sizeSystem,
      shippingOrigin,
      shippingCostCents,
      freeShippingThresholdCents,
      lowStockThreshold: values.lowStockThreshold,
      returnWindowDays: values.returnWindowDays,
    },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/cart");
  revalidatePath("/checkout");
  revalidatePath("/order");

  return { success: true };
}
