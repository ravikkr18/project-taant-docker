-- Insert test users with roles
-- Note: Run this after creating the profiles table

-- Insert admin user (if not exists)
INSERT INTO public.profiles (id, email, full_name, role)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', 'Admin User'),
  'admin'
FROM auth.users u
WHERE u.email = 'admin.test@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
);

-- Insert supplier user (if not exists)
INSERT INTO public.profiles (id, email, full_name, role)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', 'Supplier User'),
  'supplier'
FROM auth.users u
WHERE u.email LIKE '%supplier%'
AND NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
);

-- Update existing users to have roles (for testing)
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin.test@gmail.com' AND role != 'admin';

UPDATE public.profiles
SET role = 'supplier'
WHERE email LIKE '%supplier%' AND role != 'supplier';

-- Show current users and their roles
SELECT
  u.email,
  u.created_at,
  p.full_name,
  p.role,
  p.updated_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;