/**
 * API Route: PATCH/DELETE /api/cart/[id]
 * Update or remove cart item
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import {
  updateCartItemQuantity,
  removeFromCart,
  checkStock,
} from "@/lib/database/product-queries";
import { supabaseAdmin } from "@/lib/supabase/admin";

// PATCH update cart item quantity
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: cartItemId } = await params;
    const body = await request.json();
    const { quantity } = body;

    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { error: "Quantity must be at least 1" },
        { status: 400 }
      );
    }

    // Get cart item to check product and ownership
    const { data: cartItem } = await supabaseAdmin
      .from("cart")
      .select("*, product:products(*)")
      .eq("id", cartItemId)
      .eq("user_id", auth.user.id)
      .single();

    if (!cartItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    // Check stock
    const stockAvailable = await checkStock(cartItem.product_id, quantity);
    if (!stockAvailable) {
      return NextResponse.json(
        { error: "Insufficient stock" },
        { status: 400 }
      );
    }

    const success = await updateCartItemQuantity(cartItemId, quantity);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to update cart" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Cart updated successfully" });
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE remove cart item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: cartItemId } = await params;

    // Verify ownership
    const { data: cartItem } = await supabaseAdmin
      .from("cart")
      .select("user_id")
      .eq("id", cartItemId)
      .single();

    if (!cartItem || cartItem.user_id !== auth.user.id) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    const success = await removeFromCart(cartItemId);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to remove item" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
