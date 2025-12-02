/**
 * API Route: POST /api/cron/test-reminder
 * Test endpoint to manually trigger booking reminders (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { createClient } from "@supabase/supabase-js";
import { sendAllBookingReminders } from "@/lib/services/booking-notifications";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key"
);

export async function POST(request: NextRequest) {
  try {
    // Authenticate and verify admin role
    const authResult = await requireAuth(request);

    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", authResult.user.id)
      .single();

    if (userError || userData?.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    console.log("Admin manually triggering booking reminders...");

    // Send all booking reminders
    const result = await sendAllBookingReminders();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      total_bookings: result.total,
      reminders_sent: result.sent,
      reminders_failed: result.failed,
      message: `Sent ${result.sent} reminders out of ${result.total} bookings`,
    });
  } catch (error: any) {
    console.error("Error testing booking reminders:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send booking reminders" },
      { status: 500 }
    );
  }
}
