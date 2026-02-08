-- Fix Admin Login: Add RLS Policy for Middleware
-- The middleware needs to check if a user is in admin_users, but RLS is blocking it

-- This script adds a policy that allows authenticated users to check their own admin status

-- Option 1: Allow authenticated users to read their own admin record (RECOMMENDED)
CREATE POLICY "Users can read their own admin status"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Option 2: Allow all authenticated users to read admin_users (less secure)
-- Uncomment this if Option 1 doesn't work
/*
CREATE POLICY "Authenticated users can read admin_users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (true);
*/

-- Verify the policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'admin_users';

-- Test the query (run this while logged in)
-- This should return your admin record if you're logged in as an admin
SELECT * FROM admin_users WHERE id = auth.uid();
