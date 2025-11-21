/**
 * Admin Products API Routes
 * GET all products, POST create new product
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { getAllProducts } from "@/lib/database/product-queries";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);

    const products = await getAllProducts();

    return NextResponse.json({ products });
  } catch (error: any) {
    console.error("Get products error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);

    const body = await request.json();
    const {
      name,
      description,
      price,
      discount_price,
      stock,
      sku,
      image_url,
      category,
    } = body;

    // Validation
    if (!name || !description || price == null || stock == null) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("products")
      .insert({
        name,
        description,
        price,
        discount_price,
        stock,
        sku,
        image_url,
        category,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Create product error:", error);
      throw error;
    }

    return NextResponse.json({ product: data });
  } catch (error: any) {
    console.error("Create product error:", error);

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
