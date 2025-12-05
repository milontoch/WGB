import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAuthFromRequest } from "@/lib/auth-helpers";

export async function POST(request: Request) {
  try {
    // Require authentication
    const user = await requireAuthFromRequest(request);

    // Update user role to admin
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating role:", error);
      return NextResponse.json(
        { error: "Failed to set admin role" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Admin role granted successfully"
    });
  } catch (error: any) {
    console.error("Admin setup error:", error);
    return NextResponse.json(
      { error: error.message || "Authentication required" },
      { status: 401 }
    );
  }
}