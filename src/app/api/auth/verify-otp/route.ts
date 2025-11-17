import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const { user_id, purpose, code } = await req.json();

    // Validation
    if (!user_id || !purpose || !code) {
      return NextResponse.json(
        { error: "Missing required parameters: user_id, purpose, code" },
        { status: 400 }
      );
    }

    // Find valid OTP (not used, not expired, matching user/purpose/code)
    const { data: otpRecords, error: fetchError } = await supabaseAdmin
      .from("otp_codes")
      .select("*")
      .eq("user_id", user_id)
      .eq("purpose", purpose)
      .eq("code", code)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString()) // expires_at must be > now()
      .order("created_at", { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error("OTP fetch error:", fetchError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // Check if valid OTP found
    if (!otpRecords || otpRecords.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired code" },
        { status: 400 }
      );
    }

    const otpRecord = otpRecords[0];

    // Mark OTP as used
    const { error: updateError } = await supabaseAdmin
      .from("otp_codes")
      .update({ used: true })
      .eq("id", otpRecord.id);

    if (updateError) {
      console.error("OTP update error:", updateError);
      return NextResponse.json(
        { error: "Failed to mark OTP as used" },
        { status: 500 }
      );
    }

    // Get user details for response
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", user_id)
      .single();

    // Success - OTP verified
    return NextResponse.json({
      ok: true,
      message: "OTP verified successfully",
      user: profile
        ? {
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            role: profile.role,
          }
        : null,
    });
  } catch (error: any) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
