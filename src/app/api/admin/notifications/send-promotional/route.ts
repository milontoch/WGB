/**
 * API Route: POST /api/admin/notifications/send-promotional
 * Send promotional/bulk emails to all users or specific segments
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { createClient } from "@supabase/supabase-js";
import { sendBulkEmails } from "@/lib/services/notification-service";
import { getPromotionalTemplate } from "@/lib/services/email-templates";

// Supabase client with service role for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key"
);

export async function POST(request: NextRequest) {
  try {
    // Authenticate and verify admin role
    const authResult = await requireAuth(request);

    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", authResult.user.id)
      .single();

    if (userError || userData?.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      subject,
      heading,
      message,
      ctaText,
      ctaLink,
      imageUrl,
      discountCode,
      campaignId,
      targetAudience, // 'all', 'customers', 'booking_users'
    } = body;

    // Validate required fields
    if (!subject || !heading || !message || !campaignId) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: subject, heading, message, campaignId",
        },
        { status: 400 }
      );
    }

    // Fetch target users based on audience
    let recipients: Array<{ email: string; user_id: string; name: string }> =
      [];

    if (targetAudience === "all" || !targetAudience) {
      // Get all users
      const { data: users, error } = await supabase
        .from("users")
        .select("id, email, first_name, last_name")
        .not("email", "is", null);

      if (error) {
        console.error("Failed to fetch users:", error);
        return NextResponse.json(
          { error: "Failed to fetch users" },
          { status: 500 }
        );
      }

      recipients = users.map((user) => ({
        email: user.email,
        user_id: user.id,
        name: user.first_name
          ? `${user.first_name} ${user.last_name || ""}`.trim()
          : "Valued Customer",
      }));
    } else if (targetAudience === "customers") {
      // Get users who have made orders
      const { data: orderUsers, error } = await supabase
        .from("orders")
        .select(
          `
          user_id,
          users!orders_user_id_fkey(id, email, first_name, last_name)
        `
        )
        .not("user_id", "is", null);

      if (error) {
        console.error("Failed to fetch order users:", error);
        return NextResponse.json(
          { error: "Failed to fetch customers" },
          { status: 500 }
        );
      }

      // Deduplicate users
      const uniqueUsers = new Map();
      orderUsers.forEach((order: any) => {
        if (order.users && !uniqueUsers.has(order.users.id)) {
          uniqueUsers.set(order.users.id, {
            email: order.users.email,
            user_id: order.users.id,
            name: order.users.first_name
              ? `${order.users.first_name} ${
                  order.users.last_name || ""
                }`.trim()
              : "Valued Customer",
          });
        }
      });

      recipients = Array.from(uniqueUsers.values());
    } else if (targetAudience === "booking_users") {
      // Get users who have made bookings
      const { data: bookingUsers, error } = await supabase
        .from("bookings")
        .select(
          `
          user_id,
          users!bookings_user_id_fkey(id, email, first_name, last_name)
        `
        )
        .not("user_id", "is", null);

      if (error) {
        console.error("Failed to fetch booking users:", error);
        return NextResponse.json(
          { error: "Failed to fetch booking users" },
          { status: 500 }
        );
      }

      // Deduplicate users
      const uniqueUsers = new Map();
      bookingUsers.forEach((booking: any) => {
        if (booking.users && !uniqueUsers.has(booking.users.id)) {
          uniqueUsers.set(booking.users.id, {
            email: booking.users.email,
            user_id: booking.users.id,
            name: booking.users.first_name
              ? `${booking.users.first_name} ${
                  booking.users.last_name || ""
                }`.trim()
              : "Valued Customer",
          });
        }
      });

      recipients = Array.from(uniqueUsers.values());
    }

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: "No recipients found for selected audience" },
        { status: 400 }
      );
    }

    console.log(`Sending promotional email to ${recipients.length} recipients`);

    // Generate email template
    const { html, text } = getPromotionalTemplate({
      customerName: "{{name}}", // Will be replaced per recipient
      subject,
      heading,
      message,
      ctaText,
      ctaLink,
      imageUrl,
      discountCode,
    });

    // Send bulk emails
    const result = await sendBulkEmails(
      recipients,
      subject,
      html,
      text,
      campaignId
    );

    return NextResponse.json({
      success: true,
      campaign_id: campaignId,
      total_recipients: recipients.length,
      emails_sent: result.successCount,
      emails_failed: result.failedEmails.length,
      failed_emails: result.failedEmails,
      message: `Promotional email sent to ${result.successCount}/${recipients.length} recipients`,
    });
  } catch (error: any) {
    console.error("Error sending promotional email:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send promotional email" },
      { status: 500 }
    );
  }
}
