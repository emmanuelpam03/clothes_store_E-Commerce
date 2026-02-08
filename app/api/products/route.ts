import { NextRequest, NextResponse } from "next/server";
import { getProductsByIds } from "@/app/actions/product.actions";

export async function GET(request: NextRequest) {
  const idsParam = request.nextUrl.searchParams.get("ids");
  if (!idsParam) {
    return NextResponse.json([]);
  }
  const ids = idsParam.split(",").filter(Boolean);
  const products = await getProductsByIds(ids);
  return NextResponse.json(products);
}
