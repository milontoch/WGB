# Email Setup Guide

This guide explains how to configure email functionality for OTP delivery and other transactional emails.

## Overview

The application uses **Nodemailer** to send emails via SMTP. The main use case is sending OTP verification codes, but it also supports welcome emails and other notifications.

## Files

- `src/lib/email.ts` - Email utility functions
- `src/app/api/auth/send-otp/route.ts` - OTP generation and email sending
- `src/app/api/auth/test-email/route.ts` - Test endpoint to verify configuration

## Quick Setup

### 1. Choose an Email Provider

You can use any SMTP provider. Popular options:

#### Gmail (Free, easiest for testing)

- **SMTP Host:** `smtp.gmail.com`
- **Port:** `587`
- **Secure:** `false`
- **Requires:** App Password (not regular password)

#### SendGrid (Free tier available)

- **SMTP Host:** `smtp.sendgrid.net`
- **Port:** `587`
- **API Key:** Create at https://app.sendgrid.com/settings/api_keys

#### AWS SES (Pay as you go)

- **SMTP Host:** `email-smtp.us-east-1.amazonaws.com` (or your region)
- **Port:** `587`
- **Credentials:** Generate SMTP credentials in AWS Console

### 2. Update Environment Variables

Edit `.env.local`:

```env
# Gmail Example
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM="Beauty Services" <noreply@yourdomain.com>

# SendGrid Example
# SMTP_HOST=smtp.sendgrid.net
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=apikey
# SMTP_PASS=SG.your-sendgrid-api-key
# SMTP_FROM="Beauty Services" <noreply@yourdomain.com>
```

### 3. Gmail App Password Setup (if using Gmail)

1. Enable 2-Factor Authentication on your Google account
2. Visit https://myaccount.google.com/apppasswords
3. Create a new App Password for "Mail"
4. Copy the 16-character password (no spaces)
5. Use this as `SMTP_PASS` in `.env.local`

**Important:** Never use your regular Gmail password - it won't work with SMTP.

### 4. Test Your Configuration

```bash
# Start the dev server
npm run dev

# Test email sending (replace with your email)
curl "http://localhost:3000/api/auth/test-email?to=your-email@example.com"
```

Or visit in browser:

```
http://localhost:3000/api/auth/test-email?to=your-email@example.com
```

Expected response:

```json
{
  "success": true,
  "message": "Test email sent successfully to your-email@example.com",
  "messageId": "<...>",
  "note": "Check your inbox (and spam folder) for the test email"
}
```

### 5. Check Spam Folder

First emails from new senders often land in spam. Check there if you don't see the test email.

## Usage in Code

### Send OTP Email

Already integrated in `/api/auth/send-otp`:

```typescript
POST /api/auth/send-otp
{
  "user_id": "uuid-here",
  "purpose": "verify_email",
  "email": "user@example.com"  // optional, falls back to user's email
}
```

### Send Welcome Email

```typescript
import { sendWelcomeEmail } from "@/lib/email";

await sendWelcomeEmail("user@example.com", "John Doe");
```

### Send Custom OTP

```typescript
import { sendOtpEmail } from "@/lib/email";

await sendOtpEmail(
  "user@example.com",
  "123456",
  "login" // or 'verify_email' or 'reset_password'
);
```

## Email Templates

Emails include:

- ✅ Beautiful HTML with gradient header (matches app design)
- ✅ Plain text fallback
- ✅ Responsive design
- ✅ Purpose-specific messaging
- ✅ 10-minute expiration notice
- ✅ Security disclaimer

## Development Mode

In development, if email sending fails:

- OTP code is logged to console as fallback
- `dev_code` is returned in API response
- Allows testing without email configuration

In production:

- Email sending failures return 500 error
- No codes are logged or returned
- Requires working SMTP configuration

## Troubleshooting

### "SMTP credentials not configured"

**Fix:** Set `SMTP_USER` and `SMTP_PASS` in `.env.local`

### "Invalid login: 535-5.7.8 Username and Password not accepted"

**Fix (Gmail):** You're using your regular password. Create an App Password instead.

### "Connection timeout" or "ECONNREFUSED"

**Fix:** Check `SMTP_HOST` and `SMTP_PORT` are correct for your provider.

### Email not received

**Check:**

1. Spam/junk folder
2. Email address is correct
3. SMTP credentials are valid
4. Console logs for error messages

### Gmail security blocking

**Fix:**

1. Enable 2FA on Google account
2. Use App Password, not regular password
3. Allow "less secure apps" is deprecated - use App Passwords

## Production Considerations

1. **Domain Authentication:** Configure SPF, DKIM, and DMARC records to improve deliverability

2. **Rate Limiting:** Add rate limiting to prevent abuse:

   ```typescript
   // Example: Max 5 OTPs per hour per user
   ```

3. **Monitoring:** Log email send failures to monitoring service

4. **Provider Limits:**

   - Gmail: ~500 emails/day
   - SendGrid Free: 100 emails/day
   - AWS SES: Pay per email, high limits

5. **Remove Test Endpoint:** The `/api/auth/test-email` endpoint should be removed or protected in production

## Alternative: Using Resend (Recommended for Production)

Resend is a modern email API with better deliverability:

```bash
npm install resend
```

```typescript
// lib/email-resend.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOtpEmail(to: string, code: string) {
  await resend.emails.send({
    from: "Beauty Services <noreply@yourdomain.com>",
    to,
    subject: "Your Verification Code",
    html: `<p>Your code: <strong>${code}</strong></p>`,
  });
}
```

Add to `.env.local`:

```env
RESEND_API_KEY=re_your_api_key_here
```

Get API key at: https://resend.com/api-keys

## Support

For provider-specific setup:

- **Gmail:** https://support.google.com/mail/answer/185833
- **SendGrid:** https://docs.sendgrid.com/for-developers/sending-email/smtp-errors
- **AWS SES:** https://docs.aws.amazon.com/ses/latest/dg/smtp-credentials.html
- **Resend:** https://resend.com/docs
