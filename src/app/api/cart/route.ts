/**
 * API Route: GET/POST /api/cart
 * Manage shopping cart
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import {
  getUserCart,
  addToCart,
  checkStock,
} from "@/lib/database/product-queries";

// GET user's cart
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cart = await getUserCart(auth.user.id);

    // Calculate totals
    const subtotal = cart.reduce((sum, item) => {
      const price = item.product?.discount_price || item.product?.price || 0;
      return sum + price * item.quantity;
    }, 0);

    const discount = cart.reduce((sum, item) => {
      if (item.product?.discount_price) {
        const saved =
          (item.product.price - item.product.discount_price) * item.quantity;
        return sum + saved;
      }
      return sum;
    }, 0);

    return NextResponse.json({
      cart,
      subtotal,
      discount,
      total: subtotal,
      itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST add item to cart
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { product_id, quantity = 1 } = body;

    if (!product_id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    if (quantity < 1) {
      return NextResponse.json(
        { error: "Quantity must be at least 1" },
        { status: 400 }
      );
    }

    // Check stock availability
    const stockAvailable = await checkStock(product_id, quantity);
    if (!stockAvailable) {
      return NextResponse.json(
        { error: "Insufficient stock" },
        { status: 400 }
      );
    }

    const cartItem = await addToCart(auth.user.id, product_id, quantity);

    if (!cartItem) {
      return NextResponse.json(
        { error: "Failed to add to cart" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      cartItem,
      message: "Added to cart successfully",
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
