/**
 * API Route: GET /api/services/[id]
 * Fetches a single service by ID
 * Used by the booking form to display service details
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: serviceId } = params;

    // Fetch service from database
    const { data: service, error } = await supabaseAdmin
      .from("services")
      .select("*")
      .eq("id", serviceId)
      .eq("is_active", true)
      .single();

    if (error || !service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error("Error in service detail API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
