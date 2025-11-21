-- Test database seed data
-- Run this to populate test database with sample data

-- Clean existing test data first
TRUNCATE TABLE bookings, time_slots, orders, order_items, cart_items, email_logs CASCADE;

-- Insert test users (assumes Supabase Auth handles this)
-- Users are created via Auth API in tests

-- Insert test services
INSERT INTO services (id, name, description, duration, price, category, is_active) VALUES
  ('service-1', 'Luxury Facial Treatment', 'Deep cleansing and rejuvenating facial', 60, 150.00, 'facial', true),
  ('service-2', 'Swedish Massage', 'Relaxing full-body massage', 90, 200.00, 'massage', true),
  ('service-3', 'Luxury Manicure', 'Complete nail care and polish', 45, 80.00, 'nails', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price;

-- Insert test staff
INSERT INTO staff (id, name, email, phone, role, specialization, is_active) VALUES
  ('staff-1', 'Sarah Johnson', 'sarah@beautystudio.com', '+2348011111111', 'therapist', 'Facial treatments', true),
  ('staff-2', 'Emily Davis', 'emily@beautystudio.com', '+2348022222222', 'therapist', 'Massage therapy', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name;

-- Insert test time slots for next 30 days
DO $$
DECLARE
  day_offset INT;
  hour INT;
  slot_date DATE;
  slot_start TIMESTAMP;
  slot_end TIMESTAMP;
BEGIN
  FOR day_offset IN 0..30 LOOP
    slot_date := CURRENT_DATE + day_offset;
    
    -- Skip Sundays (day 0)
    IF EXTRACT(DOW FROM slot_date) != 0 THEN
      FOR hour IN 9..16 LOOP
        slot_start := slot_date + (hour || ' hours')::INTERVAL;
        slot_end := slot_start + '1 hour'::INTERVAL;
        
        -- Facial slots with staff-1
        INSERT INTO time_slots (service_id, staff_id, start_time, end_time, is_available)
        VALUES ('service-1', 'staff-1', slot_start, slot_end, true)
        ON CONFLICT DO NOTHING;
        
        -- Massage slots with staff-2
        IF hour <= 15 THEN
          INSERT INTO time_slots (service_id, staff_id, start_time, end_time, is_available)
          VALUES ('service-2', 'staff-2', slot_start, slot_start + '1.5 hours'::INTERVAL, true)
          ON CONFLICT DO NOTHING;
        END IF;
      END LOOP;
    END IF;
  END LOOP;
END $$;

-- Insert test products
INSERT INTO products (id, name, description, price, stock, category, is_active, image_url) VALUES
  ('product-1', 'Luxury Face Cream', 'Premium moisturizing face cream with SPF 30', 89.99, 50, 'skincare', true, 'https://example.com/cream.jpg'),
  ('product-2', 'Vitamin C Serum', 'Brightening serum with antioxidants', 69.99, 30, 'skincare', true, 'https://example.com/serum.jpg'),
  ('product-3', 'Hydrating Body Lotion', 'Rich body lotion for all skin types', 45.00, 100, 'bodycare', true, 'https://example.com/lotion.jpg'),
  ('product-4', 'Limited Edition Oil', 'Rare essential oil blend', 120.00, 2, 'oils', true, 'https://example.com/oil.jpg'),
  ('product-5', 'Sold Out Mask', 'Popular face mask', 35.00, 0, 'masks', false, 'https://example.com/mask.jpg')
ON CONFLICT (id) DO UPDATE SET
  stock = EXCLUDED.stock,
  is_active = EXCLUDED.is_active;

-- Insert sample completed booking (for testing notifications)
-- This would be created via API in tests

-- Insert sample orders
-- These would be created via API in tests

RAISE NOTICE 'Test database seeded successfully';
