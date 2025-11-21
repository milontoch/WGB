/**
 * Email Templates for Modern Beauty Studio
 * Minimal Luxury Theme with Pink Accents
 */

// Base email styles matching the Minimal Luxury theme
const baseStyles = `
  body {
    margin: 0;
    padding: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background-color: #fdf2f8;
    color: #1f2937;
  }
  .email-container {
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
  }
  .header {
    background: linear-gradient(135deg, #fdf2f8 0%, #fff 100%);
    padding: 40px 20px;
    text-align: center;
    border-bottom: 2px solid #ec4899;
  }
  .logo {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 32px;
    font-weight: 700;
    color: #ec4899;
    margin: 0;
  }
  .tagline {
    font-size: 12px;
    color: #9ca3af;
    margin-top: 8px;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  .content {
    padding: 40px 30px;
  }
  .title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 24px;
    color: #1f2937;
    margin: 0 0 20px 0;
  }
  .text {
    font-size: 16px;
    line-height: 1.6;
    color: #4b5563;
    margin: 0 0 16px 0;
  }
  .details-box {
    background-color: #fdf2f8;
    border-left: 4px solid #ec4899;
    padding: 20px;
    margin: 24px 0;
    border-radius: 8px;
  }
  .detail-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #fce7f3;
  }
  .detail-row:last-child {
    border-bottom: none;
  }
  .detail-label {
    font-weight: 600;
    color: #374151;
  }
  .detail-value {
    color: #6b7280;
    text-align: right;
  }
  .button {
    display: inline-block;
    background-color: #ec4899;
    color: #ffffff !important;
    text-decoration: none;
    padding: 14px 32px;
    border-radius: 50px;
    font-weight: 600;
    margin: 20px 0;
    text-align: center;
  }
  .button:hover {
    background-color: #db2777;
  }
  .footer {
    background-color: #fdf2f8;
    padding: 30px;
    text-align: center;
    border-top: 1px solid #fce7f3;
  }
  .footer-text {
    font-size: 14px;
    color: #6b7280;
    margin: 8px 0;
  }
  .social-links {
    margin: 16px 0;
  }
  .social-link {
    color: #ec4899;
    text-decoration: none;
    margin: 0 10px;
  }
  .divider {
    height: 1px;
    background-color: #fce7f3;
    margin: 24px 0;
  }
  .alert {
    background-color: #fef2f2;
    border-left: 4px solid #ef4444;
    padding: 16px;
    margin: 20px 0;
    border-radius: 8px;
  }
  .success {
    background-color: #f0fdf4;
    border-left: 4px solid #22c55e;
    padding: 16px;
    margin: 20px 0;
    border-radius: 8px;
  }
`;

/**
 * Generate email header
 */
function getEmailHeader(): string {
  return `
    <div class="header">
      <h1 class="logo">Modern Beauty Studio</h1>
      <p class="tagline">Minimal Luxury</p>
    </div>
  `;
}

/**
 * Generate email footer
 */
function getEmailFooter(): string {
  return `
    <div class="footer">
      <p class="footer-text">Modern Beauty Studio</p>
      <p class="footer-text">Asaba, Delta State, Nigeria</p>
      <div class="social-links">
        <a href="#" class="social-link">Instagram</a>
        <a href="#" class="social-link">Facebook</a>
        <a href="#" class="social-link">WhatsApp</a>
      </div>
      <p class="footer-text" style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
        You received this email because you have an account with Modern Beauty Studio.<br>
        If you have any questions, reply to this email or contact us at mattbokolosi@gmail.com
      </p>
    </div>
  `;
}

/**
 * Booking Reminder Email Template (1 day before appointment)
 */
export function getBookingReminderTemplate(data: {
  customerName: string;
  serviceName: string;
  date: string;
  time: string;
  staffName: string;
  location: string;
  isPickup: boolean;
}): { html: string; text: string } {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Reminder</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="email-container">
        ${getEmailHeader()}
        <div class="content">
          <h2 class="title">Your Appointment is Tomorrow! 💅</h2>
          <p class="text">Hi ${data.customerName},</p>
          <p class="text">
            This is a friendly reminder about your upcoming appointment at Modern Beauty Studio.
          </p>
          
          <div class="details-box">
            <div class="detail-row">
              <span class="detail-label">Service:</span>
              <span class="detail-value">${data.serviceName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value">${data.date}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time:</span>
              <span class="detail-value">${data.time}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Staff:</span>
              <span class="detail-value">${data.staffName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Location:</span>
              <span class="detail-value">${
                data.isPickup ? "Asaba (Pick-up Available)" : data.location
              }</span>
            </div>
          </div>

          <p class="text">
            We look forward to seeing you! If you need to reschedule or cancel, 
            please contact us as soon as possible.
          </p>

          <div style="text-align: center;">
            <a href="${
              process.env.NEXT_PUBLIC_APP_URL
            }/booking" class="button">View Booking</a>
          </div>

          <p class="text" style="font-size: 14px; color: #9ca3af; margin-top: 30px;">
            <strong>Preparation Tips:</strong><br>
            • Arrive 5 minutes early<br>
            • Bring any reference photos if applicable<br>
            • Let us know if you have any allergies
          </p>
        </div>
        ${getEmailFooter()}
      </div>
    </body>
    </html>
  `;

  const text = `
BOOKING REMINDER - Modern Beauty Studio

Hi ${data.customerName},

This is a friendly reminder about your upcoming appointment at Modern Beauty Studio.

APPOINTMENT DETAILS:
Service: ${data.serviceName}
Date: ${data.date}
Time: ${data.time}
Staff: ${data.staffName}
Location: ${data.isPickup ? "Asaba (Pick-up Available)" : data.location}

We look forward to seeing you! If you need to reschedule or cancel, please contact us as soon as possible.

PREPARATION TIPS:
- Arrive 5 minutes early
- Bring any reference photos if applicable
- Let us know if you have any allergies

Modern Beauty Studio
Asaba, Delta State, Nigeria
Email: mattbokolosi@gmail.com
  `.trim();

  return { html, text };
}

/**
 * Booking Reschedule Email Template
 */
export function getBookingRescheduleTemplate(data: {
  customerName: string;
  serviceName: string;
  oldDate: string;
  oldTime: string;
  newDate: string;
  newTime: string;
  staffName: string;
  reason?: string;
}): { html: string; text: string } {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Rescheduled</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="email-container">
        ${getEmailHeader()}
        <div class="content">
          <h2 class="title">Your Appointment Has Been Rescheduled</h2>
          <p class="text">Hi ${data.customerName},</p>
          <p class="text">
            Your appointment for <strong>${
              data.serviceName
            }</strong> has been rescheduled.
            ${data.reason ? `<br><br><em>Reason: ${data.reason}</em>` : ""}
          </p>

          <div class="alert">
            <strong>Previous Date:</strong> ${data.oldDate} at ${data.oldTime}
          </div>

          <div class="success">
            <strong>New Date:</strong> ${data.newDate} at ${data.newTime}
          </div>

          <div class="details-box">
            <div class="detail-row">
              <span class="detail-label">Service:</span>
              <span class="detail-value">${data.serviceName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">New Date:</span>
              <span class="detail-value">${data.newDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">New Time:</span>
              <span class="detail-value">${data.newTime}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Staff:</span>
              <span class="detail-value">${data.staffName}</span>
            </div>
          </div>

          <p class="text">
            We apologize for any inconvenience. If this new time doesn't work for you, 
            please contact us to arrange an alternative.
          </p>

          <div style="text-align: center;">
            <a href="${
              process.env.NEXT_PUBLIC_APP_URL
            }/booking" class="button">View Booking</a>
          </div>
        </div>
        ${getEmailFooter()}
      </div>
    </body>
    </html>
  `;

  const text = `
BOOKING RESCHEDULED - Modern Beauty Studio

Hi ${data.customerName},

Your appointment for ${data.serviceName} has been rescheduled.
${data.reason ? `Reason: ${data.reason}` : ""}

PREVIOUS DATE: ${data.oldDate} at ${data.oldTime}
NEW DATE: ${data.newDate} at ${data.newTime}

NEW APPOINTMENT DETAILS:
Service: ${data.serviceName}
Date: ${data.newDate}
Time: ${data.newTime}
Staff: ${data.staffName}

We apologize for any inconvenience. If this new time doesn't work for you, please contact us to arrange an alternative.

Modern Beauty Studio
Asaba, Delta State, Nigeria
Email: mattbokolosi@gmail.com
  `.trim();

  return { html, text };
}

/**
 * Booking Cancellation Email Template
 */
export function getBookingCancellationTemplate(data: {
  customerName: string;
  serviceName: string;
  date: string;
  time: string;
  reason?: string;
}): { html: string; text: string } {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Cancelled</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="email-container">
        ${getEmailHeader()}
        <div class="content">
          <h2 class="title">Appointment Cancelled</h2>
          <p class="text">Hi ${data.customerName},</p>
          <p class="text">
            Your appointment has been cancelled.
            ${data.reason ? `<br><br><em>Reason: ${data.reason}</em>` : ""}
          </p>

          <div class="alert">
            <strong>Cancelled Appointment:</strong><br>
            ${data.serviceName}<br>
            ${data.date} at ${data.time}
          </div>

          <p class="text">
            We're sorry to see this appointment cancelled. If you'd like to reschedule 
            or book a new appointment, we'd love to help you find a time that works better.
          </p>

          <div style="text-align: center;">
            <a href="${
              process.env.NEXT_PUBLIC_APP_URL
            }/services" class="button">Book Again</a>
          </div>

          <p class="text" style="margin-top: 30px;">
            If you have any questions or concerns, please don't hesitate to reach out.
          </p>
        </div>
        ${getEmailFooter()}
      </div>
    </body>
    </html>
  `;

  const text = `
APPOINTMENT CANCELLED - Modern Beauty Studio

Hi ${data.customerName},

Your appointment has been cancelled.
${data.reason ? `Reason: ${data.reason}` : ""}

CANCELLED APPOINTMENT:
Service: ${data.serviceName}
Date: ${data.date}
Time: ${data.time}

We're sorry to see this appointment cancelled. If you'd like to reschedule or book a new appointment, we'd love to help you find a time that works better.

Book again: ${process.env.NEXT_PUBLIC_APP_URL}/services

If you have any questions or concerns, please don't hesitate to reach out.

Modern Beauty Studio
Asaba, Delta State, Nigeria
Email: mattbokolosi@gmail.com
  `.trim();

  return { html, text };
}

/**
 * Payment Failure Email Template
 */
export function getPaymentFailureTemplate(data: {
  customerName: string;
  orderReference: string;
  amount: number;
  items: Array<{ product_name: string; quantity: number }>;
  reason?: string;
}): { html: string; text: string } {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Failed</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="email-container">
        ${getEmailHeader()}
        <div class="content">
          <h2 class="title">Payment Could Not Be Processed</h2>
          <p class="text">Hi ${data.customerName},</p>
          <p class="text">
            We were unable to process your payment for order <strong>#${
              data.orderReference
            }</strong>.
          </p>

          <div class="alert">
            <strong>Payment Status:</strong> Failed<br>
            ${data.reason ? `<strong>Reason:</strong> ${data.reason}` : ""}
          </div>

          <div class="details-box">
            <div class="detail-row">
              <span class="detail-label">Order Reference:</span>
              <span class="detail-value">#${data.orderReference}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Amount:</span>
              <span class="detail-value">₦${data.amount.toLocaleString()}</span>
            </div>
          </div>

          <p class="text"><strong>Items in your order:</strong></p>
          <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0;">
            ${data.items
              .map(
                (item) => `
              <div style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                ${item.product_name} × ${item.quantity}
              </div>
            `
              )
              .join("")}
          </div>

          <p class="text">
            Don't worry! Your items are still in your cart. You can try completing 
            your purchase again, or contact us if you need assistance.
          </p>

          <div style="text-align: center;">
            <a href="${
              process.env.NEXT_PUBLIC_APP_URL
            }/checkout" class="button">Try Again</a>
          </div>

          <p class="text" style="font-size: 14px; color: #9ca3af; margin-top: 30px;">
            <strong>Common Issues:</strong><br>
            • Insufficient funds<br>
            • Incorrect card details<br>
            • Bank declined the transaction<br>
            • Network timeout
          </p>
        </div>
        ${getEmailFooter()}
      </div>
    </body>
    </html>
  `;

  const text = `
PAYMENT FAILED - Modern Beauty Studio

Hi ${data.customerName},

We were unable to process your payment for order #${data.orderReference}.

PAYMENT STATUS: Failed
${data.reason ? `REASON: ${data.reason}` : ""}

ORDER DETAILS:
Reference: #${data.orderReference}
Amount: ₦${data.amount.toLocaleString()}

ITEMS IN YOUR ORDER:
${data.items
  .map((item) => `- ${item.product_name} × ${item.quantity}`)
  .join("\n")}

Don't worry! Your items are still in your cart. You can try completing your purchase again, or contact us if you need assistance.

Try again: ${process.env.NEXT_PUBLIC_APP_URL}/checkout

COMMON ISSUES:
- Insufficient funds
- Incorrect card details
- Bank declined the transaction
- Network timeout

Modern Beauty Studio
Asaba, Delta State, Nigeria
Email: mattbokolosi@gmail.com
  `.trim();

  return { html, text };
}

/**
 * Promotional/Bulk Email Template
 */
export function getPromotionalTemplate(data: {
  customerName: string;
  subject: string;
  heading: string;
  message: string;
  ctaText?: string;
  ctaLink?: string;
  imageUrl?: string;
  discountCode?: string;
}): { html: string; text: string } {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${data.subject}</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="email-container">
        ${getEmailHeader()}
        ${
          data.imageUrl
            ? `
          <div style="width: 100%; overflow: hidden;">
            <img src="${data.imageUrl}" alt="${data.heading}" style="width: 100%; height: auto; display: block;">
          </div>
        `
            : ""
        }
        <div class="content">
          <h2 class="title">${data.heading}</h2>
          <p class="text">Hi ${data.customerName},</p>
          <div class="text">${data.message}</div>

          ${
            data.discountCode
              ? `
            <div class="success" style="text-align: center; margin: 30px 0;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">Use code:</p>
              <p style="margin: 8px 0; font-size: 24px; font-weight: 700; color: #ec4899; letter-spacing: 2px;">
                ${data.discountCode}
              </p>
            </div>
          `
              : ""
          }

          ${
            data.ctaText && data.ctaLink
              ? `
            <div style="text-align: center;">
              <a href="${data.ctaLink}" class="button">${data.ctaText}</a>
            </div>
          `
              : ""
          }

          <p class="text" style="font-size: 14px; color: #9ca3af; margin-top: 30px;">
            This is a promotional email from Modern Beauty Studio. 
            We hope you enjoy our special offers!
          </p>
        </div>
        ${getEmailFooter()}
      </div>
    </body>
    </html>
  `;

  const text = `
${data.heading.toUpperCase()} - Modern Beauty Studio

Hi ${data.customerName},

${data.message}

${data.discountCode ? `USE CODE: ${data.discountCode}` : ""}

${data.ctaText && data.ctaLink ? `${data.ctaText}: ${data.ctaLink}` : ""}

This is a promotional email from Modern Beauty Studio. We hope you enjoy our special offers!

Modern Beauty Studio
Asaba, Delta State, Nigeria
Email: mattbokolosi@gmail.com
  `.trim();

  return { html, text };
}
