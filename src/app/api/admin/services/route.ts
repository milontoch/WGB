/**
 * API Route: GET/POST /api/admin/services
 * Manages services for admin panel
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/middleware/auth";

// GET all services (including inactive)
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: services, error } = await supabaseAdmin
      .from("services")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching services:", error);
      return NextResponse.json(
        { error: "Failed to fetch services" },
        { status: 500 }
      );
    }

    return NextResponse.json({ services });
  } catch (error) {
    console.error("Error in admin services API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new service
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      price,
      duration,
      category,
      image_url,
      is_active,
    } = body;

    // Validation
    if (!name || !price || !duration) {
      return NextResponse.json(
        { error: "Missing required fields: name, price, duration" },
        { status: 400 }
      );
    }

    // Insert service
    const { data: service, error } = await supabaseAdmin
      .from("services")
      .insert({
        name,
        description: description || null,
        price: parseFloat(price),
        duration: parseInt(duration),
        category: category || null,
        image_url: image_url || null,
        is_active: is_active !== undefined ? is_active : true,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating service:", error);
      return NextResponse.json(
        { error: "Failed to create service" },
        { status: 500 }
      );
    }

    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    console.error("Error in create service API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
