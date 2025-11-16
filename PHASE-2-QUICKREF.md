# 🎯 PHASE 2 - Quick Reference

## ⚡ Quick Setup (5 Minutes)

### 1. Install Dependencies

```powershell
npm install
```

### 2. Create Supabase Project

- Visit: https://supabase.com → New Project
- Save your Project URL and anon key

### 3. Run Database Schema

- Supabase Dashboard → SQL Editor → New Query
- Copy/paste ALL content from `supabase-schema.sql`
- Click Run

### 4. Configure Environment

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
```

### 5. Test Connection

```powershell
npm run dev
```

Open: `http://localhost:3000/test-supabase`

---

## 📁 Files Created

| File                                          | Purpose                                               |
| --------------------------------------------- | ----------------------------------------------------- |
| `src/lib/supabase/client.ts`                  | Client-side Supabase (use in 'use client' components) |
| `src/lib/supabase/server.ts`                  | Server-side Supabase (use in Server Components)       |
| `src/lib/supabase/middleware.ts`              | Auth middleware helper                                |
| `src/lib/actions/bookings.ts`                 | Server Actions for database operations                |
| `src/app/test-supabase/page.tsx`              | Test page for verification                            |
| `src/app/test-supabase/test-booking-form.tsx` | Test booking form                                     |
| `supabase-schema.sql`                         | Database schema (services + bookings)                 |
| `.env.local`                                  | Your Supabase credentials (NOT in git)                |
| `.env.local.example`                          | Example env file                                      |

---

## 🔧 Available Server Actions

```typescript
import {
  getServices, // Get all active services
  getServiceById, // Get single service
  getServicesByCategory, // Get services by category
  createBooking, // Create new booking
  getBookings, // Get all bookings
  getBookingsByEmail, // Get bookings by email
  updateBookingStatus, // Update booking status
  deleteBooking, // Delete a booking
} from "@/lib/actions/bookings";
```

---

## 💾 Database Tables

### `services` Table

- `id` - UUID (primary key)
- `name` - Service name
- `description` - Service description
- `price` - Decimal (10,2)
- `duration` - Integer (minutes)
- `category` - Category name
- `is_active` - Boolean
- `created_at`, `updated_at` - Timestamps

**Sample Data Included:** 6 beauty services

### `bookings` Table

- `id` - UUID (primary key)
- `customer_name` - Customer name
- `customer_email` - Email
- `customer_phone` - Phone (optional)
- `service_id` - Foreign key to services
- `booking_date` - Date
- `booking_time` - Time
- `status` - pending/confirmed/completed/cancelled
- `notes` - Text (optional)
- `created_at`, `updated_at` - Timestamps

---

## 🚀 Usage Examples

### Server Component (fetch data)

```typescript
import { getServices } from "@/lib/actions/bookings";

export default async function Page() {
  const { data: services } = await getServices();
  return <div>{services?.map((s) => s.name)}</div>;
}
```

### Client Component (submit form)

```typescript
"use client";
import { createBooking } from "@/lib/actions/bookings";

export function Form() {
  async function submit(formData: FormData) {
    await createBooking({
      /* ... */
    });
  }
  return <form action={submit}>...</form>;
}
```

---

## 🔐 Row Level Security (RLS)

RLS is **enabled** for security. Policies included:

- ✅ Public can view active services
- ✅ Anyone can create bookings
- ✅ Users can view their own bookings (by email)
- ✅ Authenticated users have full access (admin)

---

## ✅ Verification Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Supabase project created
- [ ] SQL schema executed successfully
- [ ] `.env.local` configured with real credentials
- [ ] Dev server restarted
- [ ] Test page shows green "connected" status
- [ ] 6 sample services displayed
- [ ] Test booking created successfully

---

## 📚 Full Documentation

See **`PHASE-2-SETUP.md`** for detailed instructions and troubleshooting.

---

## 🆘 Quick Troubleshooting

| Problem          | Solution                              |
| ---------------- | ------------------------------------- |
| Module not found | Run `npm install`                     |
| Connection error | Check `.env.local` and restart server |
| No services      | Run SQL schema in Supabase            |
| RLS errors       | Verify policies in Supabase Auth      |

---

**Phase 2 Complete!** Your beauty services app now has full database integration. 🎉
