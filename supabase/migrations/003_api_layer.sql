-- zippr.ink Public API layer

CREATE TYPE api_key_mode AS ENUM ('test', 'live');
CREATE TYPE image_job_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE image_job_source AS ENUM ('upload', 'url');

CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  mode api_key_mode NOT NULL DEFAULT 'live',
  last_used_at TIMESTAMPTZ,
  usage_count BIGINT NOT NULL DEFAULT 0,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash) WHERE revoked_at IS NULL;

CREATE TABLE api_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_usage_user_day ON api_usage(user_id, created_at);

CREATE TABLE image_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
  status image_job_status NOT NULL DEFAULT 'pending',
  source_type image_job_source NOT NULL,
  original_url TEXT,
  optimized_url TEXT,
  original_size_bytes BIGINT,
  optimized_size_bytes BIGINT,
  compression_ratio NUMERIC(6, 2),
  format TEXT,
  width INT,
  height INT,
  error_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_image_jobs_user_id ON image_jobs(user_id);
CREATE INDEX idx_image_jobs_status ON image_jobs(status);

CREATE TRIGGER api_keys_updated_at BEFORE UPDATE ON api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER image_jobs_updated_at BEFORE UPDATE ON image_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own api keys" ON api_keys
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users view own api usage" ON api_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users view own image jobs" ON image_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Super admins api keys" ON api_keys
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Super admins api usage" ON api_usage
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Super admins image jobs" ON image_jobs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );
