/**
 * API Route: GET /api/admin/notifications/email-logs
 * Get email logs with filtering options (admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { createClient } from "@supabase/supabase-js";
import {
  getAllEmailLogs,
  getEmailStats,
} from "@/lib/services/notification-service";

// Supabase client with service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const email_type = searchParams.get("email_type") || undefined;
    const status = searchParams.get("status") || undefined;
    const campaign_id = searchParams.get("campaign_id") || undefined;
    const from_date = searchParams.get("from_date") || undefined;
    const to_date = searchParams.get("to_date") || undefined;
    const limit = parseInt(searchParams.get("limit") || "100");
    const include_stats = searchParams.get("include_stats") === "true";

    // Fetch email logs
    const logs = await getAllEmailLogs(
      {
        email_type,
        status,
        campaign_id,
        from_date,
        to_date,
      },
      limit
    );

    // Optionally include statistics
    let stats = null;
    if (include_stats) {
      stats = await getEmailStats();
    }

    return NextResponse.json({
      success: true,
      logs,
      stats,
      count: logs.length,
    });
  } catch (error: any) {
    console.error("Error fetching email logs:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch email logs" },
      { status: 500 }
    );
  }
}
