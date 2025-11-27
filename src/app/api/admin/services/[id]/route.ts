/**
 * API Route: PATCH/DELETE /api/admin/services/[id]
 * Update or delete individual service
 */

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/middleware/auth";

// PATCH - Update service
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: serviceId } = await params;
    const body = await request.json();

    // Update service
    const { data: service, error } = await supabaseAdmin
      .from("services")
      .update(body)
      .eq("id", serviceId)
      .select()
      .single();

    if (error) {
      console.error("Error updating service:", error);
      return NextResponse.json(
        { error: "Failed to update service" },
        { status: 500 }
      );
    }

    return NextResponse.json({ service });
  } catch (error) {
    console.error("Error in update service API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete service
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: serviceId } = await params;

    // Delete service
    const { error } = await supabaseAdmin
      .from("services")
      .delete()
      .eq("id", serviceId);

    if (error) {
      console.error("Error deleting service:", error);
      return NextResponse.json(
        { error: "Failed to delete service" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in delete service API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
