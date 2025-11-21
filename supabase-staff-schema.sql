-- =====================================================
-- BEAUTY STUDIO BOOKING SYSTEM - SAFE UPGRADE
-- Only creates missing tables and adds missing columns
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ADD image_url to existing services table
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
-- CREATE staff table (NEW - doesn't exist)
-- =====================================================
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT DEFAULT 'assistant',
  email TEXT UNIQUE,
  phone TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CREATE availability table (NEW - doesn't exist)
-- =====================================================
CREATE TABLE IF NOT EXISTS availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- =====================================================
-- ADD staff_id to existing bookings table
-- =====================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'staff_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN staff_id UUID REFERENCES staff(id) ON DELETE SET NULL;
  END IF;
END $$;

-- =====================================================
-- INDEXES (all idempotent)
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_availability_staff_id ON availability(staff_id);
CREATE INDEX IF NOT EXISTS idx_availability_day ON availability(day_of_week);
CREATE INDEX IF NOT EXISTS idx_bookings_staff_id ON bookings(staff_id);

-- =====================================================
-- UNIQUE CONSTRAINT: Prevent double booking
-- =====================================================
CREATE UNIQUE INDEX IF NOT EXISTS bookings_unique_slot
  ON bookings (staff_id, booking_date, booking_time)
  WHERE staff_id IS NOT NULL;

-- =====================================================
-- ROW LEVEL SECURITY for new tables
-- =====================================================
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES (with existence checks)
-- =====================================================

-- Staff policies
DROP POLICY IF EXISTS "Anyone can view active staff" ON staff;
DROP POLICY IF EXISTS "Admins can manage staff" ON staff;

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

-- Availability policies
DROP POLICY IF EXISTS "Anyone can view availability" ON availability;
DROP POLICY IF EXISTS "Admins can manage availability" ON availability;

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
