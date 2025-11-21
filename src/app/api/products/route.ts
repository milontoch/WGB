/**
 * API Route: GET /api/products
 * Fetch all active products
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getActiveProducts,
  getProductsByCategory,
} from "@/lib/database/product-queries";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    let products;
    if (category) {
      products = await getProductsByCategory(category);
    } else {
      products = await getActiveProducts();
    }

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error in products API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
