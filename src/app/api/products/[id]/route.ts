/**
 * API Route: GET /api/products/[id]
 * Fetch single product with reviews
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getProductById,
  getProductReviews,
  getProductAverageRating,
} from "@/lib/database/product-queries";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;

    const [product, reviews, averageRating] = await Promise.all([
      getProductById(productId),
      getProductReviews(productId),
      getProductAverageRating(productId),
    ]);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({
      product,
      reviews,
      averageRating,
      reviewCount: reviews.length,
    });
  } catch (error) {
    console.error("Error in product detail API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
