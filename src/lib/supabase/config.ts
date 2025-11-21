/**
 * Supabase Configuration
 * Centralizes all Supabase environment variables and validation
 */

// Validate required environment variables
const validateEnv = () => {
  const required = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required Supabase environment variables: ${missing.join(", ")}`
    );
  }

  return required;
};

// Export validated config
export const supabaseConfig = validateEnv();

// TypeScript types for database tables
export interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  category: string | null;
  is_active: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  email: string | null;
  phone: string | null;
  active: boolean;
  created_at: string;
}

export interface Availability {
  id: string;
  staff_id: string;
  day_of_week: number; // 0 = Sunday, 6 = Saturday
  start_time: string; // HH:MM:SS format
  end_time: string; // HH:MM:SS format
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  service_id: string;
  staff_id: string | null;
  booking_date: string; // YYYY-MM-DD format
  booking_time: string; // HH:MM:SS format
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: "admin" | "provider" | "customer";
  created_at: string;
}

// E-commerce types
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discount_price: number | null;
  stock: number;
  sku: string | null;
  image_url: string | null;
  category: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: Product; // Joined product data
}

export interface Order {
  id: string;
  user_id: string | null;
  total_amount: number;
  subtotal: number;
  discount_amount: number;
  payment_status: "pending" | "paid" | "failed" | "refunded";
  order_status:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  payment_reference: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address: string;
  shipping_city: string | null;
  shipping_state: string | null;
  is_pickup: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_sku: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string | null;
  rating: number; // 1-5
  comment: string | null;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  user?: {
    full_name: string | null;
    email: string;
  };
}
