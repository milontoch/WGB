/**
 * API Route: DELETE /api/bookings/cancel
 *
 * Cancels a booking and sends cancellation email
 *
 * Required: User must be authenticated and own the booking
 *
 * Request Body:
 * {
 *   booking_id: string
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   message: string
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cancelBooking, getServiceById } from "@/lib/database/booking-queries";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendCancellationEmail } from "@/lib/services/email-service";

export async function DELETE(request: NextRequest) {
  try {
    // 1. AUTHENTICATION CHECK
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // 2. PARSE REQUEST BODY
    const body = await request.json();
    const { booking_id } = body;

    // 3. VALIDATE REQUIRED FIELDS
    if (!booking_id) {
      return NextResponse.json(
        { error: "Missing required field: booking_id" },
        { status: 400 }
      );
    }

    // 4. FETCH BOOKING DETAILS FOR EMAIL
    const { data: booking, error: fetchError } = await supabaseAdmin
      .from("bookings")
      .select("*, service:services(*)")
      .eq("id", booking_id)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // 5. CANCEL BOOKING
    const result = await cancelBooking(booking_id, user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to cancel booking" },
        { status: 400 }
      );
    }

    // 6. SEND CANCELLATION EMAIL
    // This is done asynchronously and won't block the response
    if (booking.service && booking.customer_email) {
      sendCancellationEmail({
        to: booking.customer_email,
        customerName: booking.customer_name,
        service: booking.service,
        booking,
      }).catch((error) => {
        console.error("Failed to send cancellation email:", error);
      });
    }

    // 7. RETURN SUCCESS RESPONSE
    return NextResponse.json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("Error in cancel booking API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Alternative: PATCH method for cancellation
 * Some clients prefer PATCH over DELETE for status updates
 */
export async function PATCH(request: NextRequest) {
  return DELETE(request);
}
