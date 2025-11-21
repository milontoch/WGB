# Modern Beauty Studio - Frontend Documentation

## 🎨 Frontend Architecture Overview

Complete, production-ready frontend for the booking system built with **Next.js 14 App Router**, **TypeScript**, **Tailwind CSS**, and **Supabase Auth**.

---

## 📂 Frontend Structure

```
src/
├── app/
│   ├── services/                        # Service Pages
│   │   ├── page.tsx                     # Services listing (Server Component)
│   │   └── [id]/page.tsx                # Service detail page (Server Component)
│   │
│   ├── book/[serviceId]/                # Booking Pages
│   │   └── page.tsx                     # Booking form (Client Component)
│   │
│   ├── booking/                         # User Bookings
│   │   └── page.tsx                     # Booking history & management
│   │
│   └── api/services/[id]/               # Helper API
│       └── route.ts                     # GET service by ID
│
├── components/
│   ├── service-card.tsx                 # Service display card
│   └── ui/
│       ├── loading.tsx                  # Loading spinners
│       └── error.tsx                    # Error messages
│
└── contexts/
    └── auth-context.tsx                 # Supabase Auth context
```

---

## 🎯 Pages & Components

### 1️⃣ **Services Listing Page** (`/services`)

**Type:** Server Component (data fetched on server)

**Features:**

- ✅ Fetches all active services from Supabase
- ✅ Responsive grid layout (1 col mobile, 2 tablet, 3 desktop)
- ✅ Service cards with hover effects
- ✅ Empty state handling
- ✅ Category badges
- ✅ Minimal Luxury styling

**Data Fetching:**

```typescript
const { data } = await supabaseAdmin
  .from("services")
  .select("*")
  .eq("is_active", true)
  .order("category");
```

**UI Components:**

- Header with gradient background
- Grid of ServiceCard components
- Call-to-action section

---

### 2️⃣ **Service Detail Page** (`/services/[id]`)

**Type:** Server Component

**Features:**

- ✅ Dynamic route with service ID
- ✅ Fetches single service from database
- ✅ 404 handling with `notFound()`
- ✅ Large image display (or emoji fallback)
- ✅ Service info grid (duration, price)
- ✅ "Book This Service" CTA button
- ✅ Breadcrumb navigation
- ✅ "What to Expect" checklist

**Data Fetching:**

```typescript
const { data } = await supabaseAdmin
  .from("services")
  .select("*")
  .eq("id", serviceId)
  .eq("is_active", true)
  .single();
```

---

### 3️⃣ **Booking Form Page** (`/book/[serviceId]`)

**Type:** Client Component (interactive)

**Features:**

- ✅ **Authentication Required** - Redirects to login if not authenticated
- ✅ **Date Picker** - Prevents past dates, max 90 days ahead
- ✅ **Dynamic Time Slots** - Fetches from API when date changes
- ✅ **Real-time Availability** - Shows only available slots
- ✅ **Staff Assignment** - Displays staff name with each slot
- ✅ **Form Validation** - Required fields, error messages
- ✅ **Loading States** - Spinners during API calls
- ✅ **Success Confirmation** - Shows confirmation before redirect
- ✅ **Notes Field** - Optional 500-character notes

**API Integration Flow:**

```typescript
// 1. Fetch service details on mount
GET /api/services/[id]
→ Display service info

// 2. When user selects date
GET /api/bookings/available-slots-v2?date=YYYY-MM-DD&serviceId=uuid
→ Display available time slots

// 3. When user submits form
POST /api/bookings/create-v2
Body: {
  service_id,
  staff_id,
  booking_date,
  booking_time,
  notes
}
→ Show success message
→ Redirect to /booking
```

**State Management:**

```typescript
// Service data
const [service, setService] = useState<Service | null>(null);

// Form state
const [selectedDate, setSelectedDate] = useState("");
const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
const [notes, setNotes] = useState("");

// UI state
const [loadingSlots, setLoadingSlots] = useState(false);
const [submitting, setSubmitting] = useState(false);
const [error, setError] = useState("");
const [success, setSuccess] = useState(false);
```

**Validation:**

- Date must be today or future (within 90 days)
- Time slot must be selected
- Staff ID must exist (comes with slot)
- Notes limited to 500 characters

**Error Handling:**

- Network errors → Display error message with retry option
- Slot unavailable → Show specific error
- Validation errors → Highlight required fields
- Authentication errors → Redirect to login

---

### 4️⃣ **Bookings History Page** (`/booking`)

**Type:** Client Component

**Features:**

- ✅ Lists all user bookings (past & upcoming)
- ✅ Status badges (pending, confirmed, completed, cancelled)
- ✅ Booking details in cards
- ✅ Cancel button (for future bookings only)
- ✅ Link to rebook service
- ✅ Empty state with CTA

**API Integration:**

```typescript
GET /api/bookings/user
→ Returns bookings with service & staff details

PATCH /api/bookings/[id]/cancel
→ Cancels booking
```

---

## 🎨 UI Components

### ServiceCard Component

**Props:**

```typescript
interface ServiceCardProps {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  category: string | null;
  image_url: string | null;
}
```

**Features:**

- Hover effects (scale + shadow)
- Category badge
- Price & duration display
- "Book Now" button on hover
- Emoji fallback for missing images

**Styling:**

```css
/* Minimal Luxury Theme */
- White background
- Pink-50 gradient backgrounds
- Pink-600 accent colors
- Rounded-xl borders
- Subtle shadows
- Smooth transitions
```

---

### Loading Components

**LoadingSpinner:**

```typescript
<LoadingSpinner size="sm | md | lg" message="Optional message" />
```

**PageLoading:**

```typescript
<PageLoading message="Loading..." />
```

**Features:**

- Animated pink spinner
- Optional message
- Centered layout

---

### Error Components

**ErrorMessage:**

```typescript
<ErrorMessage
  title="Error Title"
  message="Error description"
  onRetry={() => refetch()}
/>
```

**PageError:**

```typescript
<PageError message="Failed to load" onRetry={retry} />
```

**Features:**

- Red alert styling
- Error icon
- Optional retry button
- Accessible

---

## 🔐 Authentication Flow

### How It Works

1. **Auth Context** (`useAuth` hook)

   - Provides `user` and `isLoading` states
   - Wrapped around entire app
   - Uses Supabase Auth client

2. **Protected Routes**

   ```typescript
   useEffect(() => {
     if (!authLoading && !user) {
       router.push("/auth/login?redirect=/book/...");
     }
   }, [user, authLoading]);
   ```

3. **API Calls**
   - Cookies automatically sent with requests
   - Backend validates session
   - Returns 401 if unauthorized

---

## 📱 Responsive Design

### Breakpoints (Tailwind)

- **Mobile:** Default (< 768px)
- **Tablet:** `md:` (768px+)
- **Desktop:** `lg:` (1024px+)

### Grid Layouts

```typescript
// Services grid
grid-cols-1 md:grid-cols-2 lg:grid-cols-3

// Time slots grid
grid-cols-3 md:grid-cols-4

// Service detail
grid-cols-1 lg:grid-cols-2
```

### Mobile Optimizations

- Touch-friendly buttons (min 44px height)
- Stacked layouts on mobile
- Simplified navigation
- Reduced spacing

---

## 🎨 Minimal Luxury Theme

### Color Palette

```css
/* Primary Colors */
--pink-50: #fce7f3;
--pink-100: #fce7f3;
--pink-500: #ec4899;
--pink-600: #db2777;
--pink-700: #be185d;

/* Neutral Colors */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-600: #4b5563;
--gray-900: #111827;
```

### Typography

```css
/* Headings */
font-family: "Playfair Display", Georgia, serif;

/* Body Text */
font-family: "Inter", -apple-system, sans-serif;
```

### Design Tokens

```css
/* Spacing */
gap-8, py-16, px-6

/* Borders */
border-gray-200, rounded-xl

/* Shadows */
shadow-sm, shadow-md, shadow-lg

/* Transitions */
transition-all duration-300
```

---

## 🧪 Testing Guide

### Test User Flow

1. **Browse Services**

   ```
   Navigate to /services
   → Should show all active services
   → Click a service card
   ```

2. **View Service Details**

   ```
   On /services/[id]
   → Should show service info
   → Click "Book This Service"
   ```

3. **Book Appointment**

   ```
   On /book/[serviceId]
   → If not logged in, redirects to /auth/login
   → After login, shows booking form
   → Select date (must be future)
   → Time slots load automatically
   → Select a time slot
   → Add notes (optional)
   → Click "Confirm Booking"
   → Shows success message
   → Redirects to /booking
   ```

4. **View Bookings**
   ```
   On /booking
   → Shows all user bookings
   → Click "Cancel Booking" on future booking
   → Booking status changes to "cancelled"
   ```

### Test Edge Cases

- **No services available** → Empty state
- **Service not found** → 404 page
- **No time slots** → "No available slots" message
- **Already booked slot** → Error message
- **Network failure** → Error with retry button
- **Not authenticated** → Redirect to login

---

## 🚀 Performance Optimizations

### Server Components (Default)

- Services listing page
- Service detail page
- Faster initial load
- SEO-friendly

### Client Components (Interactive)

- Booking form
- Bookings history
- Only loads JS when needed

### Image Optimization

```typescript
<Image
  src={image_url}
  alt={name}
  fill
  className="object-cover"
  priority // For above-the-fold images
/>
```

### Dynamic Imports

```typescript
// Load heavy components only when needed
const BookingForm = dynamic(() => import("./BookingForm"));
```

---

## 🔧 Customization Guide

### Change Time Slot Intervals

Edit `time-slot-service.ts`:

```typescript
currentMinutes += 30; // Change to 15, 45, 60, etc.
```

### Change Booking Window

Edit booking form:

```typescript
const maxDate = new Date();
maxDate.setDate(maxDate.getDate() + 90); // Change to 30, 60, 120, etc.
```

### Customize Theme Colors

Edit Tailwind config or component classes:

```typescript
// Change pink to another color
from-pink-500 → from-purple-500
bg-pink-600 → bg-purple-600
```

### Add New Service Category

Just add to database - frontend automatically displays it!

---

## 🐛 Troubleshooting

### "Service not found" error

→ Check service ID in URL
→ Verify service is_active = true

### Time slots not loading

→ Check browser console for errors
→ Verify date is valid (YYYY-MM-DD)
→ Check API route `/api/bookings/available-slots-v2`

### Booking fails with "slot unavailable"

→ Someone else booked it first (expected)
→ Select different time slot

### Not redirecting after login

→ Check redirect parameter in URL
→ Verify auth context is working

### Images not displaying

→ Add image domains to next.config.js
→ Use fallback emojis (already implemented)

---

## 📊 Component Props Reference

### ServiceCard

```typescript
{
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  category: string | null;
  image_url: string | null;
}
```

### TimeSlot

```typescript
{
  time: string; // "09:00"
  available: boolean;
  staffId: string | null;
  staffName: string | null;
}
```

### Service (API Response)

```typescript
{
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  category: string | null;
  image_url: string | null;
  is_active: boolean;
}
```

---

## ✅ Completed Features

✅ Services listing page with card grid  
✅ Service detail page with booking CTA  
✅ Complete booking form with date/time selection  
✅ Real-time slot availability checking  
✅ Authentication integration  
✅ Form validation & error handling  
✅ Loading states & spinners  
✅ Success confirmations  
✅ Responsive design (mobile-first)  
✅ Minimal Luxury UI theme  
✅ Booking history & management  
✅ Cancel booking functionality  
✅ Empty states  
✅ 404 handling

---

## 🎯 User Journey

```
1. Land on homepage
   ↓
2. Click "View Services" → /services
   ↓
3. Browse services grid
   ↓
4. Click service card → /services/[id]
   ↓
5. View service details
   ↓
6. Click "Book This Service" → /book/[serviceId]
   ↓
7. Login check (redirect if needed)
   ↓
8. Select date
   ↓
9. Time slots load automatically
   ↓
10. Select time slot (see staff name)
    ↓
11. Add notes (optional)
    ↓
12. Click "Confirm Booking"
    ↓
13. Success message + email sent
    ↓
14. Redirect to /booking
    ↓
15. View booking history
    ↓
16. Manage bookings (cancel if needed)
```

---

## 📝 Next Steps (Future Enhancements)

- [ ] Add booking calendar view
- [ ] Add staff profiles page
- [ ] Add service search/filter
- [ ] Add favorite services
- [ ] Add booking reminders
- [ ] Add review/rating system
- [ ] Add gift card purchases
- [ ] Add membership/packages
- [ ] Add waitlist for fully booked dates

---

**Frontend Status:** ✅ Production Ready  
**Last Updated:** November 20, 2025  
**Test Coverage:** All user flows tested  
**Browser Support:** Modern browsers (Chrome, Firefox, Safari, Edge)
