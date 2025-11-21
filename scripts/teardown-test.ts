// TypeScript script to clean up test database

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.test" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials in .env.test");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function teardownDatabase() {
  console.log("🧹 Cleaning up test database...");

  try {
    // Check if we should use real DB
    if (process.env.TEST_USE_REAL_DB !== "true") {
      console.log("⚠️  TEST_USE_REAL_DB is not true, skipping teardown");
      return;
    }

    // Delete in reverse order of dependencies
    console.log("  → Deleting bookings...");
    const { error: bookingsError } = await supabase
      .from("bookings")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

    if (bookingsError) {
      console.error("❌ Error deleting bookings:", bookingsError);
    }

    console.log("  → Deleting time slots...");
    const { error: slotsError } = await supabase
      .from("time_slots")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (slotsError) {
      console.error("❌ Error deleting time slots:", slotsError);
    }

    console.log("  → Deleting order items...");
    const { error: orderItemsError } = await supabase
      .from("order_items")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (orderItemsError) {
      console.error("❌ Error deleting order items:", orderItemsError);
    }

    console.log("  → Deleting orders...");
    const { error: ordersError } = await supabase
      .from("orders")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (ordersError) {
      console.error("❌ Error deleting orders:", ordersError);
    }

    console.log("  → Deleting cart items...");
    const { error: cartError } = await supabase
      .from("cart_items")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (cartError) {
      console.error("❌ Error deleting cart items:", cartError);
    }

    console.log("  → Deleting email logs...");
    const { error: emailLogsError } = await supabase
      .from("email_logs")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (emailLogsError) {
      console.error("❌ Error deleting email logs:", emailLogsError);
    }

    console.log("  → Deleting products...");
    const { error: productsError } = await supabase
      .from("products")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (productsError) {
      console.error("❌ Error deleting products:", productsError);
    }

    console.log("  → Deleting services...");
    const { error: servicesError } = await supabase
      .from("services")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (servicesError) {
      console.error("❌ Error deleting services:", servicesError);
    }

    console.log("  → Deleting staff...");
    const { error: staffError } = await supabase
      .from("staff")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (staffError) {
      console.error("❌ Error deleting staff:", staffError);
    }

    // Note: We don't delete auth users as they are managed by Supabase Auth
    // Test users should be created/deleted via Auth API

    console.log("✅ Test database cleaned up successfully");
  } catch (error) {
    console.error("❌ Error cleaning database:", error);
    process.exit(1);
  }
}

// Run teardown
teardownDatabase();
