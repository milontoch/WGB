-- Email Logs Table
-- Tracks all emails sent by the system for monitoring and debugging

CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email_type VARCHAR(50) NOT NULL, -- 'booking_reminder', 'booking_reschedule', 'booking_cancellation', 'order_confirmation', 'payment_failure', 'promotional'
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'retrying'
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  related_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  related_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  campaign_id VARCHAR(100), -- For promotional emails
  metadata JSONB, -- Additional data (e.g., tracking info, custom fields)
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_email_type ON email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_related_booking ON email_logs(related_booking_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_related_order ON email_logs(related_order_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_campaign ON email_logs(campaign_id);

-- Enable Row Level Security
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view all email logs
-- Note: Update this policy based on your admin user detection logic
-- For now, this allows all authenticated users to view all logs
-- You should modify this to check admin role from your users table or user metadata
CREATE POLICY "Admins can view all email logs"
  ON email_logs
  FOR SELECT
  TO authenticated
  USING (true); -- TODO: Add admin check when users table exists

-- Policy: Users can view their own email logs
CREATE POLICY "Users can view their own email logs"
  ON email_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Only service role can insert/update (server-side only)
CREATE POLICY "Service role can manage email logs"
  ON email_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_email_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER email_logs_updated_at
  BEFORE UPDATE ON email_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_email_logs_updated_at();

-- SMS Logs Table (Placeholder for future SMS integration)
CREATE TABLE IF NOT EXISTS sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sms_type VARCHAR(50) NOT NULL,
  recipient_phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  related_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  related_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  provider VARCHAR(50), -- 'twilio', 'africastalking', etc.
  metadata JSONB,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for SMS logs
CREATE INDEX IF NOT EXISTS idx_sms_logs_user_id ON sms_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_sms_type ON sms_logs(sms_type);
CREATE INDEX IF NOT EXISTS idx_sms_logs_status ON sms_logs(status);
CREATE INDEX IF NOT EXISTS idx_sms_logs_created_at ON sms_logs(created_at DESC);

-- Enable RLS for SMS logs
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;

-- Policies for SMS logs (similar to email logs)
-- Note: Update this policy based on your admin user detection logic
CREATE POLICY "Admins can view all sms logs"
  ON sms_logs
  FOR SELECT
  TO authenticated
  USING (true); -- TODO: Add admin check when users table exists

CREATE POLICY "Users can view their own sms logs"
  ON sms_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage sms logs"
  ON sms_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add updated_at trigger for SMS logs
CREATE TRIGGER sms_logs_updated_at
  BEFORE UPDATE ON sms_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_email_logs_updated_at();

COMMENT ON TABLE email_logs IS 'Tracks all emails sent by the system for monitoring and debugging';
COMMENT ON TABLE sms_logs IS 'Placeholder for future SMS notification tracking';
