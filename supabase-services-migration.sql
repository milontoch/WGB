-- ================================================
-- Add image_url column to services table
-- Migration for TheGem redesign
-- ================================================

-- Add image_url column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'services' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE services ADD COLUMN image_url TEXT;
  END IF;
END $$;

-- Update existing services or insert new luxury services
-- Permanent tattoo
INSERT INTO services (name, description, price, duration, category, image_url, is_active) VALUES
  ('Permanent Tattoo', 'Professional permanent tattoo artistry with custom designs tailored to your vision', 250.00, 180, 'Body Art', 'https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=800', true)
ON CONFLICT DO NOTHING;

-- Semi-permanent tattoo
INSERT INTO services (name, description, price, duration, category, image_url, is_active) VALUES
  ('Semi-Permanent Tattoo', 'Temporary tattoo designs that fade naturally over 1-3 years, perfect for first-timers', 180.00, 120, 'Body Art', 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=800', true)
ON CONFLICT DO NOTHING;

-- Brows lamination
INSERT INTO services (name, description, price, duration, category, image_url, is_active) VALUES
  ('Brows Lamination', 'Transform your brows with a lifted, fuller look that lasts up to 8 weeks', 85.00, 60, 'Brows', 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800', true)
ON CONFLICT DO NOTHING;

-- Lash extension
INSERT INTO services (name, description, price, duration, category, image_url, is_active) VALUES
  ('Lash Extension', 'Luxurious lash extensions for dramatic volume and length that enhance your natural beauty', 120.00, 90, 'Lashes', 'https://images.unsplash.com/photo-1583001809154-04e05d01f584?w=800', true)
ON CONFLICT DO NOTHING;

-- Teeth whitening
INSERT INTO services (name, description, price, duration, category, image_url, is_active) VALUES
  ('Teeth Whitening', 'Professional teeth whitening treatment for a brighter, confident smile in one session', 200.00, 75, 'Dental', 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800', true)
ON CONFLICT DO NOTHING;

-- Teeth scaling & polishing
INSERT INTO services (name, description, price, duration, category, image_url, is_active) VALUES
  ('Teeth Scaling & Polishing', 'Deep cleaning treatment to remove plaque and restore your teeth natural shine', 150.00, 60, 'Dental', 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800', true)
ON CONFLICT DO NOTHING;

-- Tooth gems
INSERT INTO services (name, description, price, duration, category, image_url, is_active) VALUES
  ('Tooth Gems', 'Add sparkle to your smile with safe, removable tooth gem application', 80.00, 30, 'Dental', 'https://images.unsplash.com/photo-1609951651556-5334e2706168?w=800', true)
ON CONFLICT DO NOTHING;

-- Teeth braces
INSERT INTO services (name, description, price, duration, category, image_url, is_active) VALUES
  ('Teeth Braces', 'Comprehensive orthodontic consultation for teeth alignment and braces options', 100.00, 45, 'Dental', 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800', true)
ON CONFLICT DO NOTHING;

-- Semi-permanent brows
INSERT INTO services (name, description, price, duration, category, image_url, is_active) VALUES
  ('Semi-Permanent Brows', 'Microblading or powder brows for natural-looking, long-lasting brow enhancement', 220.00, 120, 'Brows', 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800', true)
ON CONFLICT DO NOTHING;

-- Create index for image_url for better performance
CREATE INDEX IF NOT EXISTS idx_services_image_url ON services(image_url);

-- ================================================
-- VERIFICATION
-- ================================================
-- Check if migration was successful
SELECT name, image_url, category FROM services WHERE image_url IS NOT NULL;
