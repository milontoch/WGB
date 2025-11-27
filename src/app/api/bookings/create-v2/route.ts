/**
 * API Route: POST /api/bookings/create
 *
 * Creates a new booking with validation and sends confirmation email
 *
 * Required: User must be authenticated
 *
 * Request Body:
 * {
 *   service_id: string,
 *   staff_id: string,
 *   booking_date: string (YYYY-MM-DD),
 *   booking_time: string (HH:MM),
 *   notes?: string
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   booking?: Booking,
 *   message: string
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createBooking,
  getServiceById,
  getStaffById,
  isTimeSlotAvailable,
  getUserProfile,
} from "@/lib/database/booking-queries";
import { sendBookingConfirmationEmail } from "@/lib/services/email-service";
import { isValidBookingDate } from "@/lib/services/time-slot-service";

export async function POST(request: NextRequest) {
  try {
    // 1. AUTHENTICATION CHECK
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error:
            "Authentication required. Please log in to book an appointment.",
        },
        { status: 401 }
      );
    }

    // 2. PARSE REQUEST BODY
    const body = await request.json();
    const {
      service_id,
      staff_id,
      booking_date,
      booking_time,
      notes = null,
    } = body;

    // 3. VALIDATE REQUIRED FIELDS
    if (!service_id || !staff_id || !booking_date || !booking_time) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: service_id, staff_id, booking_date, booking_time",
          missing: {
            service_id: !service_id,
            staff_id: !staff_id,
            booking_date: !booking_date,
            booking_time: !booking_time,
          },
        },
        { status: 400 }
      );
    }

    // 4. VALIDATE DATE FORMAT AND FUTURE DATE
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(booking_date)) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    if (!isValidBookingDate(booking_date)) {
      return NextResponse.json(
        { error: "Cannot book appointments in the past" },
        { status: 400 }
      );
    }

    // 5. VALIDATE TIME FORMAT (HH:MM)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(booking_time)) {
      return NextResponse.json(
        { error: "Invalid time format. Use HH:MM (24-hour format)" },
        { status: 400 }
      );
    }

    // 6. FETCH SERVICE DETAILS
    const service = await getServiceById(service_id);
    if (!service) {
      return NextResponse.json(
        { error: "Service not found or inactive" },
        { status: 404 }
      );
    }

    // 7. FETCH STAFF DETAILS
    const staff = await getStaffById(staff_id);
    if (!staff) {
      return NextResponse.json(
        { error: "Staff member not found or inactive" },
        { status: 404 }
      );
    }

    // 8. CHECK TIME SLOT AVAILABILITY
    // Convert HH:MM to HH:MM:SS for database
    const bookingTimeWithSeconds = `${booking_time}:00`;

    const isAvailable = await isTimeSlotAvailable(
      staff_id,
      booking_date,
      bookingTimeWithSeconds
    );

    if (!isAvailable) {
      return NextResponse.json(
        {
          error:
            "This time slot is no longer available. Please select another time.",
        },
        { status: 409 }
      );
    }

    // 9. GET USER PROFILE FOR CUSTOMER DETAILS
    const profile = await getUserProfile(user.id);
    const customerName =
      profile?.full_name || user.email?.split("@")[0] || "Guest";
    const customerEmail = user.email || "";

    // 10. CREATE BOOKING IN DATABASE
    const bookingResult = await createBooking({
      user_id: user.id,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: profile?.phone || null,
      service_id,
      staff_id,
      booking_date,
      booking_time: bookingTimeWithSeconds,
      notes,
    });

    // 11. CHECK IF BOOKING CREATION FAILED
    if (!bookingResult.success || !bookingResult.booking) {
      return NextResponse.json(
        { error: bookingResult.error || "Failed to create booking" },
        { status: 500 }
      );
    }

    // 12. SEND CONFIRMATION EMAIL
    // Note: Email sending is done asynchronously and won't block the response
    // If email fails, booking is still created
    sendBookingConfirmationEmail({
      to: customerEmail,
      customerName,
      service,
      staff,
      booking: bookingResult.booking,
    }).catch((error) => {
      // Log email error but don't fail the booking
      console.error("Failed to send confirmation email:", error);
    });

    // 13. RETURN SUCCESS RESPONSE
    return NextResponse.json({
      success: true,
      booking: bookingResult.booking,
      message:
        "Booking created successfully! A confirmation email has been sent.",
    });
  } catch (error) {
    console.error("Error in create booking API:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
