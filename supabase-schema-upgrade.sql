-- =====================================================
-- SCHEMA UPGRADE: Add Staff & Availability Management
-- =====================================================
-- Run this AFTER your existing schemas (supabase-schema.sql and supabase-auth-schema.sql)
-- This adds staff management and scheduling capabilities

-- =====================================================
-- 1. ADD image_url to services table
-- =====================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'services' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE services ADD COLUMN image_url TEXT;
  END IF;
END $$;

-- =====================================================
-- 2. CREATE staff table
-- =====================================================
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT DEFAULT 'assistant' CHECK (role IN ('owner', 'assistant')),
  email TEXT UNIQUE,
  phone TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Policies for staff
CREATE POLICY "Anyone can view active staff" 
  ON staff FOR SELECT 
  USING (active = true);

CREATE POLICY "Admins can manage staff" 
  ON staff FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add updated_at trigger
DROP TRIGGER IF EXISTS update_staff_updated_at ON staff;
CREATE TRIGGER update_staff_updated_at
  BEFORE UPDATE ON staff
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. CREATE availability table
-- =====================================================
CREATE TABLE IF NOT EXISTS availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Enable RLS
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

-- Policies for availability
CREATE POLICY "Anyone can view availability" 
  ON availability FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage availability" 
  ON availability FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_availability_staff_id ON availability(staff_id);
CREATE INDEX IF NOT EXISTS idx_availability_day ON availability(day_of_week);

-- =====================================================
-- 4. ADD staff_id to bookings table
-- =====================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'staff_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN staff_id UUID REFERENCES staff(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_bookings_staff_id ON bookings(staff_id);
  END IF;
END $$;

-- =====================================================
-- 5. CREATE unique constraint to prevent double booking
-- =====================================================
-- This prevents the same staff from being booked at the same date/time
CREATE UNIQUE INDEX IF NOT EXISTS bookings_unique_slot
  ON bookings (staff_id, booking_date, booking_time)
  WHERE staff_id IS NOT NULL;

-- =====================================================
-- 6. SAMPLE STAFF DATA
-- =====================================================
-- Insert owner and assistant (customize names and emails)
INSERT INTO staff (name, role, email, phone, active) VALUES
  ('Owner Name', 'owner', 'owner@wgb.com', '+1234567890', true),
  ('Assistant Name', 'assistant', 'assistant@wgb.com', '+1234567891', true)
ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- 7. SAMPLE AVAILABILITY DATA
-- =====================================================
-- Set default availability for all staff (Monday-Friday, 9 AM - 5 PM)
-- Customize as needed

WITH staff_members AS (
  SELECT id FROM staff WHERE active = true
)
INSERT INTO availability (staff_id, day_of_week, start_time, end_time)
SELECT 
  id,
  day,
  '09:00:00'::time,
  '17:00:00'::time
FROM staff_members
CROSS JOIN generate_series(1, 5) AS day -- Monday (1) to Friday (5)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 8. HELPER FUNCTIONS
-- =====================================================

-- Function to get available staff for a given date/time
CREATE OR REPLACE FUNCTION get_available_staff(
  p_date DATE,
  p_time TIME
)
RETURNS TABLE (
  staff_id UUID,
  staff_name TEXT,
  staff_role TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    s.id,
    s.name,
    s.role
  FROM staff s
  INNER JOIN availability a ON s.id = a.staff_id
  WHERE 
    s.active = true
    AND a.day_of_week = EXTRACT(DOW FROM p_date)::INT
    AND p_time >= a.start_time
    AND p_time < a.end_time
    AND NOT EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.staff_id = s.id
        AND b.booking_date = p_date
        AND b.booking_time = p_time
        AND b.status NOT IN ('cancelled')
    );
END;
$$ LANGUAGE plpgsql;

-- Function to check if a booking slot is available
CREATE OR REPLACE FUNCTION is_slot_available(
  p_staff_id UUID,
  p_date DATE,
  p_time TIME
)
RETURNS BOOLEAN AS $$
DECLARE
  v_day_of_week INT;
  v_is_available BOOLEAN;
BEGIN
  v_day_of_week := EXTRACT(DOW FROM p_date)::INT;
  
  -- Check if staff has availability for this day/time
  SELECT EXISTS (
    SELECT 1 FROM availability a
    WHERE a.staff_id = p_staff_id
      AND a.day_of_week = v_day_of_week
      AND p_time >= a.start_time
      AND p_time < a.end_time
  ) INTO v_is_available;
  
  IF NOT v_is_available THEN
    RETURN false;
  END IF;
  
  -- Check if slot is already booked
  SELECT NOT EXISTS (
    SELECT 1 FROM bookings b
    WHERE b.staff_id = p_staff_id
      AND b.booking_date = p_date
      AND b.booking_time = p_time
      AND b.status NOT IN ('cancelled')
  ) INTO v_is_available;
  
  RETURN v_is_available;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the upgrade:

-- Check staff table
-- SELECT * FROM staff;

-- Check availability table
-- SELECT * FROM availability ORDER BY staff_id, day_of_week, start_time;

-- Check services now have image_url
-- SELECT id, name, image_url FROM services LIMIT 5;

-- Check bookings now have staff_id
-- SELECT id, customer_name, staff_id, booking_date, booking_time FROM bookings LIMIT 5;

-- Test available staff function
-- SELECT * FROM get_available_staff('2025-11-20', '10:00:00');

-- Test slot availability function
-- SELECT is_slot_available(
--   (SELECT id FROM staff LIMIT 1),
--   '2025-11-20',
--   '10:00:00'
-- );

-- =====================================================
-- SUCCESS!
-- =====================================================
-- Your schema now includes:
-- ✅ Staff management (owner & assistants)
-- ✅ Availability scheduling by day/time
-- ✅ Staff assignment to bookings
-- ✅ Double-booking prevention
-- ✅ Helper functions for checking availability
-- ✅ Image URLs for services
