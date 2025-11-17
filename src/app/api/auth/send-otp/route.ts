import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const OTP_TTL_MINUTES = 10;

export async function POST(req: Request) {
  try {
    const { user_id, purpose, email } = await req.json();

    // Validation
    if (!user_id || !purpose) {
      return NextResponse.json(
        { error: "user_id and purpose required" },
        { status: 400 }
      );
    }

    // Validate purpose
    const validPurposes = ["login", "verify_email", "reset_password"];
    if (!validPurposes.includes(purpose)) {
      return NextResponse.json({ error: "Invalid purpose" }, { status: 400 });
    }

    // Verify user exists
    const { data: user, error: userError } =
      await supabaseAdmin.auth.admin.getUserById(user_id);
    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    // Store OTP in database
    const { error: otpError } = await supabaseAdmin.from("otp_codes").insert({
      user_id: user_id,
      code: otpCode,
      purpose,
      expires_at: expiresAt.toISOString(),
      used: false,
    });

    if (otpError) {
      console.error("Failed to store OTP:", otpError);
      return NextResponse.json(
        { error: "Failed to generate OTP" },
        { status: 500 }
      );
    }

    // Send OTP via email
    try {
      // Dynamically import email helper (server-only)
      const { sendOtpEmail } = await import("@/lib/email");

      const recipientEmail = email || user.user.email;
      if (!recipientEmail) {
        console.error("No email address available for OTP delivery");
        return NextResponse.json(
          { error: "No email address provided" },
          { status: 400 }
        );
      }

      await sendOtpEmail(recipientEmail, otpCode, purpose);
      console.log(`✅ OTP email sent to ${recipientEmail}`);
    } catch (emailError: any) {
      console.error("Failed to send OTP email:", emailError);

      // In development, log the code to console as fallback
      if (process.env.NODE_ENV === "development") {
        console.log(`
          ========================================
          OTP CODE FOR USER ${user_id} (Email failed)
          Code: ${otpCode}
          Purpose: ${purpose}
          Expires: ${expiresAt.toLocaleString()}
          Error: ${emailError.message}
          ========================================
        `);
      } else {
        // In production, fail the request if email can't be sent
        return NextResponse.json(
          {
            error:
              "Failed to send OTP email. Please check email configuration.",
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      message: "OTP sent successfully",
      // Only return the code in development for testing
      ...(process.env.NODE_ENV === "development" && { dev_code: otpCode }),
    });
  } catch (error: any) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
