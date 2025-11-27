/**
 * Orders API Route
 * GET user's orders with items
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { getUserOrders } from "@/lib/database/product-queries";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await getUserOrders(auth.user.id);

    return NextResponse.json({
      orders,
    });
  } catch (error: any) {
    console.error("Get orders error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
