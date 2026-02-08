# Admin User Setup Guide

## Understanding the Admin System

StackResume uses a two-part admin authentication:

1. **Supabase Auth** — Standard email/password authentication
2. **admin_users table** — Whitelist of admin user IDs

Both must be configured for admin login to work.

## Quick Setup (Production Ready)

### Step 1: Create Admin User in Supabase Auth

1. Go to https://app.supabase.com
2. Select your StackResume project
3. Navigate to **Authentication** → **Users**
4. Click **Add User** → **Create a new user**
5. Enter:
   - **Email:** `admin@yourdomain.com` (or your email)
   - **Password:** (choose a strong password)
   - **Auto Confirm User:** ✅ Check this box
6. Click **Create User**
7. **Copy the User UID** from the users table (looks like `b7e8c3d2-4a1f-...`)

### Step 2: Add User to admin_users Table

1. In Supabase, go to **Table Editor** → `admin_users`
2. If the table doesn't exist, create it using the SQL below
3. Click **Insert** → **Insert Row**
4. Enter:
   - **id:** Paste the User UID from Step 1
   - **email:** Same email as Step 1
   - **role:** `admin` or `super_admin`
5. Click **Save**

### Step 3: Test Login

1. Go to your app: `http://localhost:3000/login` or `https://your-domain.com/login`
2. Enter the email and password from Step 1
3. You should be redirected to `/admin`

## Database Setup

### Create admin_users Table (If Not Exists)

Run this SQL in **Supabase SQL Editor**:

```sql
-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage admin_users
CREATE POLICY "Service role can manage admin_users"
  ON admin_users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- Comment
COMMENT ON TABLE admin_users IS 'Whitelist of admin user IDs for admin dashboard access';
```

### Add Your First Admin User (SQL Method)

**Important:** Replace `YOUR_AUTH_USER_ID` with the actual UUID from Supabase Auth → Users table.

```sql
-- First, find your auth user ID
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Then insert into admin_users (replace the UUID with yours)
INSERT INTO admin_users (id, email, role)
VALUES ('YOUR_AUTH_USER_ID', 'your-email@example.com', 'admin')
ON CONFLICT (id) DO NOTHING;
```

## Creating Additional Admin Users

### Method 1: Using SQL

```sql
-- 1. Create auth user
-- Go to Supabase Dashboard → Authentication → Users → Add User

-- 2. Get the new user's ID
SELECT id, email FROM auth.users WHERE email = 'newadmin@example.com';

-- 3. Add to admin_users
INSERT INTO admin_users (id, email, role)
VALUES ('USER_UUID_HERE', 'newadmin@example.com', 'admin');
```

### Method 2: Using Admin Dashboard (Future Feature)

You can build an admin user management page later to handle this through the UI.

## Troubleshooting

### Issue: "Unauthorized access" error after login

**Possible causes:**
1. User exists in Supabase Auth but NOT in `admin_users` table
2. The `id` in `admin_users` doesn't match the auth user's `id`
3. Email mismatch between auth user and admin_users record

**Solution:**
```sql
-- Check if user exists in auth
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Check if user exists in admin_users
SELECT * FROM admin_users WHERE email = 'your-email@example.com';

-- Fix: Delete and re-add with correct ID
DELETE FROM admin_users WHERE email = 'your-email@example.com';
INSERT INTO admin_users (id, email, role)
VALUES ('CORRECT_UUID_FROM_AUTH', 'your-email@example.com', 'admin');
```

### Issue: Login succeeds but redirects back to login page

**Possible causes:**
1. Cookies not being set properly
2. Middleware rejecting the session

**Solution:**
- Check browser console for errors
- Check server logs for errors
- Verify middleware is not blocking `/admin` access
- Clear cookies and try again

### Issue: Can't access Supabase Dashboard

**Solution:**
- Make sure you're logged into the correct Supabase organization
- Check that the project URL matches your `.env.local`
- Verify you have the correct access permissions

## Security Best Practices

1. **Use strong passwords** for admin accounts (12+ characters, mixed case, numbers, symbols)
2. **Enable 2FA** in Supabase (if available)
3. **Limit admin users** to only those who need access
4. **Use super_admin** role sparingly for elevated permissions (future feature)
5. **Rotate passwords** regularly (every 90 days)
6. **Audit admin_users** table regularly for unauthorized entries

## Admin Roles

- **admin**: Standard admin access (view submissions, approve, deploy)
- **super_admin**: Full access (manage admins, system settings) — reserved for future features

## Quick Command Reference

```sql
-- List all admin users
SELECT au.*, u.email as auth_email, u.created_at as auth_created
FROM admin_users au
LEFT JOIN auth.users u ON au.id = u.id;

-- Add admin user
INSERT INTO admin_users (id, email, role)
VALUES ('uuid-here', 'email@example.com', 'admin');

-- Remove admin user
DELETE FROM admin_users WHERE email = 'email@example.com';

-- Change admin role
UPDATE admin_users SET role = 'super_admin' WHERE email = 'email@example.com';

-- Check if email is admin
SELECT EXISTS(
  SELECT 1 FROM admin_users WHERE email = 'email@example.com'
) as is_admin;
```

## Next Steps After Setup

1. ✅ Login to `/login` with your admin credentials
2. ✅ Verify you can access `/admin` dashboard
3. ✅ Test the submissions workflow
4. ✅ Create additional admin users if needed
5. ✅ Document your admin credentials securely (use a password manager)

---

**Need help?** Check the server logs and Supabase logs for detailed error messages.
