-- StackResume Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Students table (main entity)
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  tier TEXT NOT NULL CHECK (tier IN ('starter', 'professional', 'flagship')),
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'deployed', 'error')),
  subdomain TEXT UNIQUE,
  custom_domain TEXT UNIQUE,
  cohort_id UUID,
  stripe_payment_intent_id TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('Developer', 'Data Scientist', 'DevOps')),
  bio TEXT NOT NULL,
  tech_stack TEXT[] DEFAULT '{}',
  skills TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tech_stack TEXT[] DEFAULT '{}',
  github_url TEXT NOT NULL,
  live_url TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Experience table
CREATE TABLE experience (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  organization TEXT NOT NULL,
  role TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  description TEXT NOT NULL,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social links table
CREATE TABLE social_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  github TEXT,
  linkedin TEXT,
  existing_portfolio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id)
);

-- Assets table (photos, resumes)
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  profile_photo_url TEXT,
  resume_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id)
);

-- Tier limits snapshot (locked at purchase)
CREATE TABLE tier_limits_snapshot (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  tier TEXT NOT NULL,
  max_projects INTEGER NOT NULL,
  custom_domain_allowed BOOLEAN DEFAULT FALSE,
  analytics_allowed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id)
);

-- Change requests
CREATE TABLE change_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('content_edit', 'template_swap', 'redesign', 'link_update')),
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed', 'rejected')),
  is_paid BOOLEAN DEFAULT FALSE,
  amount INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deployment queue
CREATE TABLE deployment_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  vercel_project_id TEXT,
  deployment_url TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id)
);

-- Cohorts (for institutional/white-label support)
CREATE TABLE cohorts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  institution TEXT,
  is_white_label BOOLEAN DEFAULT FALSE,
  custom_domain TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin users
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics (basic tracking for Pro+)
CREATE TABLE portfolio_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  page_views INTEGER DEFAULT 0,
  referrer TEXT,
  device_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_subdomain ON students(subdomain);
CREATE INDEX idx_students_cohort ON students(cohort_id);
CREATE INDEX idx_projects_student ON projects(student_id);
CREATE INDEX idx_experience_student ON experience(student_id);
CREATE INDEX idx_deployment_queue_status ON deployment_queue(status);
CREATE INDEX idx_change_requests_student ON change_requests(student_id);

-- Row Level Security (RLS) Policies

-- Students: Only admins can read all, students can read own
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all students" 
  ON students FOR SELECT 
  USING (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Students can read own record" 
  ON students FOR SELECT 
  USING (auth.uid() = id);

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all profiles" 
  ON profiles FOR SELECT 
  USING (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Students can read own profile" 
  ON profiles FOR SELECT 
  USING (student_id = auth.uid());

-- Projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all projects" 
  ON projects FOR SELECT 
  USING (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Students can read own projects" 
  ON projects FOR SELECT 
  USING (student_id = auth.uid());

-- Experience
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all experience" 
  ON experience FOR SELECT 
  USING (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Students can read own experience" 
  ON experience FOR SELECT 
  USING (student_id = auth.uid());

-- Change requests
ALTER TABLE change_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage change requests" 
  ON change_requests FOR ALL 
  USING (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Students can read own change requests" 
  ON change_requests FOR SELECT 
  USING (student_id = auth.uid());

-- Admin users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read admin users" 
  ON admin_users FOR SELECT 
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- Functions

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experience_updated_at BEFORE UPDATE ON experience 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_links_updated_at BEFORE UPDATE ON social_links 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_change_requests_updated_at BEFORE UPDATE ON change_requests 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deployment_queue_updated_at BEFORE UPDATE ON deployment_queue 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Generate subdomain from name
CREATE OR REPLACE FUNCTION generate_subdomain(name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'), '^-|-$', '', 'g'));
END;
$$ LANGUAGE plpgsql;
