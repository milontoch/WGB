-- =====================================================
-- PHASE 4: AUTHENTICATION & ROLE-BASED ACCESS CONTROL
-- =====================================================
-- Run this in your Supabase SQL Editor after Phase 2 schema

-- 1. Enable RLS on existing tables
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- 1.5. Add user_id column to bookings table (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
  END IF;
END $$;

-- 2. Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create policies for profiles
-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
  ON profiles FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 5. Create policies for services
-- Everyone can view active services
CREATE POLICY "Anyone can view services" 
  ON services FOR SELECT 
  USING (is_active = true);

-- Only admins can insert/update/delete services
CREATE POLICY "Admins can manage services" 
  ON services FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 6. Create policies for bookings
-- Users can view their own bookings (by user_id or email)
CREATE POLICY "Users can view own bookings" 
  ON bookings FOR SELECT 
  USING (
    user_id = auth.uid() 
    OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Users can create their own bookings
CREATE POLICY "Users can create bookings" 
  ON bookings FOR INSERT 
  WITH CHECK (
    user_id = auth.uid() 
    OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings" 
  ON bookings FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all bookings
CREATE POLICY "Admins can update bookings" 
  ON bookings FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 7. Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Insert test admin user (OPTIONAL - for development only)
-- Note: This is commented out because direct auth.users insert is restricted
-- Instead, create admin user through the UI at /auth/register
-- Then manually update their role in the profiles table:
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';

/*
-- Alternative: Use Supabase Dashboard to create user, then run:
UPDATE profiles SET role = 'admin' WHERE email = 'admin@wgb.com';
*/

-- 10. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. Create trigger for profiles updated_at
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify setup:

-- Check profiles table structure
-- SELECT * FROM profiles;

-- Check RLS policies
-- SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Test admin user was created
-- SELECT email, raw_user_meta_data FROM auth.users WHERE email = 'admin@wgb.com';
