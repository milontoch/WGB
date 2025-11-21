/**
 * API Route: GET /api/bookings/user
 *
 * Returns all bookings for the authenticated user
 *
 * Required: User must be authenticated
 *
 * Response:
 * {
 *   bookings: Booking[]
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    // 1. AUTHENTICATION CHECK
    const supabase = await createServerClient();
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

    // 2. FETCH USER'S BOOKINGS WITH RELATED DATA
    // Using Supabase's query builder to join with services and staff
    const { data: bookings, error } = await supabaseAdmin
      .from("bookings")
      .select(
        `
        id,
        booking_date,
        booking_time,
        status,
        notes,
        customer_name,
        customer_email,
        customer_phone,
        created_at,
        updated_at,
        service:services (
          id,
          name,
          description,
          price,
          duration,
          category,
          image_url
        ),
        staff (
          id,
          name,
          role,
          email,
          phone
        )
      `
      )
      .eq("user_id", user.id)
      .order("booking_date", { ascending: false })
      .order("booking_time", { ascending: false });

    if (error) {
      console.error("Error fetching user bookings:", error);
      return NextResponse.json(
        { error: "Failed to fetch bookings" },
        { status: 500 }
      );
    }

    // 3. RETURN BOOKINGS
    return NextResponse.json({
      bookings: bookings || [],
    });
  } catch (error) {
    console.error("Error in user bookings API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
