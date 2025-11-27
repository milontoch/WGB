/**
 * API Route: GET /api/payment/verify?reference=xxx
 * Verify Paystack payment and create order
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import {
  verifyPayment,
  convertKoboToNaira,
} from "@/lib/services/paystack-service";
import { createOrder, clearCart } from "@/lib/database/product-queries";
import { sendOrderConfirmationEmail } from "@/lib/services/email-service";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await requireAuth(request);

    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = authResult.user;

    const searchParams = request.nextUrl.searchParams;
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { error: "Payment reference is required" },
        { status: 400 }
      );
    }

    console.log("Verifying payment with reference:", reference);

    // Verify payment with Paystack
    const verification = await verifyPayment(reference);

    console.log("Paystack verification response:", verification);

    if (!verification.status || verification.data.status !== "success") {
      return NextResponse.json(
        {
          success: false,
          error: "Payment verification failed",
          payment: verification,
        },
        { status: 400 }
      );
    }

    // Extract metadata from payment
    const metadata = verification.data.metadata;
    const cartItems = metadata.cart_items || [];

    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: "No items found in payment metadata" },
        { status: 400 }
      );
    }

    // Calculate amounts
    const subtotal = cartItems.reduce((sum: number, item: any) => {
      return sum + (item.total_price || item.unit_price * item.quantity);
    }, 0);

    const totalAmount = convertKoboToNaira(verification.data.amount);

    // Create order in database
    const order = await createOrder(
      {
        user_id: user.id,
        total_amount: totalAmount,
        subtotal: subtotal,
        discount_amount: subtotal - totalAmount,
        payment_status: "paid",
        order_status: "pending",
        payment_reference: reference,
        customer_name: metadata.customer_name || user.email,
        customer_email: metadata.customer_email || user.email,
        customer_phone: metadata.customer_phone || null,
        shipping_address: metadata.shipping_address || null,
        shipping_city: metadata.shipping_city || null,
        shipping_state: metadata.shipping_state || null,
        is_pickup: metadata.is_pickup || false,
        notes: null,
      },
      cartItems
    );

    if (!order) {
      throw new Error("Failed to create order");
    }

    console.log("Order created successfully:", order.id);

    // Clear user's cart after successful order
    await clearCart(user.id);

    console.log("Cart cleared for user:", user.id);

    // Send order confirmation email
    try {
      await sendOrderConfirmationEmail({
        to: metadata.customer_email || user.email,
        customerName: metadata.customer_name || user.email,
        order: {
          id: order.id,
          total: totalAmount,
          subtotal: subtotal,
          discount: subtotal - totalAmount,
          created_at: order.created_at,
        },
        items: cartItems.map((item: any) => ({
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price || item.unit_price * item.quantity,
        })),
        shipping: {
          is_pickup: metadata.is_pickup,
          address: metadata.shipping_address,
          city: metadata.shipping_city,
          state: metadata.shipping_state,
        },
      });

      console.log("Order confirmation email sent");
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Don't fail the order if email fails
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        total: totalAmount,
        status: order.order_status,
        created_at: order.created_at,
      },
      message: "Payment verified and order created successfully",
    });
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}
