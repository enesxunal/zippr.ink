-- Security/data-integrity hardening

-- Public sharing is served through server routes with the service role; do not expose
-- the full active-files table to anonymous/authenticated clients.
DROP POLICY IF EXISTS "Anyone can view active files by slug" ON files;

-- Payment callbacks may be retried; one gateway transaction must provision once.
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_gateway_transaction_unique
  ON subscriptions(gateway_transaction_id)
  WHERE gateway_transaction_id IS NOT NULL;

-- Atomic storage accounting (service-role only).
CREATE OR REPLACE FUNCTION adjust_storage_used(target_user UUID, delta BIGINT)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_value BIGINT;
BEGIN
  UPDATE profiles
  SET storage_used = GREATEST(0, storage_used + delta), updated_at = NOW()
  WHERE id = target_user
  RETURNING storage_used INTO new_value;
  RETURN COALESCE(new_value, 0);
END;
$$;
REVOKE ALL ON FUNCTION adjust_storage_used(UUID, BIGINT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION adjust_storage_used(UUID, BIGINT) TO service_role;

-- Atomic API-key usage counter (service-role only).
CREATE OR REPLACE FUNCTION touch_api_key(target_key UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE api_keys
  SET usage_count = usage_count + 1, last_used_at = NOW()
  WHERE id = target_key;
END;
$$;
REVOKE ALL ON FUNCTION touch_api_key(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION touch_api_key(UUID) TO service_role;

-- Lock down the legacy statistic helper as well.
REVOKE ALL ON FUNCTION increment_file_stat(TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_file_stat(TEXT, TEXT) TO service_role;

-- Bind payment-provider callbacks to a server-created intent instead of trusting callback user/plan fields.
CREATE TABLE IF NOT EXISTS payment_intents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_type plan_type NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TRY',
  order_id TEXT NOT NULL UNIQUE,
  three_d_session_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed')),
  gateway_transaction_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payment_intents_user_id ON payment_intents(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON payment_intents(status);
ALTER TABLE payment_intents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own payment intents" ON payment_intents
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Super admins manage payment intents" ON payment_intents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );
