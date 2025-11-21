// TypeScript script to seed test database

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Load environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials in .env.test");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedDatabase() {
  console.log("🌱 Seeding test database...");

  try {
    // Check if we should use real DB
    if (process.env.TEST_USE_REAL_DB !== "true") {
      console.log("⚠️  TEST_USE_REAL_DB is not true, skipping seed");
      console.log("   Tests will use mocked data instead");
      return;
    }

    // Read and execute SQL seed file
    const sqlPath = path.join(__dirname, "seed-test.sql");
    const sql = fs.readFileSync(sqlPath, "utf-8");

    console.log("📄 Executing seed SQL...");

    // Execute SQL via Supabase RPC or direct query
    // Note: This requires a custom RPC function in Supabase or use of pg client
    // For simplicity, we'll create data via Supabase client

    // Create test services
    console.log("  → Creating services...");
    const { error: servicesError } = await supabase.from("services").upsert([
      {
        id: "service-1",
        name: "Luxury Facial Treatment",
        description: "Deep cleansing and rejuvenating facial",
        duration: 60,
        price: 150.0,
        category: "facial",
        is_active: true,
      },
      {
        id: "service-2",
        name: "Swedish Massage",
        description: "Relaxing full-body massage",
        duration: 90,
        price: 200.0,
        category: "massage",
        is_active: true,
      },
      {
        id: "service-3",
        name: "Luxury Manicure",
        description: "Complete nail care and polish",
        duration: 45,
        price: 80.0,
        category: "nails",
        is_active: true,
      },
    ]);

    if (servicesError) {
      console.error("❌ Error creating services:", servicesError);
    } else {
      console.log("  ✅ Services created");
    }

    // Create test staff
    console.log("  → Creating staff...");
    const { error: staffError } = await supabase.from("staff").upsert([
      {
        id: "staff-1",
        name: "Sarah Johnson",
        email: "sarah@beautystudio.com",
        phone: "+2348011111111",
        role: "therapist",
        specialization: "Facial treatments",
        is_active: true,
      },
      {
        id: "staff-2",
        name: "Emily Davis",
        email: "emily@beautystudio.com",
        phone: "+2348022222222",
        role: "therapist",
        specialization: "Massage therapy",
        is_active: true,
      },
    ]);

    if (staffError) {
      console.error("❌ Error creating staff:", staffError);
    } else {
      console.log("  ✅ Staff created");
    }

    // Create test products
    console.log("  → Creating products...");
    const { error: productsError } = await supabase.from("products").upsert([
      {
        id: "product-1",
        name: "Luxury Face Cream",
        description: "Premium moisturizing face cream with SPF 30",
        price: 89.99,
        stock: 50,
        category: "skincare",
        is_active: true,
      },
      {
        id: "product-2",
        name: "Vitamin C Serum",
        description: "Brightening serum with antioxidants",
        price: 69.99,
        stock: 30,
        category: "skincare",
        is_active: true,
      },
      {
        id: "product-3",
        name: "Hydrating Body Lotion",
        description: "Rich body lotion for all skin types",
        price: 45.0,
        stock: 100,
        category: "bodycare",
        is_active: true,
      },
      {
        id: "product-4",
        name: "Limited Edition Oil",
        description: "Rare essential oil blend",
        price: 120.0,
        stock: 2,
        category: "oils",
        is_active: true,
      },
      {
        id: "product-5",
        name: "Sold Out Mask",
        description: "Popular face mask",
        price: 35.0,
        stock: 0,
        category: "masks",
        is_active: false,
      },
    ]);

    if (productsError) {
      console.error("❌ Error creating products:", productsError);
    } else {
      console.log("  ✅ Products created");
    }

    // Create time slots for next 7 days
    console.log("  → Creating time slots...");
    const timeSlots = [];
    for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
      const date = new Date();
      date.setDate(date.getDate() + dayOffset);

      for (let hour = 9; hour <= 16; hour++) {
        const startTime = new Date(date);
        startTime.setHours(hour, 0, 0, 0);
        const endTime = new Date(startTime);
        endTime.setHours(hour + 1, 0, 0, 0);

        timeSlots.push({
          service_id: "service-1",
          staff_id: "staff-1",
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          is_available: true,
        });
      }
    }

    const { error: slotsError } = await supabase
      .from("time_slots")
      .upsert(timeSlots);

    if (slotsError) {
      console.error("❌ Error creating time slots:", slotsError);
    } else {
      console.log(`  ✅ Created ${timeSlots.length} time slots`);
    }

    console.log("✅ Test database seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Run seed
seedDatabase();
