# Admin Panel Documentation

Complete admin panel for the Modern Beauty Studio booking system, providing full management capabilities for services, bookings, staff, and system monitoring.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Pages & Routes](#pages--routes)
4. [API Endpoints](#api-endpoints)
5. [Authentication](#authentication)
6. [Components](#components)
7. [Usage Guide](#usage-guide)

---

## 🎯 Overview

The admin panel provides a comprehensive interface for managing all aspects of the beauty booking system:

- **Dashboard** - Real-time statistics and quick actions
- **Services Management** - CRUD operations for services
- **Bookings Management** - View, confirm, and manage appointments
- **Email Automation** - Automatic notifications on status changes

### Design Theme

Follows the **Minimal Luxury** theme:

- Clean white backgrounds
- Pink accent colors (#ec4899, #f9a8d4, #fce7f3)
- Playfair Display for headings
- Rounded corners and subtle shadows

---

## ✨ Features

### Dashboard (`/admin`)

- **Real-time Stats**:
  - Today's bookings count
  - This week's bookings count
  - Active services total
  - Active staff count
  - Pending bookings alert
- **Quick Actions**:
  - Add new service
  - View bookings
- **Smart Navigation**:
  - Sticky header with section links
  - User email display
  - "View Site" link to frontend

### Services Management (`/admin/services`)

- **List View**:
  - Service name and description
  - Category badges
  - Price and duration display
  - Active/Inactive status toggle
  - Delete functionality
- **Create Service** (`/admin/services/new`):
  - Form with validation
  - Fields: name*, description, price*, duration\*, category, image URL, active status
  - Category dropdown (Hair, Skincare, Makeup, Spa, Nails, Other)
  - 15-minute duration increments
- **Features**:
  - Toggle active/inactive (updates database immediately)
  - Delete with confirmation
  - Empty state with CTA
  - Real-time updates

### Bookings Management (`/admin/bookings`)

- **List View**:
  - Customer name and email
  - Service and staff assignment
  - Date and time display
  - Status badges (pending, confirmed, completed, cancelled)
  - Action buttons based on status
- **Filtering**:
  - By status (all, pending, confirmed, completed, cancelled)
  - Real-time filter updates
- **Status Management**:
  - **Pending** → Confirm or Cancel
  - **Confirmed** → Complete or Cancel
  - Sends automatic emails on status change
- **Email Automation**:
  - Confirmation email when booking confirmed
  - Cancellation email when booking cancelled
  - Uses existing email-service.ts templates

---

## 📄 Pages & Routes

### Admin Layout (`src/app/admin/layout.tsx`)

**Type**: Client Component  
**Purpose**: Wrapper for all admin pages with authentication and navigation

**Features**:

- Authentication check using `useAuth()` hook
- Redirects to `/auth/login?redirect=/admin` if not authenticated
- Sticky navigation header with:
  - Dashboard, Services, Bookings links
  - Active page highlighting (pink-600)
  - User email display
  - "View Site" link
- Loading state with spinner
- Gray-50 background for content area

**Code Structure**:

```tsx
useEffect(() => {
  if (!loading && !user) {
    router.push("/auth/login?redirect=/admin");
  }
}, [user, loading, router]);
```

---

### Dashboard Page (`src/app/admin/page.tsx`)

**Type**: Client Component  
**API**: `GET /api/admin/dashboard/stats`

**State**:

```tsx
interface DashboardStats {
  todayBookings: number;
  weekBookings: number;
  totalServices: number;
  activeStaff: number;
  pendingBookings: number;
}
```

**UI Components**:

1. **Stat Cards** (4 cards):

   - Today's Bookings (pink-50 bg, pink-600 text)
   - This Week (purple-50 bg, purple-600 text)
   - Active Services (blue-50 bg, blue-600 text)
   - Active Staff (green-50 bg, green-600 text)

2. **Pending Bookings Alert** (conditional):

   - Shows only if pendingBookings > 0
   - Yellow-50 background with warning icon
   - "View Bookings" CTA button

3. **Quick Action Cards** (2 cards):
   - Add Service (✨ icon) → `/admin/services/new`
   - View Bookings (📅 icon) → `/admin/bookings`

**Error Handling**:

- Loading spinner during fetch
- ErrorMessage component for failures
- Graceful fallbacks (stats default to 0)

---

### Services List (`src/app/admin/services/page.tsx`)

**Type**: Client Component  
**APIs**:

- `GET /api/admin/services` - Fetch all services
- `PATCH /api/admin/services/[id]` - Toggle active status
- `DELETE /api/admin/services/[id]` - Delete service

**State**:

```tsx
const [services, setServices] = useState<Service[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [deletingId, setDeletingId] = useState<string | null>(null);
```

**Table Columns**:

1. **Service** - Name + description (line-clamp-1)
2. **Category** - Pink badge (or "—" if none)
3. **Price** - Formatted as $XX.XX
4. **Duration** - In minutes
5. **Status** - Clickable toggle button (green-100 active, gray-100 inactive)
6. **Actions** - Delete button (red-600)

**Functions**:

```tsx
toggleActive(id, currentStatus); // PATCH request, updates local state
deleteService(id); // DELETE with confirmation, removes from state
```

**Empty State**:

- Shows message with "Create your first service →" link

---

### New Service Form (`src/app/admin/services/new/page.tsx`)

**Type**: Client Component  
**API**: `POST /api/admin/services`

**Form Fields**:

- **name** (required): Text input
- **description**: Textarea (4 rows)
- **price** (required): Number input (step=0.01, min=0)
- **duration** (required): Number input (step=15, min=15)
- **category**: Select dropdown (Hair/Skincare/Makeup/Spa/Nails/Other)
- **image_url**: URL input (optional)
- **is_active**: Checkbox (defaults to true)

**Validation**:

- Client-side: HTML5 required attributes
- Server-side: API validates required fields

**Success Behavior**:

- Redirects to `/admin/services` on success
- Shows error message on failure

**UI**:

- Max-width of 2xl for form container
- Pink gradient submit button
- Gray cancel button (navigates back)
- All inputs use rounded-xl and pink-500 focus rings

---

### Bookings List (`src/app/admin/bookings/page.tsx`)

**Type**: Client Component  
**APIs**:

- `GET /api/admin/bookings?status=X` - Fetch bookings with filter
- `PATCH /api/admin/bookings/[id]` - Update booking status

**State**:

```tsx
const [bookings, setBookings] = useState<Booking[]>([]);
const [statusFilter, setStatusFilter] = useState<string>("all");
const [updatingId, setUpdatingId] = useState<string | null>(null);
```

**Filter Options**:

- All Statuses (default)
- Pending
- Confirmed
- Completed
- Cancelled

**Table Columns**:

1. **Customer** - Name + email (from user profile or booking fields)
2. **Service** - Service name
3. **Staff** - Staff name
4. **Date & Time** - Formatted date + time
5. **Status** - Colored badge
6. **Actions** - Dynamic buttons based on status

**Status Colors**:

```tsx
pending: yellow - 100 / yellow - 800;
confirmed: green - 100 / green - 800;
completed: blue - 100 / blue - 800;
cancelled: red - 100 / red - 800;
```

**Action Buttons**:

- **Pending**: Confirm (green) | Cancel (red)
- **Confirmed**: Complete (blue) | Cancel (red)
- **Completed/Cancelled**: No actions

**Functions**:

```tsx
updateStatus(id, newStatus) {
  // Shows confirmation dialog
  // PATCH request to /api/admin/bookings/[id]
  // Updates local state
  // Triggers email automation (server-side)
}
```

**Date Formatting**:

```tsx
formatDate(date); // Returns "Mon, Nov 18, 2025"
```

---

## 🔌 API Endpoints

### Dashboard Stats

**Route**: `GET /api/admin/dashboard/stats`  
**File**: `src/app/api/admin/dashboard/stats/route.ts`  
**Auth**: Required (`requireAuth()`)

**Logic**:

1. Calculate date ranges:
   - Today: 00:00:00 to 23:59:59
   - Week start: Current week's first day (day_of_week 0)
2. Query database:
   - `todayBookings`: Count bookings where date=today AND status IN (pending, confirmed)
   - `weekBookings`: Count bookings where date>=weekStart
   - `totalServices`: Count where is_active=true
   - `activeStaff`: Count where active=true
   - `pendingBookings`: Count where status=pending

**Response**:

```json
{
  "todayBookings": 5,
  "weekBookings": 23,
  "totalServices": 12,
  "activeStaff": 4,
  "pendingBookings": 3
}
```

---

### Services CRUD

#### List/Create Services

**Route**: `GET/POST /api/admin/services`  
**File**: `src/app/api/admin/services/route.ts`  
**Auth**: Required

**GET**:

- Returns all services (including inactive)
- Ordered by created_at DESC

**POST Body**:

```json
{
  "name": "Signature Haircut",
  "description": "Professional cut and style",
  "price": 85.0,
  "duration": 60,
  "category": "Hair",
  "image_url": "https://...",
  "is_active": true
}
```

**Validation**:

- name, price, duration are required
- price parsed as float
- duration parsed as int

---

#### Update/Delete Service

**Route**: `PATCH/DELETE /api/admin/services/[id]`  
**File**: `src/app/api/admin/services/[id]/route.ts`  
**Auth**: Required

**PATCH Body** (partial update):

```json
{
  "is_active": false
}
```

**DELETE**:

- No body required
- Returns `{ "success": true }`

---

### Bookings Management

#### List Bookings

**Route**: `GET /api/admin/bookings`  
**File**: `src/app/api/admin/bookings/route.ts`  
**Auth**: Required

**Query Parameters** (all optional):

- `status`: pending | confirmed | cancelled | completed
- `startDate`: YYYY-MM-DD
- `endDate`: YYYY-MM-DD
- `serviceId`: UUID
- `staffId`: UUID

**Response** (with joins):

```json
{
  "bookings": [
    {
      "id": "uuid",
      "booking_date": "2025-11-20",
      "booking_time": "10:00",
      "status": "pending",
      "customer_name": "John Doe",
      "customer_email": "john@example.com",
      "service": { "name": "Haircut" },
      "staff": { "name": "Sarah" },
      "user": { "full_name": "John Doe", "email": "john@example.com" }
    }
  ]
}
```

**Joins**:

- `service:services(name)`
- `staff:staff(name)`
- `user:profiles(full_name, email)`

**Ordering**:

- booking_date DESC
- booking_time DESC

---

#### Update Booking

**Route**: `PATCH /api/admin/bookings/[id]`  
**File**: `src/app/api/admin/bookings/[id]/route.ts`  
**Auth**: Required

**Body**:

```json
{
  "status": "confirmed"
}
```

**Email Automation**:

- If `status === 'confirmed'`: Sends confirmation email
- If `status === 'cancelled'`: Sends cancellation email
- Uses `sendBookingConfirmationEmail()` and `sendCancellationEmail()` from `email-service.ts`

**Email Data**:

- Fetches full booking with joins (service, staff, user)
- Uses customer name from user profile or booking fields
- Includes service price, date, time, booking ID

---

## 🔐 Authentication

### Admin Access Control

**Middleware**: `requireAuth()` from `src/lib/middleware/auth.ts`

**How It Works**:

1. Creates Supabase client from request cookies
2. Gets authenticated user via `getUser()`
3. Returns `{ authenticated: boolean, user: User | null }`
4. All admin API routes check authentication
5. Admin layout redirects to `/auth/login?redirect=/admin` if not authenticated

**Implementation in API Routes**:

```tsx
const auth = await requireAuth(request);
if (!auth.authenticated) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

**Frontend Auth Check** (Admin Layout):

```tsx
const { user, loading } = useAuth();

useEffect(() => {
  if (!loading && !user) {
    router.push("/auth/login?redirect=/admin");
  }
}, [user, loading, router]);
```

### Notes:

- No role-based access control (all authenticated users have admin access)
- Can add `requireRole('admin')` for production use
- Redirect parameter preserves intended destination

---

## 🧩 Components

### Reused UI Components

All from `src/components/ui/`:

**LoadingSpinner** (`loading.tsx`):

- Pink-600 spinner animation
- Used in: Dashboard, Services, Bookings pages

**ErrorMessage** (`error.tsx`):

- Red-50 background with red-800 text
- Used in: All admin pages for error states

**Service** (from `config.ts`):

```tsx
interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number; // minutes
  category?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

---

## 📖 Usage Guide

### Setting Up the Admin Panel

1. **Authentication**:

   - Users must be logged in to access `/admin`
   - On first visit, redirects to `/auth/login?redirect=/admin`
   - After login, automatically redirects back

2. **Managing Services**:

   - Navigate to `/admin/services`
   - Click "+ Add Service" to create new
   - Toggle active/inactive by clicking status badge
   - Delete services with confirmation dialog

3. **Managing Bookings**:

   - Navigate to `/admin/bookings`
   - Use status filter dropdown to view specific types
   - Click action buttons to update booking status
   - Emails sent automatically on status changes

4. **Monitoring Dashboard**:
   - Visit `/admin` to see real-time stats
   - Yellow alert shows if pending bookings exist
   - Quick action cards for common tasks

### Common Workflows

**Workflow 1: Confirm a Pending Booking**

1. Go to `/admin/bookings`
2. Filter by "Pending" status
3. Review booking details
4. Click "Confirm" button
5. Customer receives confirmation email automatically

**Workflow 2: Add a New Service**

1. Go to `/admin/services`
2. Click "+ Add Service"
3. Fill in required fields (name, price, duration)
4. Select category (optional)
5. Set active status (checked by default)
6. Click "Create Service"
7. Redirected to services list

**Workflow 3: Temporarily Disable a Service**

1. Go to `/admin/services`
2. Find service in table
3. Click green "Active" badge in Status column
4. Badge changes to gray "Inactive"
5. Service no longer appears in customer booking flow

### Testing the Admin Panel

1. **Create Test Service**:

   ```
   Name: Test Haircut
   Price: 50.00
   Duration: 30
   Category: Hair
   Active: Yes
   ```

2. **Create Test Booking** (via customer flow):

   - Visit `/services`
   - Select test service
   - Book appointment

3. **Manage Test Booking**:

   - Go to `/admin/bookings`
   - Find test booking (status: pending)
   - Click "Confirm"
   - Check email for confirmation message

4. **Verify Stats**:
   - Return to `/admin`
   - Today's bookings should increment
   - Pending bookings should decrement

---

## 🎨 Styling Conventions

### Color Palette

**Status Colors**:

- Pending: `bg-yellow-100 text-yellow-800`
- Confirmed: `bg-green-100 text-green-800`
- Completed: `bg-blue-100 text-blue-800`
- Cancelled: `bg-red-100 text-red-800`
- Error: `bg-red-50 text-red-800`

**Interactive Elements**:

- Primary buttons: `bg-gradient-to-r from-pink-500 to-pink-600`
- Hover: `hover:from-pink-600 hover:to-pink-700`
- Links: `text-pink-600 hover:text-pink-700`
- Focus rings: `focus:ring-2 focus:ring-pink-500`

**Layout**:

- Border radius: `rounded-xl` (12px)
- Card borders: `border border-gray-200`
- Backgrounds: `bg-white` (cards), `bg-gray-50` (page)
- Shadows: `shadow-md` for elevated cards

### Typography

- **Headings**: `font-serif` (Playfair Display)
  - H1: `text-4xl`
  - H2: `text-2xl`
- **Body**: Default (Inter)
  - Regular: `text-sm` or `text-base`
  - Labels: `text-xs uppercase tracking-wider`

---

## 🚀 Deployment Checklist

- [x] All admin pages created
- [x] API routes with authentication
- [x] Email automation integrated
- [x] Loading and error states
- [x] Responsive design (mobile-friendly)
- [x] Form validation
- [ ] Add role-based access control (optional)
- [ ] Add pagination for bookings list (for high volume)
- [ ] Add date range filters for bookings
- [ ] Add export functionality (CSV/PDF)

---

## 📝 Future Enhancements

1. **Staff Management** (`/admin/staff`):

   - CRUD for staff members
   - Assign roles and permissions
   - Manage availability schedules

2. **Availability Management** (`/admin/availability`):

   - Set recurring weekly schedules per staff
   - Override specific dates (holidays, time off)
   - Visual calendar interface

3. **Analytics** (`/admin/analytics`):

   - Revenue reports
   - Popular services
   - Booking trends
   - Customer retention metrics

4. **Customer Management** (`/admin/customers`):

   - View customer profiles
   - Booking history
   - Customer notes
   - Communication log

5. **Settings** (`/admin/settings`):
   - Business hours
   - Booking policies
   - Email templates
   - Payment configuration

---

## 🐛 Troubleshooting

### Issue: "Unauthorized" Error on API Calls

**Solution**:

- Ensure user is logged in
- Check Supabase session is active
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set

### Issue: Stats Not Updating

**Solution**:

- Refresh page (stats fetch on mount only)
- Check `/api/admin/dashboard/stats` endpoint directly
- Verify Supabase queries in API route

### Issue: Email Not Sending

**Solution**:

- Check `EMAIL_USER` and `EMAIL_PASS` environment variables
- Verify Gmail SMTP is enabled
- Check server logs for email errors (errors are logged but don't block booking)

### Issue: Delete Service Fails

**Solution**:

- Check if service has existing bookings (foreign key constraint)
- Consider soft delete (set is_active=false) instead
- Or implement cascade delete in database schema

---

## 📚 Related Documentation

- [Backend README](./BACKEND-README.md) - Database queries and business logic
- [Frontend README](./FRONTEND-README.md) - Customer-facing booking flow
- [Email Setup](./EMAIL-SETUP.md) - Email configuration guide

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Author**: Modern Beauty Studio Development Team
