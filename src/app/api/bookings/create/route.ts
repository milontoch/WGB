import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAuthFromRequest } from "@/lib/auth-helpers";
import {
  isSlotAvailable,
  isValidBookingDate,
  formatDate,
  formatTime,
} from "@/lib/booking-utils";
import { sendBookingConfirmationEmail } from "@/lib/email";

/**
 * POST /api/bookings/create
 * Creates a new booking with validation and sends confirmation email
 */
export async function POST(req: Request) {
  try {
    // Require authentication
    const user = await requireAuthFromRequest(req);

    const body = await req.json();
    const { service_id, staff_id, booking_date, booking_time, notes } = body;

    // Validation
    if (!service_id || !staff_id || !booking_date || !booking_time) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: service_id, staff_id, booking_date, booking_time",
        },
        { status: 400 }
      );
    }

    // Validate date is not in the past
    if (!isValidBookingDate(booking_date)) {
      return NextResponse.json(
        { error: "Cannot book appointments in the past" },
        { status: 400 }
      );
    }

    // Check if slot is available
    const available = await isSlotAvailable(
      staff_id,
      booking_date,
      booking_time
    );
    if (!available) {
      return NextResponse.json(
        { error: "This time slot is no longer available" },
        { status: 409 }
      );
    }

    // Get service details
    const { data: service, error: serviceError } = await supabaseAdmin
      .from("services")
      .select("name, price, duration")
      .eq("id", service_id)
      .single();

    if (serviceError || !service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Get staff details
    const { data: staff, error: staffError } = await supabaseAdmin
      .from("staff")
      .select("name, email")
      .eq("id", staff_id)
      .single();

    if (staffError || !staff) {
      return NextResponse.json(
        { error: "Staff member not found" },
        { status: 404 }
      );
    }

    // Get user profile for customer details
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("email, full_name")
      .eq("id", user.id)
      .single();

    const customerEmail = profile?.email || user.email;
    const customerName = profile?.full_name || "Customer";

    // Create booking with all fields from existing schema
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .insert({
        user_id: user.id,
        service_id,
        staff_id,
        booking_date,
        booking_time: booking_time + ":00", // Convert HH:MM to HH:MM:SS
        status: "pending",
        notes: notes || null,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: null, // Can be added later if needed
      })
      .select()
      .single();

    if (bookingError) {
      console.error("Booking creation error:", bookingError);

      // Check for unique constraint violation (double booking)
      if (bookingError.code === "23505") {
        return NextResponse.json(
          {
            error:
              "This time slot was just booked. Please select another time.",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "Failed to create booking", details: bookingError.message },
        { status: 500 }
      );
    }

    // Send confirmation email
    try {
      await sendBookingConfirmationEmail({
        to: customerEmail,
        customerName,
        serviceName: service.name,
        staffName: staff.name,
        date: formatDate(booking_date),
        time: formatTime(booking_time),
        price: service.price,
        notes: notes || "",
        bookingId: booking.id,
      });
    } catch (emailError: any) {
      console.error("Failed to send confirmation email:", emailError);
      // Don't fail the booking if email fails
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        service: service.name,
        staff: staff.name,
        date: booking_date,
        time: booking_time,
        status: booking.status,
      },
      message: "Booking created successfully. Confirmation email sent!",
    });
  } catch (error: any) {
    console.error("Error creating booking:", error);

    if (error.message?.includes("Unauthorized")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
