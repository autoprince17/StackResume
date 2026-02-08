# Quick Admin Setup Commands

Run these in **Supabase SQL Editor** to set up your first admin user.

## Step 1: Create the admin_users table (if it doesn't exist)

```sql
-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy for service role
CREATE POLICY "Service role can manage admin_users"
  ON admin_users FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Index
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
```

## Step 2: Create an admin user in Supabase Auth

**Option A: Via Supabase Dashboard**
1. Go to Authentication → Users
2. Click "Add User" → "Create a new user"
3. Enter email and password
4. ✅ Check "Auto Confirm User"
5. Click "Create User"
6. Copy the user's UUID from the users list

**Option B: Via SQL** (Replace with your email and password)
```sql
-- This creates a user in auth.users
-- Replace 'admin@example.com' and 'your-secure-password'
-- Note: This may require enabling the SQL Admin API in Supabase settings
SELECT create_user(
  email := 'admin@example.com',
  password := 'your-secure-password'
);
```

## Step 3: Find your auth user's ID

```sql
-- Find the UUID of your auth user
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'admin@example.com';  -- Replace with your email
```

Copy the `id` value (UUID format like `b7e8c3d2-4a1f-...`)

## Step 4: Add your user to admin_users table

```sql
-- Replace 'YOUR_UUID_HERE' with the UUID from Step 3
-- Replace 'admin@example.com' with your email
INSERT INTO admin_users (id, email, role)
VALUES (
  'YOUR_UUID_HERE',  -- Paste the UUID from Step 3
  'admin@example.com',  -- Your email
  'admin'  -- Role: 'admin' or 'super_admin'
)
ON CONFLICT (id) DO UPDATE SET 
  email = EXCLUDED.email,
  role = EXCLUDED.role;
```

## Step 5: Verify setup

```sql
-- Check that everything is set up correctly
SELECT 
  u.id,
  u.email as auth_email,
  au.email as admin_email,
  au.role,
  CASE 
    WHEN au.id IS NOT NULL THEN '✅ Admin access enabled'
    ELSE '❌ Not in admin_users'
  END as status
FROM auth.users u
LEFT JOIN admin_users au ON u.id = au.id
WHERE u.email = 'admin@example.com';  -- Replace with your email
```

You should see:
- `status`: ✅ Admin access enabled
- Both emails matching
- Role showing 'admin'

## Done! Test Login

1. Go to `http://localhost:3000/login` (or your production URL)
2. Enter your email and password
3. Click "Sign In"
4. You should be redirected to `/admin`

---

## Troubleshooting

### Still getting "Unauthorized access"?

Run the diagnostic:
```sql
-- Check for ID mismatch
SELECT 
  'auth.users' as table_name,
  id,
  email
FROM auth.users
WHERE email = 'admin@example.com'

UNION ALL

SELECT 
  'admin_users' as table_name,
  id,
  email
FROM admin_users
WHERE email = 'admin@example.com';
```

The `id` values must match! If they don't:
1. Delete the admin_users record: `DELETE FROM admin_users WHERE email = 'admin@example.com';`
2. Re-run Step 4 with the correct UUID from auth.users

### Can't create auth user via dashboard?

Use the Supabase Dashboard UI:
1. Authentication → Users → Invite user
2. Or enable Email signup temporarily in Authentication → Providers → Email
3. Sign up via your app's signup flow (if you have one)
4. Then add that user ID to admin_users

---

## Example with Real Values

```sql
-- Example: Adding user 'alice@stackresume.com' as admin

-- 1. Find the user (after creating in Auth → Users)
SELECT id, email FROM auth.users WHERE email = 'alice@stackresume.com';
-- Result: id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'

-- 2. Add to admin_users
INSERT INTO admin_users (id, email, role)
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'alice@stackresume.com',
  'admin'
)
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;

-- 3. Verify
SELECT * FROM admin_users WHERE email = 'alice@stackresume.com';
-- Should show the record with matching ID
```

**Ready!** Alice can now log in at `/login`.
