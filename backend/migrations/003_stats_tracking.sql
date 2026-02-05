-- Time-series stats tracking

CREATE TABLE IF NOT EXISTS daily_stats (
  id SERIAL PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  apis_registered INTEGER DEFAULT 0,
  unique_agents INTEGER DEFAULT 0,
  total_api_count INTEGER DEFAULT 0,
  total_agent_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create function to update daily stats
CREATE OR REPLACE FUNCTION update_daily_stats() RETURNS void AS $$
DECLARE
  today DATE := CURRENT_DATE;
  apis_today INTEGER;
  agents_today INTEGER;
  total_apis INTEGER;
  total_agents INTEGER;
BEGIN
  -- Count APIs registered today
  SELECT COUNT(*) INTO apis_today
  FROM apis
  WHERE DATE(created_at) = today;
  
  -- Count unique agents seen today
  SELECT COUNT(*) INTO agents_today
  FROM agents
  WHERE DATE(last_seen) = today;
  
  -- Count total APIs
  SELECT COUNT(*) INTO total_apis FROM apis WHERE active = true;
  
  -- Count total agents
  SELECT COUNT(*) INTO total_agents FROM agents;
  
  -- Insert or update today's stats
  INSERT INTO daily_stats (date, apis_registered, unique_agents, total_api_count, total_agent_count)
  VALUES (today, apis_today, agents_today, total_apis, total_agents)
  ON CONFLICT (date) DO UPDATE SET
    apis_registered = EXCLUDED.apis_registered,
    unique_agents = EXCLUDED.unique_agents,
    total_api_count = EXCLUDED.total_api_count,
    total_agent_count = EXCLUDED.total_agent_count;
END;
$$ LANGUAGE plpgsql;

CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date DESC);
