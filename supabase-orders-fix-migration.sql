-- Migration to fix orders table for pickup orders and payment verification
-- Run this AFTER creating the initial ecommerce schema

-- 1. Make shipping_address nullable (for pickup orders)
ALTER TABLE orders ALTER COLUMN shipping_address DROP NOT NULL;

-- 2. Add payment_verified column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' 
    AND column_name = 'payment_verified'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_verified BOOLEAN DEFAULT false;
  END IF;
END $$;

-- 3. Add payment_date column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' 
    AND column_name = 'payment_date'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_date TIMESTAMPTZ;
  END IF;
END $$;

-- 4. Update existing orders to set payment_verified based on payment_status
UPDATE orders 
SET payment_verified = true 
WHERE payment_status = 'paid' AND payment_verified IS NULL;

-- 5. Create index on payment_verified for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_payment_verified ON orders(payment_verified);

COMMENT ON COLUMN orders.shipping_address IS 'Nullable to support pickup orders';
COMMENT ON COLUMN orders.payment_verified IS 'Server-side verification status from payment gateway';
COMMENT ON COLUMN orders.payment_date IS 'Timestamp when payment was verified';
