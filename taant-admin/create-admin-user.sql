-- Create admin user SQL script
-- Replace the email and full_name with your desired admin credentials

-- Step 1: Create user in Supabase Auth (you need to do this via Supabase Dashboard or CLI first)
-- Then run this SQL to update their profile and create admin access

-- Step 2: Update the user's profile to have admin role
UPDATE public.profiles
SET
    role = 'admin',
    full_name = 'Admin User',
    updated_at = NOW()
WHERE email = 'admin@taant.com'; -- Replace with your admin email

-- Step 3: Create admin user record
INSERT INTO public.admin_users (
    id,
    role_id,
    permissions,
    created_at,
    updated_at
)
SELECT
    p.id,
    r.id,
    r.permissions,
    NOW(),
    NOW()
FROM public.profiles p
CROSS JOIN public.admin_roles r
WHERE p.email = 'admin@taant.com' -- Replace with your admin email
AND r.name = 'Super Admin'
ON CONFLICT (id) DO UPDATE SET
    role_id = EXCLUDED.role_id,
    permissions = EXCLUDED.permissions,
    updated_at = NOW();

-- Step 4: Verify the admin user was created
SELECT
    p.id,
    p.email,
    p.full_name,
    p.role,
    r.name as admin_role,
    au.created_at as admin_since
FROM public.profiles p
LEFT JOIN public.admin_users au ON p.id = au.id
LEFT JOIN public.admin_roles r ON au.role_id = r.id
WHERE p.email = 'admin@taant.com'; -- Replace with your admin email