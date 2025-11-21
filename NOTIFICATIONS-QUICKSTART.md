# Notification System - Quick Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Database Migration

Run in Supabase SQL Editor:

```sql
-- Copy entire content from supabase-email-logs-schema.sql and execute
```

### Step 2: Environment Variables

Add to `.env.local`:

```env
EMAIL_USER=mattbokolosi@gmail.com
EMAIL_PASSWORD=your-gmail-app-password-here
CRON_SECRET=random-secure-string-123
```

### Step 3: Get Gmail App Password

1. Visit: https://myaccount.google.com/apppasswords
2. Enable 2FA if needed
3. Create App Password for "Mail"
4. Copy password → Add to `EMAIL_PASSWORD`

### Step 4: Install Dependencies

```bash
npm install nodemailer
```

### Step 5: Test

```bash
npm run dev
# Visit http://localhost:3000/admin/notifications
# Click "Test Booking Reminders"
```

---

## ✅ Features Implemented

### Automated Emails

- ✅ Booking reminders (1 day before)
- ✅ Booking reschedule notifications
- ✅ Booking cancellation notifications
- ✅ Order confirmations
- ✅ Payment failure alerts
- ✅ Promotional campaigns

### Admin Dashboard

- ✅ Email logs with filtering
- ✅ Email statistics
- ✅ Send promotional emails
- ✅ Manual reminder testing

### Technical Features

- ✅ Retry logic (3 attempts with exponential backoff)
- ✅ Database logging
- ✅ Error tracking
- ✅ Bulk email support
- ✅ HTML + Plain text templates
- ✅ Minimal Luxury theme styling

---

## 📧 Email Types

| Type             | Auto? | Trigger             |
| ---------------- | ----- | ------------------- |
| Booking Reminder | ✅    | Cron (1 day before) |
| Reschedule       | ❌    | API call            |
| Cancellation     | ❌    | API call            |
| Order Confirm    | ✅    | Payment success     |
| Payment Fail     | ❌    | Add to code         |
| Promotional      | ❌    | Admin dashboard     |

---

## 🔧 Integration Examples

### Send Booking Reschedule

```typescript
import { sendBookingRescheduleNotification } from "@/lib/services/booking-notifications";

await sendBookingRescheduleNotification(
  bookingId,
  "2025-11-20", // old date
  "10:00 AM", // old time
  "2025-11-21", // new date
  "2:00 PM", // new time
  "Staff unavailable" // optional reason
);
```

### Send Payment Failure

```typescript
import { sendPaymentFailureEmail } from "@/lib/services/order-notifications";

await sendPaymentFailureEmail({
  userId: user.id,
  customerName: "John Doe",
  customerEmail: "john@example.com",
  orderReference: "ref_123",
  amount: 15000,
  items: [{ product_name: "Face Cream", quantity: 2 }],
  reason: "Insufficient funds",
});
```

---

## 🎯 Admin Dashboard

**URL**: `/admin/notifications`

**Tabs**:

1. **Email Logs** - View all sent emails, filter by type/status
2. **Send Promotional** - Compose and send bulk emails
3. **Statistics** - View success rates and breakdowns

---

## ⏰ Cron Job Setup

### Vercel (Automatic)

Already configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-booking-reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

### External Cron Service

Use cron-job.org or similar:

- **URL**: `https://yourdomain.com/api/cron/send-booking-reminders`
- **Schedule**: `0 9 * * *` (Daily at 9 AM)
- **Method**: GET
- **Header**: `Authorization: Bearer YOUR_CRON_SECRET`

---

## 🐛 Troubleshooting

### Emails Not Sending

1. ✅ Check `EMAIL_PASSWORD` is App Password (not regular password)
2. ✅ Verify 2FA enabled on Gmail
3. ✅ Check `/admin/notifications` → Email Logs for errors

### Reminders Not Working

1. ✅ Verify cron job is configured
2. ✅ Test manually: `/admin/notifications` → "Test Booking Reminders"
3. ✅ Check booking has `booking_date` set to tomorrow

### Admin Dashboard Error

1. ✅ Ensure logged in as admin
2. ✅ Run: `UPDATE users SET role = 'admin' WHERE email = 'your@email.com'`

---

## 📁 File Structure

```
src/
├── lib/services/
│   ├── email-templates.ts          # HTML email templates
│   ├── notification-service.ts     # Core email sending
│   ├── booking-notifications.ts    # Booking emails
│   └── order-notifications.ts      # Order emails
├── app/
│   ├── admin/notifications/        # Admin dashboard
│   └── api/
│       ├── admin/notifications/    # Admin APIs
│       └── cron/                   # Scheduler endpoints
└── supabase-email-logs-schema.sql  # Database migration
```

---

## 📊 Database Tables

### email_logs

Tracks all sent emails with:

- User ID, email type, recipient
- Status (sent/failed/pending/retrying)
- Retry count, error messages
- Related booking/order IDs
- Campaign ID for promotional emails

### sms_logs (Placeholder)

Ready for future SMS integration

---

## 🎨 Email Theme

All emails use **Minimal Luxury** theme:

- Colors: Pink (#ec4899) accents, pink-50 backgrounds
- Fonts: Playfair Display (headings), Inter (body)
- Style: Rounded corners, gradients, clean layout

---

## 📚 Full Documentation

See `NOTIFICATIONS-SYSTEM.md` for complete details

---

## ✨ Production Checklist

- [ ] Run database migration
- [ ] Set production environment variables
- [ ] Configure Gmail App Password
- [ ] Set up cron job
- [ ] Test booking reminder
- [ ] Test promotional email
- [ ] Verify email logs
- [ ] Check spam folder for deliverability

---

**Need Help?** Contact mattbokolosi@gmail.com

**Version**: 1.0 | **Last Updated**: November 20, 2025
