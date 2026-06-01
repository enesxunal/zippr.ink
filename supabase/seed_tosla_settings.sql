-- Tosla ayarları (Supabase → SQL Editor → bir kez çalıştır)
-- Aşağıdaki YOUR_* değerlerini Tosla panelinden aldığınız bilgilerle değiştirin.

INSERT INTO system_metrics (key, value) VALUES
  ('tosla_enabled', 'true'),
  ('tosla_client_id', 'YOUR_CLIENT_ID'),
  ('tosla_api_user', 'YOUR_API_USER'),
  ('tosla_merchant_key', ''),
  ('tosla_api_password', 'YOUR_API_PASS'),
  ('tosla_api_url', 'https://entegrasyon.tosla.com/api/Payment/'),
  ('tosla_test_mode', 'false')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = NOW();
