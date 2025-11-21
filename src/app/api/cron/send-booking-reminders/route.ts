/**
 * API Route: GET /api/cron/send-booking-reminders
 * Cron job to send booking reminders for appointments tomorrow
 *
 * This endpoint should be called daily (e.g., via Vercel Cron Jobs or external scheduler)
 * Recommended time: Run daily at 9:00 AM
 *
 * Setup with Vercel Cron:
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/send-booking-reminders",
 *     "schedule": "0 9 * * *"
 *   }]
 * }
 *
 * Or use external cron service like cron-job.org, EasyCron, etc.
 * URL: https://yourdomain.com/api/cron/send-booking-reminders
 */

import { NextRequest, NextResponse } from "next/server";
import { sendAllBookingReminders } from "@/lib/services/booking-notifications";

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization");
    const cronSecret =
      process.env.CRON_SECRET || "default-secret-change-in-production";

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error("Unauthorized cron job access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Starting booking reminder cron job...");

    // Send all booking reminders
    const result = await sendAllBookingReminders();

    console.log("Booking reminder cron job completed:", result);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      total_bookings: result.total,
      reminders_sent: result.sent,
      reminders_failed: result.failed,
      message: `Sent ${result.sent} reminders out of ${result.total} bookings`,
    });
  } catch (error: any) {
    console.error("Error in booking reminder cron job:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to send booking reminders",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}
