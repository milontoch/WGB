/**
 * Order Notifications
 * Functions to send emails for order confirmations and payment failures
 */

import { sendEmail } from "./notification-service";
import { getPaymentFailureTemplate } from "./email-templates";

/**
 * Enhanced order confirmation email with database logging
 * (Replaces the existing sendOrderConfirmationEmail)
 */
export async function sendOrderConfirmationEmail(data: {
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
    total_price: number;
  }>;
  shipping: {
    is_pickup: boolean;
    address?: string | null;
    city?: string | null;
    state?: string | null;
  };
}): Promise<boolean> {
  const { to, customerName, order, items, shipping } = data;

  // Generate HTML email
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
      <style>
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
        .success {
          background-color: #f0fdf4;
          border-left: 4px solid #22c55e;
          padding: 16px;
          margin: 20px 0;
          border-radius: 8px;
          text-align: center;
        }
        .order-number {
          font-size: 20px;
          font-weight: 700;
          color: #22c55e;
          margin: 8px 0;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 24px 0;
        }
        .items-table th {
          background-color: #fdf2f8;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #ec4899;
        }
        .items-table td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
        }
        .total-row {
          font-weight: 600;
          background-color: #fdf2f8;
        }
        .details-box {
          background-color: #fdf2f8;
          border-left: 4px solid #ec4899;
          padding: 20px;
          margin: 24px 0;
          border-radius: 8px;
        }
        .detail-row {
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
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1 class="logo">Modern Beauty Studio</h1>
          <p class="tagline">Minimal Luxury</p>
        </div>
        <div class="content">
          <h2 class="title">Thank You for Your Order! 🎉</h2>
          <p class="text">Hi ${customerName},</p>
          <p class="text">
            We've received your order and it's being processed. You'll receive another 
            email when your order is ready for pickup or has been shipped.
          </p>

          <div class="success">
            <div style="font-size: 14px; color: #6b7280;">Order Number</div>
            <div class="order-number">#${order.id
              .substring(0, 8)
              .toUpperCase()}</div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${items
                .map(
                  (item) => `
                <tr>
                  <td>${item.product_name}</td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">₦${item.unit_price.toLocaleString()}</td>
                  <td style="text-align: right;">₦${item.total_price.toLocaleString()}</td>
                </tr>
              `
                )
                .join("")}
              <tr>
                <td colspan="3" style="text-align: right; font-weight: 600;">Subtotal:</td>
                <td style="text-align: right; font-weight: 600;">₦${order.subtotal.toLocaleString()}</td>
              </tr>
              ${
                order.discount > 0
                  ? `
              <tr>
                <td colspan="3" style="text-align: right; color: #22c55e;">Discount:</td>
                <td style="text-align: right; color: #22c55e;">-₦${order.discount.toLocaleString()}</td>
              </tr>
              `
                  : ""
              }
              <tr class="total-row">
                <td colspan="3" style="text-align: right; font-size: 18px;">Total:</td>
                <td style="text-align: right; font-size: 18px;">₦${order.total.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div class="details-box">
            <h3 style="margin: 0 0 16px 0; color: #374151;">Delivery Information</h3>
            ${
              shipping.is_pickup
                ? `
              <div class="detail-row">
                <div class="detail-label">Delivery Method:</div>
                <div class="detail-value">Pick-up at Store</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Location:</div>
                <div class="detail-value">Modern Beauty Studio, Asaba, Delta State</div>
              </div>
            `
                : `
              <div class="detail-row">
                <div class="detail-label">Delivery Method:</div>
                <div class="detail-value">Home Delivery</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Address:</div>
                <div class="detail-value">${shipping.address || "N/A"}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">City:</div>
                <div class="detail-value">${shipping.city || "N/A"}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">State:</div>
                <div class="detail-value">${shipping.state || "N/A"}</div>
              </div>
            `
            }
            <div class="detail-row">
              <div class="detail-label">Payment Status:</div>
              <div class="detail-value" style="color: #22c55e; font-weight: 600;">Paid</div>
            </div>
          </div>

          <div style="text-align: center;">
            <a href="${
              process.env.NEXT_PUBLIC_APP_URL
            }/orders" class="button">View Order Details</a>
          </div>

          <p class="text" style="margin-top: 30px;">
            If you have any questions about your order, please don't hesitate to contact us.
          </p>
        </div>
        <div class="footer">
          <p class="footer-text">Modern Beauty Studio</p>
          <p class="footer-text">Asaba, Delta State, Nigeria</p>
          <p class="footer-text" style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
            You received this email because you placed an order with Modern Beauty Studio.<br>
            If you have any questions, reply to this email or contact us at mattbokolosi@gmail.com
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Generate plain text version
  const text = `
ORDER CONFIRMATION - Modern Beauty Studio

Hi ${customerName},

We've received your order and it's being processed. You'll receive another email when your order is ready for pickup or has been shipped.

Order Number: #${order.id.substring(0, 8).toUpperCase()}

ORDER ITEMS:
${items
  .map(
    (item) =>
      `- ${item.product_name} × ${
        item.quantity
      } = ₦${item.total_price.toLocaleString()}`
  )
  .join("\n")}

Subtotal: ₦${order.subtotal.toLocaleString()}
${
  order.discount > 0 ? `Discount: -₦${order.discount.toLocaleString()}\n` : ""
}Total: ₦${order.total.toLocaleString()}

DELIVERY INFORMATION:
${
  shipping.is_pickup
    ? `Delivery Method: Pick-up at Store
Location: Modern Beauty Studio, Asaba, Delta State`
    : `Delivery Method: Home Delivery
Address: ${shipping.address || "N/A"}
City: ${shipping.city || "N/A"}
State: ${shipping.state || "N/A"}`
}
Payment Status: Paid

View your order: ${process.env.NEXT_PUBLIC_APP_URL}/orders

If you have any questions about your order, please don't hesitate to contact us.

Modern Beauty Studio
Asaba, Delta State, Nigeria
Email: mattbokolosi@gmail.com
  `.trim();

  // Extract user_id if available (would need to be passed in)
  // For now, we'll leave it null and use the email to identify the user

  // Send email with logging
  return await sendEmail(
    {
      to,
      subject: `Order Confirmation #${order.id.substring(0, 8).toUpperCase()}`,
      html,
      text,
    },
    {
      email_type: "order_confirmation",
      recipient_email: to,
      subject: `Order Confirmation #${order.id.substring(0, 8).toUpperCase()}`,
      related_order_id: order.id,
      metadata: {
        order_total: order.total,
        item_count: items.length,
        is_pickup: shipping.is_pickup,
      },
    }
  );
}

/**
 * Send payment failure notification
 *
 * @param data - Payment failure details
 * @returns Promise<boolean> - True if email sent successfully
 */
export async function sendPaymentFailureEmail(data: {
  userId?: string;
  customerName: string;
  customerEmail: string;
  orderReference: string;
  amount: number;
  items: Array<{ product_name: string; quantity: number }>;
  reason?: string;
}): Promise<boolean> {
  const {
    userId,
    customerName,
    customerEmail,
    orderReference,
    amount,
    items,
    reason,
  } = data;

  // Generate email template
  const { html, text } = getPaymentFailureTemplate({
    customerName,
    orderReference,
    amount,
    items,
    reason,
  });

  // Send email with logging
  return await sendEmail(
    {
      to: customerEmail,
      subject: "Payment Failed - Action Required",
      html,
      text,
    },
    {
      user_id: userId,
      email_type: "payment_failure",
      recipient_email: customerEmail,
      subject: "Payment Failed - Action Required",
      metadata: {
        order_reference: orderReference,
        amount,
        reason,
        item_count: items.length,
      },
    }
  );
}

/**
 * Send order status update email (future enhancement)
 * For shipping/delivery notifications
 */
export async function sendOrderStatusUpdateEmail(data: {
  userId?: string;
  customerName: string;
  customerEmail: string;
  orderId: string;
  orderStatus: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}): Promise<boolean> {
  // Placeholder for future implementation
  // This would send emails for:
  // - Order shipped
  // - Out for delivery
  // - Delivered
  // - Ready for pickup

  console.log("Order status update email (not yet implemented):", data);
  return true;
}
