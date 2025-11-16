-- ================================================
-- Beauty Services Database Schema
-- Run this SQL in Supabase SQL Editor
-- ================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- TABLE: services
-- Stores all available beauty services
-- ================================================
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration INTEGER NOT NULL, -- duration in minutes
  category VARCHAR(100), -- e.g., 'Hair', 'Skincare', 'Makeup', 'Spa'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ================================================
-- TABLE: bookings
-- Stores customer appointment bookings
-- ================================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ================================================
-- INDEXES for better query performance
-- ================================================
CREATE INDEX IF NOT EXISTS idx_bookings_service_id ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);

-- ================================================
-- FUNCTIONS: Auto-update updated_at timestamp
-- ================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- TRIGGERS: Auto-update updated_at on changes
-- ================================================
DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- ROW LEVEL SECURITY (RLS) - Enable for production
-- ================================================
-- Enable RLS on tables
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active services
CREATE POLICY "Public services are viewable by everyone"
  ON services FOR SELECT
  USING (is_active = true);

-- Allow authenticated users to view all services
CREATE POLICY "Authenticated users can view all services"
  ON services FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert/update services (for admin)
CREATE POLICY "Authenticated users can manage services"
  ON services FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow anyone to create bookings (for public booking form)
CREATE POLICY "Anyone can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);

-- Allow users to view their own bookings by email
CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  USING (customer_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Allow authenticated users to view all bookings (for admin)
CREATE POLICY "Authenticated users can view all bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to update bookings (for admin)
CREATE POLICY "Authenticated users can update bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ================================================
-- SAMPLE DATA (Optional - for testing)
-- ================================================
INSERT INTO services (name, description, price, duration, category) VALUES
  ('Signature Haircut & Style', 'Professional haircut with styling by our expert stylists', 85.00, 60, 'Hair'),
  ('Deluxe Facial Treatment', 'Deep cleansing facial with hydration and massage', 120.00, 75, 'Skincare'),
  ('Bridal Makeup Package', 'Complete bridal makeup with trial session included', 250.00, 120, 'Makeup'),
  ('Relaxation Massage', 'Full body relaxation massage with aromatherapy', 140.00, 90, 'Spa'),
  ('Express Manicure', 'Quick and professional manicure service', 45.00, 30, 'Nails'),
  ('Hair Coloring', 'Professional hair coloring with premium products', 150.00, 120, 'Hair');

-- ================================================
-- SUCCESS MESSAGE
-- ================================================
-- If you see this, the schema was created successfully!
-- Next steps:
-- 1. Check the 'services' and 'bookings' tables in Supabase
-- 2. Verify RLS policies are active
-- 3. Test with your Next.js application
