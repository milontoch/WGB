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

/**
 * Send order confirmation email
 * @param params - Email parameters including order details
 */
export async function sendOrderConfirmationEmail(params: {
  to: string;
  customerName: string;
  order: {
    id: string;
    total: number;
    subtotal: number;
    discount: number;
    created_at: string;
  };
  items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
  }>;
  shipping: {
    address: string;
    city: string | null;
    state: string | null;
    is_pickup: boolean;
  };
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { to, customerName, order, items, shipping } = params;

    // Format order date
    const orderDate = new Date(order.created_at).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Generate items HTML
    const itemsHtml = items
      .map(
        (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <div style="font-weight: 500; color: #111827;">${
            item.product_name
          }</div>
          <div style="font-size: 14px; color: #6b7280;">Qty: ${
            item.quantity
          }</div>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
          ₦${(item.unit_price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `
      )
      .join("");

    // Email HTML content
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
      margin: 0;
      font-size: 32px;
      color: #831843;
    }
    .content {
      padding: 40px 20px;
    }
    .greeting {
      font-size: 18px;
      color: #111827;
      margin-bottom: 20px;
    }
    .success-icon {
      width: 60px;
      height: 60px;
      background-color: #10b981;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
    }
    .order-summary {
      background-color: #f9fafb;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .order-id {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .total-row {
      font-weight: 600;
      font-size: 18px;
      color: #111827;
    }
    .shipping-info {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .footer {
      background-color: #f9fafb;
      padding: 20px;
      text-align: center;
      font-size: 14px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="success-icon">
        <svg width="30" height="30" fill="white" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
        </svg>
      </div>
      <h1>Order Confirmed!</h1>
    </div>
    
    <div class="content">
      <p class="greeting">Hello ${customerName},</p>
      
      <p>Thank you for your order! We've received your payment and will process your order shortly.</p>
      
      <div class="order-summary">
        <div class="order-id">Order ID: <strong>${order.id}</strong></div>
        <div class="order-id">Order Date: ${orderDate}</div>
        
        <table>
          <thead>
            <tr style="border-bottom: 2px solid #e5e7eb;">
              <th style="padding: 12px; text-align: left; color: #6b7280; font-weight: 500;">Item</th>
              <th style="padding: 12px; text-align: right; color: #6b7280; font-weight: 500;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
            ${
              order.discount > 0
                ? `
            <tr>
              <td style="padding: 12px; color: #10b981;">Discount</td>
              <td style="padding: 12px; text-align: right; color: #10b981;">-₦${order.discount.toFixed(
                2
              )}</td>
            </tr>
            `
                : ""
            }
            <tr class="total-row">
              <td style="padding: 12px;">Total</td>
              <td style="padding: 12px; text-align: right;">₦${order.total.toFixed(
                2
              )}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="shipping-info">
        <h3 style="margin-top: 0; color: #92400e;">📦 ${
          shipping.is_pickup ? "Pickup Information" : "Delivery Address"
        }</h3>
        ${
          shipping.is_pickup
            ? `
          <p style="margin: 5px 0;"><strong>Pickup Location:</strong> Modern Beauty Studio, Asaba</p>
          <p style="margin: 5px 0; font-size: 14px; color: #92400e;">Please bring a valid ID when picking up your order.</p>
        `
            : `
          <p style="margin: 5px 0;">${shipping.address}</p>
          ${
            shipping.city
              ? `<p style="margin: 5px 0;">${shipping.city}${
                  shipping.state ? ", " + shipping.state : ""
                }</p>`
              : ""
          }
        `
        }
      </div>
      
      <p style="margin-top: 30px;">We'll notify you when your order is ready ${
        shipping.is_pickup ? "for pickup" : "for delivery"
      }.</p>
      
      <p style="margin-top: 20px;">If you have any questions, feel free to reply to this email.</p>
      
      <p style="margin-top: 30px; color: #6b7280;">
        Thank you for shopping with us!<br>
        <strong style="color: #ec4899;">Modern Beauty Studio</strong>
      </p>
    </div>
    
    <div class="footer">
      <p>This is an automated email. Please do not reply directly to this message.</p>
      <p style="margin-top: 10px;">&copy; 2025 Modern Beauty Studio. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    // Plain text version
    const textContent = `
Order Confirmation - Modern Beauty Studio

Hello ${customerName},

Thank you for your order! We've received your payment and will process your order shortly.

Order ID: ${order.id}
Order Date: ${orderDate}

ORDER ITEMS:
${items
  .map(
    (item) =>
      `- ${item.product_name} x${item.quantity}: ₦${(
        item.unit_price * item.quantity
      ).toFixed(2)}`
  )
  .join("\n")}

${order.discount > 0 ? `Discount: -₦${order.discount.toFixed(2)}\n` : ""}
Total: ₦${order.total.toFixed(2)}

${
  shipping.is_pickup
    ? `
PICKUP INFORMATION:
Location: Modern Beauty Studio, Asaba
Please bring a valid ID when picking up your order.
`
    : `
DELIVERY ADDRESS:
${shipping.address}
${
  shipping.city
    ? shipping.city + (shipping.state ? ", " + shipping.state : "")
    : ""
}
`
}

We'll notify you when your order is ready ${
      shipping.is_pickup ? "for pickup" : "for delivery"
    }.

Thank you for shopping with us!
Modern Beauty Studio
    `.trim();

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to,
      subject: `Order Confirmation - #${order.id.substring(0, 8)}`,
      text: textContent,
      html: htmlContent,
    };

    await getTransporter().sendMail(mailOptions);

    return { success: true };
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}
