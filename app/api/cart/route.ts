// app/api/cart/route.ts
import { NextResponse } from "next/server";
import { getOrCreateCart } from "@/app/actions/cart.actions";

export async function GET() {
  const cart = await getOrCreateCart();
  return NextResponse.json(cart);
}
