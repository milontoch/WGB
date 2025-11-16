"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ================================================
// Type Definitions
// ================================================
export type Service = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  category: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Booking = {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  service_id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateBookingData = {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  service_id: string;
  booking_date: string;
  booking_time: string;
  notes?: string;
};

// ================================================
// SERVICE ACTIONS
// ================================================

/**
 * Get all active services
 */
export async function getServices() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("category", { ascending: true });

  if (error) {
    console.error("Error fetching services:", error);
    return { data: null, error: error.message };
  }

  return { data: data as Service[], error: null };
}

/**
 * Get a single service by ID
 */
export async function getServiceById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching service:", error);
    return { data: null, error: error.message };
  }

  return { data: data as Service, error: null };
}

/**
 * Get services by category
 */
export async function getServicesByCategory(category: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("category", category)
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching services by category:", error);
    return { data: null, error: error.message };
  }

  return { data: data as Service[], error: null };
}

// ================================================
// BOOKING ACTIONS
// ================================================

/**
 * Create a new booking
 */
export async function createBooking(bookingData: CreateBookingData) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookings")
    .insert([
      {
        customer_name: bookingData.customer_name,
        customer_email: bookingData.customer_email,
        customer_phone: bookingData.customer_phone || null,
        service_id: bookingData.service_id,
        booking_date: bookingData.booking_date,
        booking_time: bookingData.booking_time,
        notes: bookingData.notes || null,
        status: "pending",
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating booking:", error);
    return { data: null, error: error.message };
  }

  revalidatePath("/bookings");
  return { data: data as Booking, error: null };
}

/**
 * Get all bookings
 */
export async function getBookings() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      service:services(name, duration, price)
    `
    )
    .order("booking_date", { ascending: false });

  if (error) {
    console.error("Error fetching bookings:", error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

/**
 * Get bookings by email
 */
export async function getBookingsByEmail(email: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      service:services(name, duration, price)
    `
    )
    .eq("customer_email", email)
    .order("booking_date", { ascending: false });

  if (error) {
    console.error("Error fetching bookings:", error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

/**
 * Update booking status
 */
export async function updateBookingStatus(
  bookingId: string,
  status: "pending" | "confirmed" | "completed" | "cancelled"
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", bookingId)
    .select()
    .single();

  if (error) {
    console.error("Error updating booking status:", error);
    return { data: null, error: error.message };
  }

  revalidatePath("/bookings");
  return { data: data as Booking, error: null };
}

/**
 * Delete a booking
 */
export async function deleteBooking(bookingId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("bookings")
    .delete()
    .eq("id", bookingId);

  if (error) {
    console.error("Error deleting booking:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/bookings");
  return { success: true, error: null };
}
