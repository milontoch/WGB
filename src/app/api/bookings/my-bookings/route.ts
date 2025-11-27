import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAuthFromRequest } from "@/lib/auth-helpers";

export async function GET(request: Request) {
  try {
    // Require authentication
    const user = await requireAuthFromRequest(request);
    const userId = user.id;

    // Fetch user's bookings with service and staff details
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
        service:services (
          id,
          name,
          description,
          price,
          duration,
          category
        ),
        staff (
          id,
          name,
          role
        )
      `
      )
      .eq("user_id", userId)
      .order("booking_date", { ascending: false })
      .order("booking_time", { ascending: false });

    if (error) {
      console.error("Error fetching bookings:", error);
      return NextResponse.json(
        { error: "Failed to fetch bookings" },
        { status: 500 }
      );
    }

    return NextResponse.json({ bookings: bookings || [] });
  } catch (error: any) {
    console.error("Error in my-bookings route:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
