# 🚀 PHASE 2: Supabase Integration Setup Guide

## 📋 Table of Contents

1. [Installation Steps](#installation-steps)
2. [Supabase Project Setup](#supabase-project-setup)
3. [Database Schema Setup](#database-schema-setup)
4. [Environment Configuration](#environment-configuration)
5. [Testing Supabase](#testing-supabase)
6. [Project Structure](#project-structure)
7. [Usage Examples](#usage-examples)
8. [Troubleshooting](#troubleshooting)

---

## 1️⃣ Installation Steps

### Install Supabase Packages

```powershell
npm install @supabase/supabase-js @supabase/ssr
```

### Install Required Dependencies (if not already installed)

```powershell
npm install clsx tailwind-merge tailwindcss-animate
```

---

## 2️⃣ Supabase Project Setup

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click **"New Project"**
4. Fill in:
   - Project name: `beauty-services` (or your choice)
   - Database password: (Save this securely!)
   - Region: Choose closest to you
5. Click **"Create new project"**
6. Wait 2-3 minutes for setup to complete

### Step 2: Get Your Project Credentials

1. In your Supabase dashboard, click **"Settings"** (gear icon)
2. Click **"API"** in the sidebar
3. Copy these values:
   - **Project URL** (under "Project URL")
   - **anon public key** (under "Project API keys")

---

## 3️⃣ Database Schema Setup

### Step 1: Open SQL Editor

1. In Supabase dashboard, click **"SQL Editor"** in sidebar
2. Click **"New query"**

### Step 2: Run the Schema SQL

1. Open the file: `supabase-schema.sql` (in your project root)
2. Copy ALL the SQL code
3. Paste it into the Supabase SQL Editor
4. Click **"Run"** (or press F5)
5. You should see: **"Success. No rows returned"**

### Step 3: Verify Tables Created

1. Click **"Table Editor"** in sidebar
2. You should see two tables:
   - ✅ `services` (with 6 sample services)
   - ✅ `bookings` (empty, ready for bookings)

---

## 4️⃣ Environment Configuration

### Step 1: Update .env.local

1. Open `.env.local` in your project root
2. Replace the placeholder values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here
```

**Example:**

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 2: Restart Development Server

```powershell
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

**⚠️ IMPORTANT:** Next.js only reads environment variables on startup!

---

## 5️⃣ Testing Supabase

### Method 1: Test Page

1. Start your dev server: `npm run dev`
2. Navigate to: `http://localhost:3000/test-supabase`
3. You should see:
   - ✅ Connection status (green = success)
   - List of 6 sample services
   - A booking form

### Method 2: Create a Test Booking

1. On the test page, fill out the booking form:
   - Customer Name: `Test User`
   - Email: `test@example.com`
   - Phone: `123-456-7890`
   - Service: Select any service
   - Date: Tomorrow's date
   - Time: Any time
2. Click **"Create Test Booking"**
3. You should see: "Booking created successfully!"

### Method 3: Verify in Supabase

1. Go to Supabase → **"Table Editor"**
2. Click the **`bookings`** table
3. You should see your test booking!

---

## 6️⃣ Project Structure

```
WGB/
├── src/
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts          # Client-side Supabase (use in 'use client' components)
│   │   │   ├── server.ts          # Server-side Supabase (use in Server Components)
│   │   │   └── middleware.ts      # Middleware helper (for auth)
│   │   └── actions/
│   │       └── bookings.ts        # Server Actions for database operations
│   └── app/
│       └── test-supabase/
│           ├── page.tsx            # Test page (Server Component)
│           └── test-booking-form.tsx # Test form (Client Component)
├── .env.local                      # Your Supabase credentials (NOT committed to git)
├── .env.local.example              # Example env file (safe to commit)
└── supabase-schema.sql             # Database schema
```

---

## 7️⃣ Usage Examples

### ✅ Server Component (Recommended for data fetching)

```typescript
import { getServices } from "@/lib/actions/bookings";

export default async function ServicesPage() {
  const { data: services, error } = await getServices();

  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {services?.map((service) => (
        <div key={service.id}>{service.name}</div>
      ))}
    </div>
  );
}
```

### ✅ Client Component (for forms and interactivity)

```typescript
"use client";

import { createBooking } from "@/lib/actions/bookings";
import { useState } from "react";

export function BookingForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const result = await createBooking({
      customer_name: formData.get("name") as string,
      customer_email: formData.get("email") as string,
      service_id: formData.get("service_id") as string,
      booking_date: formData.get("date") as string,
      booking_time: formData.get("time") as string,
    });
    setLoading(false);
  }

  return <form action={handleSubmit}>...</form>;
}
```

### ✅ Direct Supabase Client Usage

```typescript
// In a Server Component
import { createClient } from "@/lib/supabase/server";

const supabase = await createClient();
const { data } = await supabase.from("services").select("*");
```

```typescript
// In a Client Component
"use client";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();
const { data } = await supabase.from("services").select("*");
```

---

## 8️⃣ Troubleshooting

### ❌ "Cannot find module '@supabase/ssr'"

**Solution:** Run `npm install` to install dependencies:

```powershell
npm install
```

### ❌ Connection Error / No Services Found

**Solution:**

1. Verify `.env.local` has correct credentials
2. Restart dev server: Stop (Ctrl+C) and `npm run dev`
3. Check Supabase project is active (not paused)
4. Verify SQL schema was run successfully

### ❌ "Error: relation 'services' does not exist"

**Solution:**

1. Go to Supabase SQL Editor
2. Run the complete SQL from `supabase-schema.sql`
3. Verify tables appear in Table Editor

### ❌ RLS Policy Errors

**Solution:**
The schema includes Row Level Security policies. For testing:

1. Go to Supabase → Authentication → Policies
2. Verify policies are enabled for `services` and `bookings`
3. For development, you can temporarily disable RLS (not recommended for production):
   ```sql
   ALTER TABLE services DISABLE ROW LEVEL SECURITY;
   ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
   ```

### ❌ CORS Errors

**Solution:**
Supabase should automatically allow requests from localhost. If you see CORS errors:

1. Go to Supabase → Settings → API
2. Check "API Settings" → "CORS Origins"
3. Ensure `http://localhost:3000` is allowed

---

## 🎯 Next Steps

Now that Supabase is integrated, you can:

1. **Build Real Booking Pages**

   - Create `/app/booking/page.tsx` using the test page as reference
   - Add service selection and availability checking

2. **Add Authentication**

   - Use Supabase Auth for user login
   - Create admin dashboard for managing bookings

3. **Add E-Commerce**

   - Create `products` table
   - Build shopping cart functionality
   - Integrate payment processing

4. **Enhance Features**
   - Add image uploads (Supabase Storage)
   - Email notifications for bookings
   - Calendar integration

---

## 📚 Useful Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## ✅ Phase 2 Checklist

- [ ] Supabase project created
- [ ] Database schema executed
- [ ] Environment variables configured
- [ ] Test page shows green connection status
- [ ] Sample services are displayed
- [ ] Test booking created successfully
- [ ] Booking appears in Supabase Table Editor

**Once all checkboxes are complete, Phase 2 is done! 🎉**
