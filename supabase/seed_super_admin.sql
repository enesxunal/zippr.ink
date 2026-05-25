-- Manuel kullanıcı oluşturduysanız (Authentication → Add user):
-- E-posta: admin@zippr.ink  |  Şifre: zippr2026e
-- Bu SQL'i çalıştırın:

UPDATE public.profiles
SET
  role = 'super_admin',
  full_name = 'Admin',
  plan_type = 'professional',
  storage_limit = 1099511627776
WHERE email = 'admin@zippr.ink';

-- Profil yoksa (nadir):
INSERT INTO public.profiles (id, email, full_name, role, plan_type, storage_limit)
SELECT
  id,
  email,
  'Admin',
  'super_admin',
  'professional',
  1099511627776
FROM auth.users
WHERE email = 'admin@zippr.ink'
ON CONFLICT (id) DO UPDATE SET
  role = 'super_admin',
  full_name = 'Admin',
  plan_type = 'professional',
  storage_limit = 1099511627776;
