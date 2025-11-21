import { NextResponse } from "next/server";
import { getAvailableTimeSlots } from "@/lib/booking-utils";

/**
 * GET /api/bookings/available-slots?date=YYYY-MM-DD&serviceId=uuid
 * Returns available time slots for a specific date
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const serviceId = searchParams.get("serviceId");

    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required" },
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

    // Get available time slots
    const slots = await getAvailableTimeSlots(date, serviceId || undefined);

    return NextResponse.json({
      date,
      slots,
      count: slots.length,
    });
  } catch (error: any) {
    console.error("Error fetching available slots:", error);
    return NextResponse.json(
      { error: "Failed to fetch available slots", details: error.message },
      { status: 500 }
    );
  }
}
