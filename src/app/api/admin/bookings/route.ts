/**
 * API Route: GET /api/admin/bookings
 * Fetch all bookings with optional filters
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/middleware/auth";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const serviceId = searchParams.get("serviceId");
    const staffId = searchParams.get("staffId");

    let query = supabaseAdmin
      .from("bookings")
      .select(
        `
        *,
        service:services(name),
        staff:staff(name),
        user:profiles(full_name, email)
      `
      )
      .order("booking_date", { ascending: false })
      .order("booking_time", { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }
    if (startDate) {
      query = query.gte("booking_date", startDate);
    }
    if (endDate) {
      query = query.lte("booking_date", endDate);
    }
    if (serviceId) {
      query = query.eq("service_id", serviceId);
    }
    if (staffId) {
      query = query.eq("staff_id", staffId);
    }

    const { data: bookings, error } = await query;

    if (error) {
      console.error("Error fetching bookings:", error);
      return NextResponse.json(
        { error: "Failed to fetch bookings" },
        { status: 500 }
      );
    }

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Error in admin bookings API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
