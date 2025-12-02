/**
 * Booking Notifications
 * Functions to send emails for booking reminders, reschedules, and cancellations
 */

import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "./notification-service";
import {
  getBookingReminderTemplate,
  getBookingRescheduleTemplate,
  getBookingCancellationTemplate,
} from "./email-templates";

// Supabase client (using service role for server-side operations)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key"
);

/**
 * Send booking reminder email (1 day before appointment)
 *
 * @param bookingId - The booking ID
 * @returns Promise<boolean> - True if email sent successfully
 */
export async function sendBookingReminder(bookingId: string): Promise<boolean> {
  try {
    // Fetch booking details with related data
    const { data: booking, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        user:users!bookings_user_id_fkey(id, email, first_name, last_name),
        service:services!bookings_service_id_fkey(id, name),
        staff:users!bookings_staff_id_fkey(first_name, last_name)
      `
      )
      .eq("id", bookingId)
      .single();

    if (error || !booking) {
      console.error("Failed to fetch booking:", error);
      return false;
    }

    // Check if booking is confirmed
    if (booking.status !== "confirmed") {
      console.log(`Booking ${bookingId} is not confirmed, skipping reminder`);
      return false;
    }

    // Format date and time
    const bookingDate = new Date(booking.booking_date);
    const formattedDate = bookingDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedTime = booking.booking_time || "To be confirmed";

    // Get customer name
    const customerName = booking.user?.first_name
      ? `${booking.user.first_name} ${booking.user.last_name || ""}`.trim()
      : "Valued Customer";

    // Get staff name
    const staffName = booking.staff?.first_name
      ? `${booking.staff.first_name} ${booking.staff.last_name || ""}`.trim()
      : "Our Team";

    // Generate email template
    const { html, text } = getBookingReminderTemplate({
      customerName,
      serviceName: booking.service?.name || "Beauty Service",
      date: formattedDate,
      time: formattedTime,
      staffName,
      location: booking.location || "Modern Beauty Studio, Asaba",
      isPickup: booking.is_pickup || false,
    });

    // Send email
    const success = await sendEmail(
      {
        to: booking.user?.email || "",
        subject: "Reminder: Your Appointment is Tomorrow! 💅",
        html,
        text,
      },
      {
        user_id: booking.user_id,
        email_type: "booking_reminder",
        recipient_email: booking.user?.email || "",
        subject: "Reminder: Your Appointment is Tomorrow!",
        related_booking_id: bookingId,
        metadata: {
          service_name: booking.service?.name,
          booking_date: booking.booking_date,
          booking_time: booking.booking_time,
        },
      }
    );

    if (success) {
      console.log(`Booking reminder sent for booking ${bookingId}`);
    }

    return success;
  } catch (error: any) {
    console.error("Error sending booking reminder:", error.message);
    return false;
  }
}

/**
 * Send booking reschedule notification
 *
 * @param bookingId - The booking ID
 * @param oldDate - Previous booking date
 * @param oldTime - Previous booking time
 * @param newDate - New booking date
 * @param newTime - New booking time
 * @param reason - Optional reason for rescheduling
 * @returns Promise<boolean> - True if email sent successfully
 */
export async function sendBookingRescheduleNotification(
  bookingId: string,
  oldDate: string,
  oldTime: string,
  newDate: string,
  newTime: string,
  reason?: string
): Promise<boolean> {
  try {
    // Fetch booking details
    const { data: booking, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        user:users!bookings_user_id_fkey(id, email, first_name, last_name),
        service:services!bookings_service_id_fkey(id, name),
        staff:users!bookings_staff_id_fkey(first_name, last_name)
      `
      )
      .eq("id", bookingId)
      .single();

    if (error || !booking) {
      console.error("Failed to fetch booking:", error);
      return false;
    }

    // Format dates
    const oldDateFormatted = new Date(oldDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const newDateFormatted = new Date(newDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Get customer name
    const customerName = booking.user?.first_name
      ? `${booking.user.first_name} ${booking.user.last_name || ""}`.trim()
      : "Valued Customer";

    // Get staff name
    const staffName = booking.staff?.first_name
      ? `${booking.staff.first_name} ${booking.staff.last_name || ""}`.trim()
      : "Our Team";

    // Generate email template
    const { html, text } = getBookingRescheduleTemplate({
      customerName,
      serviceName: booking.service?.name || "Beauty Service",
      oldDate: oldDateFormatted,
      oldTime,
      newDate: newDateFormatted,
      newTime,
      staffName,
      reason,
    });

    // Send email
    const success = await sendEmail(
      {
        to: booking.user?.email || "",
        subject: "Your Appointment Has Been Rescheduled",
        html,
        text,
      },
      {
        user_id: booking.user_id,
        email_type: "booking_reschedule",
        recipient_email: booking.user?.email || "",
        subject: "Your Appointment Has Been Rescheduled",
        related_booking_id: bookingId,
        metadata: {
          service_name: booking.service?.name,
          old_date: oldDate,
          old_time: oldTime,
          new_date: newDate,
          new_time: newTime,
          reason,
        },
      }
    );

    if (success) {
      console.log(`Reschedule notification sent for booking ${bookingId}`);
    }

    return success;
  } catch (error: any) {
    console.error("Error sending reschedule notification:", error.message);
    return false;
  }
}

/**
 * Send booking cancellation notification
 *
 * @param bookingId - The booking ID
 * @param reason - Optional reason for cancellation
 * @returns Promise<boolean> - True if email sent successfully
 */
export async function sendBookingCancellationNotification(
  bookingId: string,
  reason?: string
): Promise<boolean> {
  try {
    // Fetch booking details
    const { data: booking, error } = await supabase
      .from("bookings")
      .select(
        `
        *,
        user:users!bookings_user_id_fkey(id, email, first_name, last_name),
        service:services!bookings_service_id_fkey(id, name)
      `
      )
      .eq("id", bookingId)
      .single();

    if (error || !booking) {
      console.error("Failed to fetch booking:", error);
      return false;
    }

    // Format date and time
    const bookingDate = new Date(booking.booking_date);
    const formattedDate = bookingDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedTime = booking.booking_time || "To be confirmed";

    // Get customer name
    const customerName = booking.user?.first_name
      ? `${booking.user.first_name} ${booking.user.last_name || ""}`.trim()
      : "Valued Customer";

    // Generate email template
    const { html, text } = getBookingCancellationTemplate({
      customerName,
      serviceName: booking.service?.name || "Beauty Service",
      date: formattedDate,
      time: formattedTime,
      reason,
    });

    // Send email
    const success = await sendEmail(
      {
        to: booking.user?.email || "",
        subject: "Appointment Cancelled",
        html,
        text,
      },
      {
        user_id: booking.user_id,
        email_type: "booking_cancellation",
        recipient_email: booking.user?.email || "",
        subject: "Appointment Cancelled",
        related_booking_id: bookingId,
        metadata: {
          service_name: booking.service?.name,
          booking_date: booking.booking_date,
          booking_time: booking.booking_time,
          reason,
        },
      }
    );

    if (success) {
      console.log(`Cancellation notification sent for booking ${bookingId}`);
    }

    return success;
  } catch (error: any) {
    console.error("Error sending cancellation notification:", error.message);
    return false;
  }
}

/**
 * Get bookings that need reminders (1 day before appointment)
 *
 * @returns Promise<Array> - List of booking IDs that need reminders
 */
export async function getBookingsNeedingReminders(): Promise<string[]> {
  try {
    // Calculate tomorrow's date range
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    const tomorrowISO = tomorrow.toISOString().split("T")[0];
    const dayAfterTomorrowISO = dayAfterTomorrow.toISOString().split("T")[0];

    // Fetch confirmed bookings for tomorrow
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("id, booking_date")
      .eq("status", "confirmed")
      .gte("booking_date", tomorrowISO)
      .lt("booking_date", dayAfterTomorrowISO);

    if (error) {
      console.error("Failed to fetch bookings needing reminders:", error);
      return [];
    }

    // Check if reminders were already sent
    const bookingIds = bookings?.map((b) => b.id) || [];

    if (bookingIds.length === 0) {
      return [];
    }

    // Check email logs to see which reminders were already sent
    const { data: sentReminders } = await supabase
      .from("email_logs")
      .select("related_booking_id")
      .eq("email_type", "booking_reminder")
      .in("related_booking_id", bookingIds)
      .eq("status", "sent");

    const sentBookingIds = new Set(
      sentReminders?.map((log) => log.related_booking_id) || []
    );

    // Filter out bookings that already received reminders
    const needsReminder = bookingIds.filter((id) => !sentBookingIds.has(id));

    console.log(`Found ${needsReminder.length} bookings needing reminders`);

    return needsReminder;
  } catch (error: any) {
    console.error("Error fetching bookings needing reminders:", error.message);
    return [];
  }
}

/**
 * Send reminders for all bookings that need them
 * (Called by scheduler/cron job)
 *
 * @returns Promise with count of sent reminders
 */
export async function sendAllBookingReminders(): Promise<{
  total: number;
  sent: number;
  failed: number;
}> {
  const bookingIds = await getBookingsNeedingReminders();

  let sent = 0;
  let failed = 0;

  for (const bookingId of bookingIds) {
    const success = await sendBookingReminder(bookingId);
    if (success) {
      sent++;
    } else {
      failed++;
    }

    // Small delay between emails to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log(
    `Reminder summary: ${sent} sent, ${failed} failed out of ${bookingIds.length} total`
  );

  return {
    total: bookingIds.length,
    sent,
    failed,
  };
}
