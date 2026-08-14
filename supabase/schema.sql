-- Supabase Schema Migration
-- Run this in the Supabase SQL Editor

-- 1. Create Projects Table
CREATE TABLE public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  settings_json JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Users Table (replaces invited_users with broader definition)
CREATE TABLE public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'QA Engineer',
  avatar TEXT,
  invited_by UUID REFERENCES auth.users(id),
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Registered Accounts Table
CREATE TABLE public.registered_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- 3. Create Test Points Table (Active Tasks)
CREATE TABLE public.test_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  module_name TEXT NOT NULL,
  test_point TEXT NOT NULL,
  url TEXT,
  how_to_test TEXT,
  expected_result TEXT,
  actual_result TEXT,
  functionality_status TEXT DEFAULT 'Pending',
  testing_status TEXT DEFAULT 'Pending',
  priority TEXT DEFAULT 'Medium',
  assigned_user TEXT, -- email or name reference
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Archived Tasks Table
CREATE TABLE public.archived_tasks (
  id UUID PRIMARY KEY, -- keep original task id
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  module_name TEXT NOT NULL,
  test_point TEXT NOT NULL,
  url TEXT,
  how_to_test TEXT,
  expected_result TEXT,
  actual_result TEXT,
  functionality_status TEXT,
  testing_status TEXT,
  priority TEXT,
  assigned_user TEXT,
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  original_created_at TIMESTAMP WITH TIME ZONE
);

-- 5. Create Trash Tasks Table
CREATE TABLE public.trash_tasks (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  module_name TEXT NOT NULL,
  test_point TEXT NOT NULL,
  url TEXT,
  how_to_test TEXT,
  expected_result TEXT,
  actual_result TEXT,
  functionality_status TEXT,
  testing_status TEXT,
  priority TEXT,
  assigned_user TEXT,
  trashed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  original_created_at TIMESTAMP WITH TIME ZONE
);

-- 6. Create Notes Table
CREATE TABLE public.notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID, -- Not referencing formally to allow archiving without cascading deletes easily
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create Note Mentions Table
CREATE TABLE public.note_mentions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE,
  mentioned_user TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create Notifications Table
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT, -- or user_name
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Create Attachments Table
CREATE TABLE public.attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  size_bytes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Create Activity Logs Table
CREATE TABLE public.activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Create Task History Table
CREATE TABLE public.task_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID,
  status_from TEXT,
  status_to TEXT,
  changed_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Create Deletion Logs Table
CREATE TABLE public.deletion_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deleted_by TEXT NOT NULL,
  task_id UUID,
  task_name TEXT,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Create Sub Points Table
CREATE TABLE public.sub_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Create Reports Table
CREATE TABLE public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  report_url TEXT NOT NULL,
  generated_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS temporarily or enable with basic policies
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archived_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trash_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow All Admins" ON public.test_points FOR ALL USING (true);
CREATE POLICY "Allow All Admins" ON public.archived_tasks FOR ALL USING (true);
CREATE POLICY "Allow All Admins" ON public.trash_tasks FOR ALL USING (true);

-- 15. Create Demo Workspaces Table (Ephemeral 20-minute sandbox manager)
CREATE TABLE public.demo_workspaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id TEXT UNIQUE NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.demo_workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow All Demo Access" ON public.demo_workspaces FOR ALL USING (true);

-- Automated Function to clean expired demo workspaces
CREATE OR REPLACE FUNCTION public.clean_expired_demo_workspaces()
RETURNS void AS $$
BEGIN
  DELETE FROM public.demo_workspaces WHERE expires_at <= NOW();
END;
$$ LANGUAGE plpgsql;

