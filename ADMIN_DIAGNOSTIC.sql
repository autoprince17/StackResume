-- Admin Login Diagnostic Script
-- Run this in Supabase SQL Editor to diagnose login issues

-- ============================================
-- 1. CHECK IF admin_users TABLE EXISTS
-- ============================================
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'admin_users'
) as admin_users_table_exists;

-- ============================================
-- 2. CHECK admin_users TABLE STRUCTURE
-- ============================================
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'admin_users'
ORDER BY ordinal_position;

-- ============================================
-- 3. LIST ALL AUTH USERS
-- ============================================
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- ============================================
-- 4. LIST ALL ADMIN USERS
-- ============================================
SELECT * FROM admin_users
ORDER BY created_at DESC;

-- ============================================
-- 5. CHECK FOR MISMATCHES (Auth users not in admin_users)
-- ============================================
SELECT 
  u.id as auth_user_id,
  u.email,
  CASE 
    WHEN au.id IS NULL THEN 'NOT IN admin_users ❌'
    ELSE 'In admin_users ✅'
  END as admin_status
FROM auth.users u
LEFT JOIN admin_users au ON u.id = au.id
ORDER BY u.created_at DESC;

-- ============================================
-- 6. CHECK FOR ORPHANED ADMIN RECORDS
-- ============================================
SELECT 
  au.id,
  au.email,
  CASE 
    WHEN u.id IS NULL THEN 'NO AUTH USER ⚠️'
    ELSE 'Has auth user ✅'
  END as auth_status
FROM admin_users au
LEFT JOIN auth.users u ON au.id = u.id;

-- ============================================
-- 7. RECOMMENDED ACTIONS
-- ============================================

-- If you see an auth user that's NOT in admin_users, run this:
-- (Replace UUID and email with actual values from section 3)
/*
INSERT INTO admin_users (id, email, role)
VALUES ('YOUR_AUTH_USER_UUID', 'your-email@example.com', 'admin')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
*/

-- If admin_users table doesn't exist, create it:
/*
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

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
*/
