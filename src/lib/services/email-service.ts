/**
 * Email Service
 * Handles all transactional emails via Gmail SMTP
 *
 * NOTE: This service is being replaced by the new notification system.
 * For order confirmations, use sendOrderConfirmationEmail from order-notifications.ts
 * For booking notifications, use functions from booking-notifications.ts
 */

import nodemailer from "nodemailer";
import type { Booking, Service, Staff } from "@/lib/supabase/config";
import { formatDate, formatTime } from "./time-slot-service";

// Re-export new notification functions for backwards compatibility
export { sendOrderConfirmationEmail } from "./order-notifications";
export {
  sendBookingReminder,
  sendBookingRescheduleNotification,
  sendBookingCancellationNotification,
} from "./booking-notifications";

// Validate email configuration
const validateEmailConfig = () => {
  const required = {
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM: process.env.SMTP_FROM,
  };

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required email environment variables: ${missing.join(", ")}`
    );
  }

  return required;
};

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
  if (!transporter) {
    const config = validateEmailConfig();

    transporter = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: parseInt(config.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
      },
    });
  }

  return transporter;
};

/**
 * Send booking confirmation email
 * @param params - Email parameters including booking details
 */
export async function sendBookingConfirmationEmail(params: {
  to: string;
  customerName: string;
  service: Service;
  staff: Staff;
  booking: Booking;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { to, customerName, service, staff, booking } = params;

    // Format date and time for display
    const formattedDate = formatDate(booking.booking_date);
    const formattedTime = formatTime(booking.booking_time.substring(0, 5));

    // Email HTML content with Minimal Luxury styling
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      color: #374151;
      margin: 0;
      padding: 0;
      background-color: #f9fafb;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #fce7f3 0%, #f9a8d4 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 32px;
      color: #831843;
      margin: 0;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      color: #1f2937;
      margin-bottom: 20px;
    }
    .message {
      color: #4b5563;
      margin-bottom: 30px;
    }
    .details-box {
      background-color: #fce7f3;
      border-radius: 12px;
      padding: 24px;
      margin: 30px 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #f9a8d4;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      font-weight: 600;
      color: #831843;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .detail-value {
      color: #1f2937;
      font-weight: 500;
      text-align: right;
    }
    .price-highlight {
      font-size: 24px;
      color: #db2777;
      font-weight: 700;
    }
    .notes-section {
      background-color: #f9fafb;
      border-left: 4px solid #f9a8d4;
      padding: 16px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .notes-label {
      font-weight: 600;
      color: #831843;
      margin-bottom: 8px;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
      border-top: 1px solid #e5e7eb;
    }
    .booking-id {
      font-family: 'Courier New', monospace;
      background-color: #f3f4f6;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ Booking Confirmed</h1>
    </div>
    
    <div class="content">
      <p class="greeting">Hello ${customerName},</p>
      
      <p class="message">
        Thank you for booking with us! Your appointment has been confirmed. 
        We're looking forward to providing you with exceptional service.
      </p>
      
      <div class="details-box">
        <div class="detail-row">
          <span class="detail-label">Service</span>
          <span class="detail-value">${service.name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date</span>
          <span class="detail-value">${formattedDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Time</span>
          <span class="detail-value">${formattedTime}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Duration</span>
          <span class="detail-value">${service.duration} minutes</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Staff Member</span>
          <span class="detail-value">${staff.name}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Price</span>
          <span class="detail-value price-highlight">$${service.price.toFixed(
            2
          )}</span>
        </div>
      </div>
      
      ${
        booking.notes
          ? `
      <div class="notes-section">
        <div class="notes-label">Your Notes:</div>
        <div>${booking.notes}</div>
      </div>
      `
          : ""
      }
      
      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        <strong>Booking Reference:</strong> <span class="booking-id">${
          booking.id
        }</span>
      </p>
      
      <p style="color: #6b7280; font-size: 14px;">
        If you need to cancel or reschedule your appointment, please contact us at least 24 hours in advance.
      </p>
    </div>
    
    <div class="footer">
      <p style="margin: 0 0 10px 0;">
        <strong>Modern Beauty Studio</strong>
      </p>
      <p style="margin: 0; font-size: 13px;">
        This is an automated confirmation email. Please do not reply to this message.
      </p>
    </div>
  </div>
</body>
</html>
    `;

    // Plain text version for email clients that don't support HTML
    const textContent = `
Booking Confirmed

Hello ${customerName},

Thank you for booking with us! Your appointment has been confirmed.

BOOKING DETAILS:
- Service: ${service.name}
- Date: ${formattedDate}
- Time: ${formattedTime}
- Duration: ${service.duration} minutes
- Staff Member: ${staff.name}
- Price: $${service.price.toFixed(2)}

${booking.notes ? `Your Notes: ${booking.notes}\n` : ""}
Booking Reference: ${booking.id}

If you need to cancel or reschedule your appointment, please contact us at least 24 hours in advance.

Modern Beauty Studio
    `.trim();

    // Send email
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to,
      subject: `✨ Booking Confirmed - ${service.name}`,
      text: textContent,
      html: htmlContent,
    };

    await getTransporter().sendMail(mailOptions);

    return { success: true };
  } catch (error) {
    console.error("Error sending booking confirmation email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

/**
 * Send booking cancellation email
 * @param params - Email parameters including booking details
 */
export async function sendCancellationEmail(params: {
  to: string;
  customerName: string;
  service: Service;
  booking: Booking;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { to, customerName, service, booking } = params;

    const formattedDate = formatDate(booking.booking_date);
    const formattedTime = formatTime(booking.booking_time.substring(0, 5));

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      color: #374151;
      margin: 0;
      padding: 0;
      background-color: #f9fafb;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%);
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 32px;
      color: #991b1b;
      margin: 0;
    }
    .content {
      padding: 40px 30px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Booking Cancelled</h1>
    </div>
    <div class="content">
      <p>Hello ${customerName},</p>
      <p>Your booking has been cancelled as requested.</p>
      <p><strong>Cancelled Appointment:</strong></p>
      <ul>
        <li>Service: ${service.name}</li>
        <li>Date: ${formattedDate}</li>
        <li>Time: ${formattedTime}</li>
      </ul>
      <p>We hope to see you again soon!</p>
      <p style="color: #6b7280; font-size: 14px;">Modern Beauty Studio</p>
    </div>
  </div>
</body>
</html>
    `;

    const textContent = `
Booking Cancelled

Hello ${customerName},

Your booking has been cancelled as requested.

Cancelled Appointment:
- Service: ${service.name}
- Date: ${formattedDate}
- Time: ${formattedTime}

We hope to see you again soon!

Modern Beauty Studio
    `.trim();

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to,
      subject: `Booking Cancelled - ${service.name}`,
      text: textContent,
      html: htmlContent,
    };

    await getTransporter().sendMail(mailOptions);

    return { success: true };
  } catch (error) {
    console.error("Error sending cancellation email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

// (Order confirmation emails are now provided by order-notifications.ts and re-exported above.)
