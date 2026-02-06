-- Migration 004: TOS acceptance tracking and API reporting

-- Add TOS acceptance timestamp to providers
ALTER TABLE providers ADD COLUMN IF NOT EXISTS tos_accepted_at TIMESTAMP;

-- Add TOS acceptance timestamp to apis
ALTER TABLE apis ADD COLUMN IF NOT EXISTS tos_accepted_at TIMESTAMP;

-- Create API reports table
CREATE TABLE IF NOT EXISTS api_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_id UUID NOT NULL REFERENCES apis(id) ON DELETE CASCADE,
  reporter_type VARCHAR(20) NOT NULL CHECK (reporter_type IN ('agent', 'user')),
  reporter_id VARCHAR(255),
  reason VARCHAR(50) NOT NULL CHECK (reason IN ('malicious', 'spam', 'inaccurate', 'inappropriate', 'other')),
  description TEXT NOT NULL CHECK (char_length(description) >= 10 AND char_length(description) <= 1000),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for api_reports
CREATE INDEX IF NOT EXISTS idx_api_reports_api_id ON api_reports(api_id);
CREATE INDEX IF NOT EXISTS idx_api_reports_status ON api_reports(status);
CREATE INDEX IF NOT EXISTS idx_api_reports_created_at ON api_reports(created_at);
