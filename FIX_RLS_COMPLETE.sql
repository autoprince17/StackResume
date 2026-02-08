-- Complete Admin Users RLS Setup
-- Run this entire script in Supabase SQL Editor

-- ============================================
-- 1. CREATE TABLE (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. ENABLE RLS
-- ============================================
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. DROP OLD POLICIES (clean slate)
-- ============================================
DROP POLICY IF EXISTS "Service role can manage admin_users" ON admin_users;
DROP POLICY IF EXISTS "Users can read their own admin status" ON admin_users;
DROP POLICY IF EXISTS "Authenticated users can read admin_users" ON admin_users;
DROP POLICY IF EXISTS "Allow users to check their own admin status" ON admin_users;

-- ============================================
-- 4. CREATE CORRECT POLICIES
-- ============================================

-- Policy 1: Service role has full access (for backend operations)
CREATE POLICY "service_role_full_access"
  ON admin_users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy 2: Authenticated users can check if they are admin (for middleware)
CREATE POLICY "authenticated_users_can_read_own_status"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- ============================================
-- 5. CREATE INDEX
-- ============================================
CREATE INDEX IF NOT EXISTS idx_admin_users_id ON admin_users(id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- ============================================
-- 6. VERIFY SETUP
-- ============================================
SELECT 
  'Table exists' as check_type,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'admin_users'
  )::text as result
UNION ALL
SELECT 
  'RLS enabled' as check_type,
  (SELECT rowsecurity::text FROM pg_tables WHERE tablename = 'admin_users') as result
UNION ALL
SELECT 
  'Policies count' as check_type,
  COUNT(*)::text as result
FROM pg_policies 
WHERE tablename = 'admin_users';

-- ============================================
-- 7. SHOW ALL POLICIES
-- ============================================
SELECT 
  policyname,
  cmd as command,
  roles,
  CASE 
    WHEN qual IS NOT NULL THEN pg_get_expr(qual, 'admin_users'::regclass)
    ELSE 'No condition'
  END as using_condition
FROM pg_policies 
WHERE tablename = 'admin_users'
ORDER BY policyname;

-- ============================================
-- 8. ADD YOUR USER (if needed)
-- ============================================
-- First, find your user ID:
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- Then insert (replace with your actual UUID and email):
/*
INSERT INTO admin_users (id, email, role)
VALUES ('6e926aa1-136e-4e7f-b39b-7c3cab3467ef', 'your-email@example.com', 'admin')
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
*/

-- ============================================
-- 9. TEST THE POLICY
-- ============================================
-- This should work when you're logged in as an admin user:
SELECT * FROM admin_users WHERE id = auth.uid();

-- This should show all admins (only works with service role):
-- SELECT * FROM admin_users;
