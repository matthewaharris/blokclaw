-- Migration 005: Auth, health monitoring, validation, and analytics features

-- Fix api_reports: api_id was UUID but apis.id is SERIAL (integer)
DROP TABLE IF EXISTS api_reports;
CREATE TABLE api_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_id INTEGER NOT NULL REFERENCES apis(id) ON DELETE CASCADE,
  reporter_type VARCHAR(20) NOT NULL CHECK (reporter_type IN ('agent', 'user')),
  reporter_id VARCHAR(255),
  reason VARCHAR(50) NOT NULL CHECK (reason IN ('malicious', 'spam', 'inaccurate', 'inappropriate', 'other')),
  description TEXT NOT NULL CHECK (char_length(description) >= 10 AND char_length(description) <= 1000),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by VARCHAR(255),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_api_reports_api_id ON api_reports(api_id);
CREATE INDEX IF NOT EXISTS idx_api_reports_status ON api_reports(status);
CREATE INDEX IF NOT EXISTS idx_api_reports_created_at ON api_reports(created_at);

-- Auth columns on providers
ALTER TABLE providers ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE providers ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);
ALTER TABLE providers ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_providers_verification_token ON providers(verification_token);

-- Health monitoring columns on apis
DO $$ BEGIN
  CREATE TYPE health_status_enum AS ENUM ('healthy', 'degraded', 'unhealthy', 'unknown');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE apis ADD COLUMN IF NOT EXISTS health_status health_status_enum DEFAULT 'unknown';
ALTER TABLE apis ADD COLUMN IF NOT EXISTS last_health_check TIMESTAMP;
ALTER TABLE apis ADD COLUMN IF NOT EXISTS health_check_failures INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_apis_health_status ON apis(health_status);

-- OpenAPI validation columns on apis
ALTER TABLE apis ADD COLUMN IF NOT EXISTS openapi_valid BOOLEAN;
ALTER TABLE apis ADD COLUMN IF NOT EXISTS openapi_errors JSONB;

-- Analytics columns
ALTER TABLE apis ADD COLUMN IF NOT EXISTS discovery_count INTEGER DEFAULT 0;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS api_discoveries INTEGER DEFAULT 0;

-- Agent-API discovery tracking table
CREATE TABLE IF NOT EXISTS agent_api_discoveries (
  id SERIAL PRIMARY KEY,
  agent_id VARCHAR(255) NOT NULL,
  api_id INTEGER NOT NULL REFERENCES apis(id) ON DELETE CASCADE,
  discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(agent_id, api_id)
);

CREATE INDEX IF NOT EXISTS idx_agent_api_discoveries_agent ON agent_api_discoveries(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_api_discoveries_api ON agent_api_discoveries(api_id);
CREATE INDEX IF NOT EXISTS idx_agent_api_discoveries_date ON agent_api_discoveries(discovered_at);
