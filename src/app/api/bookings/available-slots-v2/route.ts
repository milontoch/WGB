/**
 * API Route: GET /api/bookings/available-slots
 *
 * Returns available time slots for a specific date and optional service
 *
 * Query Parameters:
 * - date (required): Date in YYYY-MM-DD format
 * - serviceId (optional): Service ID to filter by staff who can perform the service
 *
 * Response:
 * {
 *   date: string,
 *   slots: TimeSlot[],
 *   count: number
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getAvailableTimeSlots,
  isValidBookingDate,
} from "@/lib/services/time-slot-service";

export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");
    const serviceId = searchParams.get("serviceId") || undefined;

    // Validate required parameters
    if (!date) {
      return NextResponse.json(
        { error: "Missing required parameter: date" },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    // Validate that date is not in the past
    if (!isValidBookingDate(date)) {
      return NextResponse.json(
        { error: "Cannot book appointments in the past" },
        { status: 400 }
      );
    }

    // Fetch available time slots
    const slots = await getAvailableTimeSlots(date, serviceId);

    // Return response
    return NextResponse.json({
      date,
      slots,
      count: slots.filter((slot) => slot.available).length,
    });
  } catch (error) {
    console.error("Error in available-slots API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
