# Modern Beauty Studio - Backend System Documentation

## 🏗️ Architecture Overview

This is a complete, production-ready backend system for the Modern Beauty Studio booking platform. Built with **Next.js 14 App Router**, **Supabase (PostgreSQL)**, **Supabase Auth**, and **Gmail SMTP**.

---

## 📂 Directory Structure

```
src/
├── app/api/bookings/                    # API Routes
│   ├── available-slots-v2/route.ts      # GET available time slots
│   ├── create-v2/route.ts               # POST create booking
│   ├── user/route.ts                    # GET user's bookings
│   └── cancel/route.ts                  # DELETE/PATCH cancel booking
│
├── lib/
│   ├── supabase/                        # Supabase Configuration
│   │   ├── config.ts                    # Environment validation + TypeScript types
│   │   ├── admin.ts                     # Admin client (service role)
│   │   ├── client.ts                    # Client-side Supabase client
│   │   └── server.ts                    # Server-side Supabase client
│   │
│   ├── database/                        # Database Layer
│   │   └── booking-queries.ts           # All Supabase queries (CRUD operations)
│   │
│   ├── services/                        # Business Logic Layer
│   │   ├── time-slot-service.ts         # Time slot generation & availability
│   │   └── email-service.ts             # Transactional emails via Gmail SMTP
│   │
│   ├── middleware/                      # API Middleware
│   │   └── auth.ts                      # Authentication helpers
│   │
│   └── utils/                           # Utilities
│       ├── validation.ts                # Input validation
│       └── error-handling.ts            # Error handling & logging
```

---

## 🔌 API Endpoints

### 1️⃣ **GET /api/bookings/available-slots-v2**

Fetch available time slots for a specific date.

**Query Parameters:**

- `date` (required): Date in `YYYY-MM-DD` format
- `serviceId` (optional): Filter by service

**Response:**

```json
{
  "date": "2025-11-25",
  "slots": [
    {
      "time": "09:00",
      "available": true,
      "staffId": "uuid-here",
      "staffName": "Sarah Johnson"
    }
  ],
  "count": 12
}
```

**Features:**

- ✅ Validates date format
- ✅ Prevents past dates
- ✅ Queries `availability` table by day of week
- ✅ Generates 30-minute intervals
- ✅ Excludes already booked slots
- ✅ Returns slots grouped by staff

---

### 2️⃣ **POST /api/bookings/create-v2**

Create a new booking (requires authentication).

**Request Body:**

```json
{
  "service_id": "uuid",
  "staff_id": "uuid",
  "booking_date": "2025-11-25",
  "booking_time": "09:00",
  "notes": "Optional notes"
}
```

**Response:**

```json
{
  "success": true,
  "booking": {
    "id": "uuid",
    "customer_name": "John Doe",
    "booking_date": "2025-11-25",
    "booking_time": "09:00:00",
    "status": "pending"
  },
  "message": "Booking created successfully!"
}
```

**Security & Validation:**

- ✅ **Authentication required** (Supabase Auth)
- ✅ Validates all required fields
- ✅ Checks service exists and is active
- ✅ Checks staff exists and is active
- ✅ Validates date is not in the past
- ✅ Validates time format (HH:MM)
- ✅ **Prevents double-booking** (unique constraint on `staff_id, date, time`)
- ✅ Fetches user profile for customer details
- ✅ Sends confirmation email asynchronously

**Database Transaction:**

```sql
INSERT INTO bookings (
  user_id,
  customer_name,
  customer_email,
  service_id,
  staff_id,
  booking_date,
  booking_time,
  status,
  notes
) VALUES (...);
```

**Unique Constraint:** Prevents race conditions

```sql
CREATE UNIQUE INDEX bookings_unique_slot
  ON bookings (staff_id, booking_date, booking_time)
  WHERE staff_id IS NOT NULL;
```

---

### 3️⃣ **GET /api/bookings/user**

Fetch all bookings for the authenticated user.

**Response:**

```json
{
  "bookings": [
    {
      "id": "uuid",
      "booking_date": "2025-11-25",
      "booking_time": "09:00:00",
      "status": "pending",
      "service": {
        "name": "Signature Haircut",
        "price": 85.0
      },
      "staff": {
        "name": "Sarah Johnson"
      }
    }
  ]
}
```

**Features:**

- ✅ Authentication required
- ✅ Joins with `services` and `staff` tables
- ✅ Sorted by date (newest first)

---

### 4️⃣ **DELETE /api/bookings/cancel** (or PATCH)

Cancel a booking.

**Request Body:**

```json
{
  "booking_id": "uuid"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Booking cancelled successfully"
}
```

**Authorization:**

- ✅ User must own the booking
- ✅ Cannot cancel past bookings
- ✅ Updates status to `cancelled`
- ✅ Sends cancellation email

---

## 📧 Email System

### Configuration (`.env.local`)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="Beauty Studio" <your-email@gmail.com>
```

### Email Templates

#### 1. **Booking Confirmation**

- Beautiful HTML with pink gradient header
- Booking details table
- Service, staff, date, time, price
- Booking reference ID
- Minimal Luxury styling

#### 2. **Cancellation Notice**

- Simple notification
- Cancelled appointment details

**Error Handling:**

- Emails sent asynchronously (won't block booking creation)
- Errors logged but don't fail the transaction

---

## 🗄️ Database Schema

### Tables Used

#### `services`

```sql
id UUID PRIMARY KEY
name TEXT NOT NULL
description TEXT
price DECIMAL(10,2)
duration INT (minutes)
category TEXT
is_active BOOLEAN
image_url TEXT
```

#### `staff`

```sql
id UUID PRIMARY KEY
name TEXT NOT NULL
role TEXT
email TEXT
phone TEXT
active BOOLEAN
```

#### `availability`

```sql
id UUID PRIMARY KEY
staff_id UUID → staff(id)
day_of_week INT (0=Sunday, 6=Saturday)
start_time TIME
end_time TIME
```

#### `bookings`

```sql
id UUID PRIMARY KEY
user_id UUID (Supabase Auth)
customer_name TEXT
customer_email TEXT
customer_phone TEXT
service_id UUID → services(id)
staff_id UUID → staff(id)
booking_date DATE
booking_time TIME
status TEXT (pending, confirmed, completed, cancelled)
notes TEXT
created_at TIMESTAMP
updated_at TIMESTAMP

UNIQUE INDEX: (staff_id, booking_date, booking_time)
```

---

## 🔐 Authentication Flow

### How It Works

1. **User Login**: Supabase Auth (email/password or OTP)
2. **Session Management**: Cookies handled automatically
3. **API Protection**: All booking endpoints check `supabase.auth.getUser()`
4. **User Linking**: `bookings.user_id` → `auth.users.id`

### Authentication Middleware

```typescript
import { requireAuth } from "@/lib/middleware/auth";

const { authenticated, user } = await requireAuth(request);
if (!authenticated) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

---

## ⚙️ Business Logic

### Time Slot Generation

```typescript
// 1. Get day of week from date
const dayOfWeek = new Date(date).getDay(); // 0-6

// 2. Query availability table
SELECT * FROM availability
WHERE staff_id = ? AND day_of_week = ?;

// 3. Generate 30-min intervals
function generateTimeSlots(start_time, end_time) {
  // Returns: ["09:00", "09:30", "10:00", ...]
}

// 4. Exclude booked slots
SELECT booking_time FROM bookings
WHERE staff_id = ? AND booking_date = ?
AND status IN ('pending', 'confirmed');

// 5. Return available slots
return slots.filter(slot => !bookedTimes.has(slot));
```

### Double-Booking Prevention

**Strategy: Database Unique Constraint**

```sql
CREATE UNIQUE INDEX bookings_unique_slot
  ON bookings (staff_id, booking_date, booking_time)
  WHERE staff_id IS NOT NULL;
```

**Why This Works:**

- ✅ Atomic at database level (no race conditions)
- ✅ Returns `23505` error code if duplicate
- ✅ Faster than application-level locks
- ✅ Works across multiple server instances

**Error Handling:**

```typescript
if (error.code === "23505") {
  return "This time slot is no longer available";
}
```

---

## 🧪 Testing Guide

### 1. Test Available Slots API

```bash
curl "http://localhost:3000/api/bookings/available-slots-v2?date=2025-11-25"
```

### 2. Test Create Booking

```bash
curl -X POST http://localhost:3000/api/bookings/create-v2 \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=YOUR_TOKEN" \
  -d '{
    "service_id": "uuid",
    "staff_id": "uuid",
    "booking_date": "2025-11-25",
    "booking_time": "09:00",
    "notes": "Test booking"
  }'
```

### 3. Test Double-Booking Prevention

- Create two identical bookings simultaneously
- Second one should fail with "slot unavailable" error

---

## 🚀 Deployment Checklist

### Environment Variables

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`

### Database

- [ ] Run `supabase-schema.sql`
- [ ] Run `supabase-staff-schema.sql`
- [ ] Create sample services and staff
- [ ] Set up availability records

### Security

- [ ] Enable RLS on all tables
- [ ] Verify authentication on all routes
- [ ] Test authorization (user can only cancel own bookings)

---

## 📊 Error Handling

All errors follow standardized format:

```json
{
  "error": "Human-readable message",
  "code": "ERROR_CODE",
  "timestamp": "2025-11-20T10:30:00Z"
}
```

**Error Codes:**

- `UNAUTHORIZED` - Not logged in
- `SLOT_UNAVAILABLE` - Time slot taken
- `DOUBLE_BOOKING` - Duplicate booking attempt
- `PAST_DATE` - Date is in the past
- `SERVICE_NOT_FOUND` - Invalid service ID

---

## 🔧 Extending the System

### Add New Service Type

1. Insert into `services` table
2. No code changes needed

### Add Staff Availability

```sql
INSERT INTO availability (staff_id, day_of_week, start_time, end_time)
VALUES ('uuid', 1, '09:00:00', '17:00:00'); -- Monday 9 AM - 5 PM
```

### Change Time Slot Intervals

Edit `generateTimeSlots()` in `time-slot-service.ts`:

```typescript
currentMinutes += 30; // Change to 15, 60, etc.
```

---

## 📝 TypeScript Types

All types defined in `src/lib/supabase/config.ts`:

```typescript
interface Service { ... }
interface Staff { ... }
interface Availability { ... }
interface Booking { ... }
```

---

## 🎯 Key Features

✅ **Zero Race Conditions** - Database-level locking  
✅ **Fully Typed** - End-to-end TypeScript  
✅ **Transactional Emails** - Beautiful HTML templates  
✅ **Authentication** - Supabase Auth integration  
✅ **Validation** - Comprehensive input validation  
✅ **Error Handling** - Standardized error responses  
✅ **Logging** - Detailed error logs for debugging  
✅ **Scalable** - Supports multiple staff & services

---

## 🆘 Troubleshooting

### "Authentication required" error

→ Check if user is logged in, verify cookies

### "Slot unavailable" error

→ Another user booked it first (expected behavior)

### Email not sending

→ Check SMTP credentials, verify Gmail "App Password" used

### Database connection error

→ Verify `SUPABASE_SERVICE_ROLE_KEY` is correct

---

**System Status:** ✅ Production Ready  
**Last Updated:** November 20, 2025
