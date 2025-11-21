/**
 * Notification Service
 * Handles sending emails with retry logic, error handling, and database logging
 */

import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

// Email configuration using Gmail SMTP
const emailConfig = {
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER || "mattbokolosi@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "", // Use App Password for Gmail
  },
};

// Create reusable transporter
const transporter = nodemailer.createTransport(emailConfig);

// Supabase client for logging (using service role key for server-side operations)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Email log data structure
 */
interface EmailLogData {
  user_id?: string | null;
  email_type:
    | "booking_reminder"
    | "booking_reschedule"
    | "booking_cancellation"
    | "order_confirmation"
    | "payment_failure"
    | "promotional";
  recipient_email: string;
  subject: string;
  related_booking_id?: string | null;
  related_order_id?: string | null;
  campaign_id?: string | null;
  metadata?: Record<string, any>;
}

/**
 * Email sending options
 */
interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
  replyTo?: string;
}

/**
 * Send email with retry logic and database logging
 *
 * @param options - Email sending options
 * @param logData - Data for logging to database
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @returns Promise<boolean> - True if email sent successfully
 */
export async function sendEmail(
  options: SendEmailOptions,
  logData: EmailLogData,
  maxRetries: number = 3
): Promise<boolean> {
  const { to, subject, html, text, from, replyTo } = options;

  // Create initial email log entry
  const { data: logEntry, error: logError } = await supabase
    .from("email_logs")
    .insert({
      user_id: logData.user_id,
      email_type: logData.email_type,
      recipient_email: to,
      subject: subject,
      status: "pending",
      related_booking_id: logData.related_booking_id,
      related_order_id: logData.related_order_id,
      campaign_id: logData.campaign_id,
      metadata: logData.metadata,
      retry_count: 0,
    })
    .select()
    .single();

  if (logError) {
    console.error("Failed to create email log:", logError);
  }

  const logId = logEntry?.id;

  // Attempt to send email with retry logic
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `Sending email to ${to} (attempt ${attempt + 1}/${maxRetries + 1})`
      );

      // Send email
      const info = await transporter.sendMail({
        from: from || `"Modern Beauty Studio" <${emailConfig.auth.user}>`,
        to,
        subject,
        text,
        html,
        replyTo: replyTo || emailConfig.auth.user,
      });

      console.log(`Email sent successfully: ${info.messageId}`);

      // Update log entry as sent
      if (logId) {
        await supabase
          .from("email_logs")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
            retry_count: attempt,
            metadata: {
              ...logData.metadata,
              message_id: info.messageId,
              response: info.response,
            },
          })
          .eq("id", logId);
      }

      return true;
    } catch (error: any) {
      lastError = error;
      console.error(`Email send attempt ${attempt + 1} failed:`, error.message);

      // Update retry count
      if (logId) {
        await supabase
          .from("email_logs")
          .update({
            status: attempt < maxRetries ? "retrying" : "failed",
            retry_count: attempt + 1,
            error_message: error.message,
          })
          .eq("id", logId);
      }

      // Wait before retry (exponential backoff: 2s, 4s, 8s...)
      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`Waiting ${waitTime}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  // All attempts failed
  console.error(
    `Failed to send email after ${maxRetries + 1} attempts:`,
    lastError?.message
  );
  return false;
}

/**
 * Send bulk emails (for promotional campaigns)
 *
 * @param recipients - Array of recipient email addresses
 * @param subject - Email subject
 * @param html - HTML email content
 * @param text - Plain text email content
 * @param campaignId - Campaign identifier for tracking
 * @returns Promise with success count and failed emails
 */
export async function sendBulkEmails(
  recipients: Array<{ email: string; user_id?: string; name?: string }>,
  subject: string,
  html: string,
  text: string,
  campaignId: string
): Promise<{ successCount: number; failedEmails: string[] }> {
  console.log(
    `Starting bulk email campaign: ${campaignId} to ${recipients.length} recipients`
  );

  let successCount = 0;
  const failedEmails: string[] = [];

  // Send emails in batches to avoid overwhelming the SMTP server
  const batchSize = 10;
  const delayBetweenBatches = 2000; // 2 seconds

  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);

    console.log(
      `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
        recipients.length / batchSize
      )}`
    );

    // Send emails in parallel within batch
    const promises = batch.map(async (recipient) => {
      // Personalize email if name is provided
      const personalizedHtml = html.replace(
        /{{name}}/g,
        recipient.name || "Valued Customer"
      );
      const personalizedText = text.replace(
        /{{name}}/g,
        recipient.name || "Valued Customer"
      );

      const success = await sendEmail(
        {
          to: recipient.email,
          subject,
          html: personalizedHtml,
          text: personalizedText,
        },
        {
          user_id: recipient.user_id,
          email_type: "promotional",
          recipient_email: recipient.email,
          subject,
          campaign_id: campaignId,
          metadata: {
            campaign_name: campaignId,
            batch_number: Math.floor(i / batchSize) + 1,
          },
        }
      );

      if (success) {
        successCount++;
      } else {
        failedEmails.push(recipient.email);
      }
    });

    await Promise.all(promises);

    // Delay between batches
    if (i + batchSize < recipients.length) {
      console.log(`Waiting ${delayBetweenBatches}ms before next batch...`);
      await new Promise((resolve) => setTimeout(resolve, delayBetweenBatches));
    }
  }

  console.log(
    `Bulk email campaign completed: ${successCount}/${recipients.length} sent successfully`
  );

  return { successCount, failedEmails };
}

/**
 * Get email logs for a specific user
 */
export async function getUserEmailLogs(userId: string, limit: number = 50) {
  const { data, error } = await supabase
    .from("email_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch email logs:", error);
    return [];
  }

  return data;
}

/**
 * Get all email logs (admin only)
 */
export async function getAllEmailLogs(
  filters?: {
    email_type?: string;
    status?: string;
    campaign_id?: string;
    from_date?: string;
    to_date?: string;
  },
  limit: number = 100
) {
  let query = supabase
    .from("email_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (filters?.email_type) {
    query = query.eq("email_type", filters.email_type);
  }
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.campaign_id) {
    query = query.eq("campaign_id", filters.campaign_id);
  }
  if (filters?.from_date) {
    query = query.gte("created_at", filters.from_date);
  }
  if (filters?.to_date) {
    query = query.lte("created_at", filters.to_date);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch email logs:", error);
    return [];
  }

  return data;
}

/**
 * Get email statistics
 */
export async function getEmailStats(period?: string) {
  const { data, error } = await supabase
    .from("email_logs")
    .select("email_type, status, created_at");

  if (error) {
    console.error("Failed to fetch email stats:", error);
    return null;
  }

  // Calculate statistics
  const stats = {
    total: data.length,
    sent: data.filter((log) => log.status === "sent").length,
    failed: data.filter((log) => log.status === "failed").length,
    pending: data.filter((log) => log.status === "pending").length,
    retrying: data.filter((log) => log.status === "retrying").length,
    byType: {} as Record<string, number>,
    successRate: 0,
  };

  // Count by type
  data.forEach((log) => {
    stats.byType[log.email_type] = (stats.byType[log.email_type] || 0) + 1;
  });

  // Calculate success rate
  if (stats.total > 0) {
    stats.successRate = (stats.sent / stats.total) * 100;
  }

  return stats;
}

/**
 * Retry failed emails
 */
export async function retryFailedEmails(emailLogId: string): Promise<boolean> {
  const { data: logEntry, error } = await supabase
    .from("email_logs")
    .select("*")
    .eq("id", emailLogId)
    .single();

  if (error || !logEntry) {
    console.error("Failed to fetch email log for retry:", error);
    return false;
  }

  // Only retry if status is failed
  if (logEntry.status !== "failed") {
    console.log("Email is not in failed status, skipping retry");
    return false;
  }

  // Reset status to pending
  await supabase
    .from("email_logs")
    .update({
      status: "pending",
      error_message: null,
    })
    .eq("id", emailLogId);

  // Note: Actual retry would require re-sending the email
  // This would need the original email content stored in metadata
  console.log(`Email log ${emailLogId} marked for retry`);

  return true;
}

/**
 * Verify email configuration
 */
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log("Email configuration verified successfully");
    return true;
  } catch (error: any) {
    console.error("Email configuration verification failed:", error.message);
    return false;
  }
}
