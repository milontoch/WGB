/**
 * API Route: GET /api/admin/dashboard/stats
 * Returns dashboard statistics for admin panel
 */

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get start of week
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    // Format dates for SQL
    const todayStr = today.toISOString().split("T")[0];
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    const weekStartStr = startOfWeek.toISOString().split("T")[0];

    // Fetch today's bookings
    const { count: todayBookings } = await supabaseAdmin
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("booking_date", todayStr)
      .in("status", ["pending", "confirmed"]);

    // Fetch this week's bookings
    const { count: weekBookings } = await supabaseAdmin
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .gte("booking_date", weekStartStr)
      .in("status", ["pending", "confirmed"]);

    // Fetch total active services
    const { count: totalServices } = await supabaseAdmin
      .from("services")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    // Fetch active staff
    const { count: activeStaff } = await supabaseAdmin
      .from("staff")
      .select("*", { count: "exact", head: true })
      .eq("active", true);

    // Fetch pending bookings
    const { count: pendingBookings } = await supabaseAdmin
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    return NextResponse.json({
      todayBookings: todayBookings || 0,
      weekBookings: weekBookings || 0,
      totalServices: totalServices || 0,
      activeStaff: activeStaff || 0,
      pendingBookings: pendingBookings || 0,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
