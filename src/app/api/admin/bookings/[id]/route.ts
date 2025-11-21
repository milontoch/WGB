/**
 * API Route: PATCH /api/admin/bookings/[id]
 * Update booking status or details
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/middleware/auth";
import {
  sendBookingConfirmationEmail,
  sendCancellationEmail,
} from "@/lib/services/email-service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookingId = params.id;
    const body = await request.json();

    // Update booking
    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .update(body)
      .eq("id", bookingId)
      .select(
        `
        *,
        service:services(name, price, duration),
        staff:staff(name),
        user:profiles(full_name, email)
      `
      )
      .single();

    if (error) {
      console.error("Error updating booking:", error);
      return NextResponse.json(
        { error: "Failed to update booking" },
        { status: 500 }
      );
    }

    // Send email if status changed to confirmed or cancelled
    if (body.status === "confirmed" && booking.user?.email) {
      sendBookingConfirmationEmail({
        to: booking.user.email,
        customerName: booking.user.full_name || booking.customer_name,
        service: {
          name: booking.service?.name || "",
          price: booking.service?.price || 0,
        } as any,
        staff: {
          name: booking.staff?.name || "",
        } as any,
        booking: {
          date: booking.booking_date,
          time: booking.booking_time,
          id: booking.id,
        } as any,
      }).catch((err) =>
        console.error("Error sending confirmation email:", err)
      );
    }

    if (body.status === "cancelled" && booking.user?.email) {
      sendCancellationEmail({
        to: booking.user.email,
        customerName: booking.user.full_name || booking.customer_name,
        service: {
          name: booking.service?.name || "",
        } as any,
        booking: {
          date: booking.booking_date,
          time: booking.booking_time,
        } as any,
      }).catch((err) =>
        console.error("Error sending cancellation email:", err)
      );
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error("Error in update booking API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
