-- BlokClaw Initial Schema

-- Providers table
CREATE TABLE IF NOT EXISTS providers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  website VARCHAR(500),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- APIs table
CREATE TABLE IF NOT EXISTS apis (
  id SERIAL PRIMARY KEY,
  provider_id INTEGER REFERENCES providers(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  short_description TEXT NOT NULL,
  long_description TEXT,
  category VARCHAR(100),
  
  -- Contract/Schema
  contract_type VARCHAR(50) DEFAULT 'openapi', -- openapi, custom, etc
  contract_url VARCHAR(500),
  contract_schema JSONB,
  
  -- Auth
  auth_type VARCHAR(50) DEFAULT 'apikey', -- none, apikey, oauth2, bearer
  auth_instructions TEXT,
  test_endpoint VARCHAR(500),
  
  -- Metadata
  pricing VARCHAR(50) DEFAULT 'free', -- free, freemium, paid
  tags TEXT[], -- array of tags
  verified BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  
  -- Stats
  view_count INTEGER DEFAULT 0,
  integration_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API Endpoints table
CREATE TABLE IF NOT EXISTS api_endpoints (
  id SERIAL PRIMARY KEY,
  api_id INTEGER REFERENCES apis(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  method VARCHAR(10) NOT NULL, -- GET, POST, PUT, DELETE, etc
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API Examples table
CREATE TABLE IF NOT EXISTS api_examples (
  id SERIAL PRIMARY KEY,
  api_id INTEGER REFERENCES apis(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  request_example JSONB,
  response_example JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for search
CREATE INDEX IF NOT EXISTS idx_apis_name ON apis USING GIN (to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_apis_description ON apis USING GIN (to_tsvector('english', short_description));
CREATE INDEX IF NOT EXISTS idx_apis_tags ON apis USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_apis_category ON apis(category);
CREATE INDEX IF NOT EXISTS idx_apis_verified ON apis(verified);
CREATE INDEX IF NOT EXISTS idx_apis_active ON apis(active);
