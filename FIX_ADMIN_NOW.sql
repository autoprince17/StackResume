-- IMMEDIATE FIX: Add your authenticated user to admin_users
-- Run this in Supabase SQL Editor RIGHT NOW

-- Your user ID from the logs: 6e926aa1-136e-4e7f-b39b-7c3cab3467ef

-- Step 1: First, let's see what email this user has
SELECT id, email, created_at 
FROM auth.users 
WHERE id = '6e926aa1-136e-4e7f-b39b-7c3cab3467ef';

-- Step 2: Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage admin_users"
  ON admin_users FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Step 3: Add your user to admin_users
-- Replace 'your-email@example.com' with the email from Step 1
INSERT INTO admin_users (id, email, role)
VALUES (
  '6e926aa1-136e-4e7f-b39b-7c3cab3467ef',
  'your-email@example.com',  -- REPLACE WITH YOUR ACTUAL EMAIL
  'admin'
)
ON CONFLICT (id) DO UPDATE SET 
  email = EXCLUDED.email,
  role = EXCLUDED.role;

-- Step 4: Verify it worked
SELECT 
  u.id,
  u.email as auth_email,
  au.email as admin_email,
  au.role,
  au.created_at
FROM auth.users u
INNER JOIN admin_users au ON u.id = au.id
WHERE u.id = '6e926aa1-136e-4e7f-b39b-7c3cab3467ef';

-- You should see your user with role='admin'

-- Step 5: Check for any other auth users that might need admin access
SELECT 
  u.id,
  u.email,
  u.created_at,
  CASE 
    WHEN au.id IS NOT NULL THEN '✅ Is admin'
    ELSE '❌ Not admin'
  END as admin_status
FROM auth.users u
LEFT JOIN admin_users au ON u.id = au.id
ORDER BY u.created_at DESC;
