import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    // Verify requesting user is admin (throws if not)
    const admin = await requireAdmin();

    const { target_user_id, role } = await req.json();

    // Validation
    if (!target_user_id || !role) {
      return NextResponse.json(
        { error: "Missing required parameters: target_user_id, role" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ["admin", "provider", "customer"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be admin, provider, or customer" },
        { status: 400 }
      );
    }

    // Update the target user's role using admin client
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ role })
      .eq("id", target_user_id);

    if (updateError) {
      console.error("Role update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update user role" },
        { status: 500 }
      );
    }

    // Get updated profile
    const { data: updatedProfile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", target_user_id)
      .single();

    return NextResponse.json({
      ok: true,
      message: `Role updated to ${role} by admin ${admin.email}`,
      user: updatedProfile,
    });
  } catch (error: any) {
    // Handle auth errors (Unauthorized/Forbidden)
    if (error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.message.includes("Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    console.error("Set role error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
