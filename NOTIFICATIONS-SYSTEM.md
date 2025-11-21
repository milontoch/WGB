# Notification and Email System Documentation

## Overview

The Modern Beauty Studio notification system provides comprehensive email automation for bookings, orders, and promotional campaigns. All emails use the Minimal Luxury theme with pink accents, Playfair Display headers, and Inter body text.

---

## System Architecture

### Core Components

1. **Email Templates** (`src/lib/services/email-templates.ts`)

   - HTML and plain text versions
   - Minimal Luxury styling
   - Templates for: booking reminders, reschedules, cancellations, order confirmations, payment failures, promotional emails

2. **Notification Service** (`src/lib/services/notification-service.ts`)

   - Email sending with retry logic
   - Database logging for all emails
   - Bulk email capabilities
   - Error handling and recovery

3. **Booking Notifications** (`src/lib/services/booking-notifications.ts`)

   - 1-day reminder automation
   - Reschedule notifications
   - Cancellation notifications

4. **Order Notifications** (`src/lib/services/order-notifications.ts`)

   - Order confirmation emails
   - Payment failure alerts
   - Future: shipping/delivery updates

5. **Database** (`supabase-email-logs-schema.sql`)
   - `email_logs` table for tracking
   - `sms_logs` table (future SMS integration)

---

## Email Types

### 1. Booking Reminder

**Trigger**: Automatically sent 1 day before appointment  
**Template**: `getBookingReminderTemplate()`  
**Contains**:

- Service name, date, time
- Staff assigned
- Location/pickup information
- Preparation tips

**Function**:

```typescript
import { sendBookingReminder } from "@/lib/services/booking-notifications";

await sendBookingReminder(bookingId);
```

### 2. Booking Reschedule

**Trigger**: When admin reschedules a booking  
**Template**: `getBookingRescheduleTemplate()`  
**Contains**:

- Old date/time vs new date/time
- Reason for change (optional)
- Updated booking details

**Function**:

```typescript
import { sendBookingRescheduleNotification } from "@/lib/services/booking-notifications";

await sendBookingRescheduleNotification(
  bookingId,
  oldDate,
  oldTime,
  newDate,
  newTime,
  reason // optional
);
```

### 3. Booking Cancellation

**Trigger**: When admin cancels a booking  
**Template**: `getBookingCancellationTemplate()`  
**Contains**:

- Cancelled appointment details
- Reason for cancellation (optional)
- Link to rebook

**Function**:

```typescript
import { sendBookingCancellationNotification } from "@/lib/services/booking-notifications";

await sendBookingCancellationNotification(bookingId, reason);
```

### 4. Order Confirmation

**Trigger**: After successful Paystack payment  
**Template**: Built into `sendOrderConfirmationEmail()`  
**Contains**:

- Order number and items
- Pricing breakdown
- Shipping/pickup details
- Payment status

**Function**:

```typescript
import { sendOrderConfirmationEmail } from "@/lib/services/order-notifications";

await sendOrderConfirmationEmail({
  to: "customer@email.com",
  customerName: "John Doe",
  order: {
    id: "order-uuid",
    total: 15000,
    subtotal: 15000,
    discount: 0,
    created_at: "2025-11-20T10:00:00Z",
  },
  items: [
    {
      product_name: "Luxury Face Cream",
      quantity: 2,
      unit_price: 7500,
      total_price: 15000,
    },
  ],
  shipping: {
    is_pickup: false,
    address: "123 Main St",
    city: "Asaba",
    state: "Delta",
  },
});
```

### 5. Payment Failure

**Trigger**: When Paystack payment fails  
**Template**: `getPaymentFailureTemplate()`  
**Contains**:

- Order reference
- Failed amount
- Items in cart
- Retry link

**Function**:

```typescript
import { sendPaymentFailureEmail } from "@/lib/services/order-notifications";

await sendPaymentFailureEmail({
  userId: "user-uuid",
  customerName: "John Doe",
  customerEmail: "customer@email.com",
  orderReference: "ref_xyz123",
  amount: 15000,
  items: [{ product_name: "Luxury Face Cream", quantity: 2 }],
  reason: "Insufficient funds",
});
```

### 6. Promotional/Bulk Emails

**Trigger**: Manual via admin dashboard  
**Template**: `getPromotionalTemplate()`  
**Contains**:

- Custom heading and message
- Discount codes
- Call-to-action buttons
- Images (optional)

**API Endpoint**: `POST /api/admin/notifications/send-promotional`

**Request Body**:

```json
{
  "subject": "Special Offer: 20% Off All Services!",
  "heading": "Exclusive Offer Just for You",
  "message": "Book any service this week and get 20% off!",
  "ctaText": "Book Now",
  "ctaLink": "https://modernbeautystudio.com/services",
  "discountCode": "SAVE20",
  "targetAudience": "all",
  "campaignId": "promo_2025_nov"
}
```

**Target Audiences**:

- `all`: All registered users
- `customers`: Users who have placed orders
- `booking_users`: Users who have made bookings

---

## Automated Scheduler

### Booking Reminder Cron Job

**Endpoint**: `/api/cron/send-booking-reminders`  
**Schedule**: Daily at 9:00 AM  
**Function**: Sends reminders for all bookings happening tomorrow

#### Setup with Vercel Cron

Add to `vercel.json`:

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

#### Setup with External Cron Service

Use services like cron-job.org, EasyCron, or similar:

- **URL**: `https://yourdomain.com/api/cron/send-booking-reminders`
- **Schedule**: Daily at 9:00 AM
- **Method**: GET or POST
- **Headers**: `Authorization: Bearer YOUR_CRON_SECRET`

#### Manual Testing

**Endpoint**: `POST /api/cron/test-reminder` (Admin only)

```javascript
const response = await fetch("/api/cron/test-reminder", {
  method: "POST",
});
const data = await response.json();
// { total_bookings: 5, reminders_sent: 4, reminders_failed: 1 }
```

---

## Email Logging

All emails are logged to the `email_logs` table with:

- `user_id`: Recipient user ID (if known)
- `email_type`: Type of email
- `recipient_email`: Email address
- `subject`: Email subject line
- `status`: `pending`, `sent`, `failed`, `retrying`
- `retry_count`: Number of retry attempts
- `error_message`: Error details (if failed)
- `sent_at`: Timestamp when email was sent
- `related_booking_id`: Associated booking (if applicable)
- `related_order_id`: Associated order (if applicable)
- `campaign_id`: Campaign identifier (for promotional emails)
- `metadata`: Additional data (JSON)

### Viewing Logs

**Admin Dashboard**: `/admin/notifications` → Email Logs tab

**API Endpoint**: `GET /api/admin/notifications/email-logs`

**Query Parameters**:

- `email_type`: Filter by type
- `status`: Filter by status
- `campaign_id`: Filter by campaign
- `from_date`: Start date (ISO format)
- `to_date`: End date (ISO format)
- `limit`: Number of results (default: 100)
- `include_stats`: Include statistics (true/false)

**Example**:

```javascript
const response = await fetch(
  "/api/admin/notifications/email-logs?status=failed&include_stats=true"
);
const { logs, stats } = await response.json();
```

---

## Email Statistics

**Available via**: `/admin/notifications` → Statistics tab

**Metrics**:

- Total emails sent
- Success rate percentage
- Failed emails count
- Emails by type breakdown
- Status distribution (sent/failed/pending/retrying)

**API Endpoint**: Included in `/api/admin/notifications/email-logs?include_stats=true`

---

## Configuration

### Environment Variables

Required for email sending:

```env
# Gmail SMTP Configuration
EMAIL_USER=mattbokolosi@gmail.com
EMAIL_PASSWORD=your-app-password-here

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://woqzoenyxnveapkzzfna.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App URL (for links in emails)
NEXT_PUBLIC_APP_URL=https://modernbeautystudio.com

# Cron Job Security
CRON_SECRET=your-secure-random-string
```

### Gmail App Password Setup

1. Go to Google Account Settings → Security
2. Enable 2-Step Verification
3. Go to App Passwords
4. Generate password for "Mail"
5. Use generated password in `EMAIL_PASSWORD`

---

## Database Migration

Run the SQL migration to create required tables:

```bash
# Connect to Supabase and run:
psql postgresql://your-connection-string -f supabase-email-logs-schema.sql
```

Or manually execute `supabase-email-logs-schema.sql` in Supabase SQL Editor.

---

## Admin Dashboard Usage

### Access

Navigate to `/admin/notifications` (admin role required)

### Email Logs Tab

- View all sent emails
- Filter by type, status, campaign
- Refresh logs
- Test booking reminders manually

### Send Promotional Email Tab

- Select target audience
- Compose email with subject, heading, message
- Add discount codes
- Add call-to-action buttons
- Send to multiple users at once

### Statistics Tab

- View total emails sent
- Success rate metrics
- Breakdown by email type
- Status distribution graphs

---

## Retry Logic

Failed emails are automatically retried with exponential backoff:

- **Attempt 1**: Immediate
- **Attempt 2**: After 2 seconds
- **Attempt 3**: After 4 seconds
- **Attempt 4**: After 8 seconds

Maximum retries: 3 (configurable)

Failed emails remain in database with `status='failed'` for manual review.

---

## Future Enhancements

### SMS Notifications (Placeholder)

Table `sms_logs` is ready for future SMS integration using:

- Twilio
- Africa's Talking
- Other SMS providers

### Order Status Updates

Function `sendOrderStatusUpdateEmail()` is a placeholder for:

- Order shipped notifications
- Out for delivery alerts
- Delivered confirmations
- Ready for pickup alerts

---

## API Reference

### Admin Endpoints

#### Send Promotional Email

```
POST /api/admin/notifications/send-promotional
Authorization: Required (Admin)

Body: {
  subject: string,
  heading: string,
  message: string,
  ctaText?: string,
  ctaLink?: string,
  discountCode?: string,
  targetAudience: 'all' | 'customers' | 'booking_users',
  campaignId: string
}

Response: {
  success: boolean,
  campaign_id: string,
  total_recipients: number,
  emails_sent: number,
  emails_failed: number,
  failed_emails: string[]
}
```

#### Get Email Logs

```
GET /api/admin/notifications/email-logs
Authorization: Required (Admin)

Query Params:
  - email_type?: string
  - status?: string
  - campaign_id?: string
  - from_date?: string
  - to_date?: string
  - limit?: number
  - include_stats?: boolean

Response: {
  success: boolean,
  logs: EmailLog[],
  stats?: EmailStats,
  count: number
}
```

### Cron Endpoints

#### Send Booking Reminders

```
GET /api/cron/send-booking-reminders
Authorization: Bearer {CRON_SECRET}

Response: {
  success: boolean,
  timestamp: string,
  total_bookings: number,
  reminders_sent: number,
  reminders_failed: number
}
```

#### Test Reminders (Admin)

```
POST /api/cron/test-reminder
Authorization: Required (Admin)

Response: {
  success: boolean,
  timestamp: string,
  total_bookings: number,
  reminders_sent: number,
  reminders_failed: number
}
```

---

## Troubleshooting

### Emails Not Sending

1. **Check Gmail App Password**

   - Verify `EMAIL_PASSWORD` is set correctly
   - Ensure 2FA is enabled on Gmail account

2. **Check Email Logs**

   - View `/admin/notifications` for error messages
   - Look for `status='failed'` entries

3. **Test Email Configuration**

   ```typescript
   import { verifyEmailConfig } from "@/lib/services/notification-service";

   const isValid = await verifyEmailConfig();
   console.log("Email config valid:", isValid);
   ```

### Booking Reminders Not Sending

1. **Check Cron Job Setup**

   - Verify cron is scheduled correctly
   - Check `CRON_SECRET` is set

2. **Test Manually**

   - Use `/api/cron/test-reminder` endpoint
   - Check response for errors

3. **Check Booking Dates**
   - Reminders only sent for bookings tomorrow
   - Verify `booking_date` is set correctly

### Promotional Emails Failing

1. **Check Target Audience**

   - Ensure users exist in database
   - Verify email addresses are valid

2. **Check Bulk Sending Limits**
   - Gmail has daily sending limits (500 emails/day)
   - Consider using dedicated email service for large campaigns

---

## Best Practices

1. **Email Content**

   - Keep subject lines under 50 characters
   - Use clear, action-oriented CTAs
   - Test emails before sending to all users

2. **Scheduling**

   - Send booking reminders at consistent times
   - Avoid sending promotional emails late at night

3. **Monitoring**

   - Check email logs regularly
   - Monitor success rates
   - Review failed emails for patterns

4. **Testing**
   - Test all email templates before production
   - Use test reminder endpoint for validation
   - Send promotional emails to small test group first

---

## Support

For issues or questions:

- Check email logs in admin dashboard
- Review error messages in database
- Contact: mattbokolosi@gmail.com

---

**System Version**: 1.0  
**Last Updated**: November 20, 2025  
**Documentation by**: Modern Beauty Studio Development Team
