/**
 * API Route: POST /api/payment/initialize
 * Initialize Paystack payment for order
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { initializePayment } from "@/lib/services/paystack-service";
import { getUserCart } from "@/lib/database/product-queries";

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await requireAuth(request);

    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = authResult.user;

    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      shipping_address,
      shipping_city,
      shipping_state,
      is_pickup,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { error: "Missing required contact information" },
        { status: 400 }
      );
    }

    // Validate shipping info for delivery orders
    if (
      !is_pickup &&
      (!shipping_address || !shipping_city || !shipping_state)
    ) {
      return NextResponse.json(
        { error: "Shipping address is required for delivery" },
        { status: 400 }
      );
    }

    // Get cart
    const cart = await getUserCart(user.id);
    if (cart.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

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

    const total = subtotal;

    // Initialize Paystack payment with metadata
    const paymentData = await initializePayment(email, total, {
      user_id: user.id,
      customer_name: `${firstName} ${lastName}`,
      customer_email: email,
      customer_phone: phone,
      shipping_address,
      shipping_city,
      shipping_state,
      is_pickup,
      cart_items: cart.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        product_name: item.product?.name,
        product_sku: item.product?.sku,
        unit_price: item.product?.discount_price || item.product?.price || 0,
        total_price:
          (item.product?.discount_price || item.product?.price || 0) *
          item.quantity,
      })),
    });

    return NextResponse.json({
      authorization_url: paymentData.data.authorization_url,
      reference: paymentData.data.reference,
      access_code: paymentData.data.access_code,
    });
  } catch (error: any) {
    console.error("Error initializing payment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
