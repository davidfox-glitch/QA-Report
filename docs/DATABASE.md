# Database Documentation

## Overview
QAFlow Pro uses Supabase (PostgreSQL) for authentication and data persistence. While much of the rapid prototyping state is currently handled in client-side local storage via Zustand, the architecture is designed to map directly to PostgreSQL tables.

## Core Tables

### 1. `users` (Managed by Supabase Auth)
Handles core identity and login via Google OAuth.
- `id` (uuid, PK)
- `email` (varchar)
- `raw_user_meta_data` (jsonb)

### 2. `invited_users` (Custom Table)
Manages Role-Based Access Control (RBAC) and invites.
- `id` (uuid, PK)
- `email` (varchar, Unique)
- `role` (varchar: 'Admin' | 'User')
- `created_at` (timestamp)

*(Note: The following tables are currently mirrored in Zustand state and represent the upcoming final Supabase schema migration)*

### 3. `test_rows`
The primary table for all testing tasks.
- `id` (uuid, PK)
- `test_point` (text)
- `module_name` (text)
- `url` (text)
- `how_to_test` (text)
- `expected_result` (text)
- `actual_result` (text)
- `functionality_status` (varchar: 'Working' | 'Partially Working' | 'Not Working' | 'Pending')
- `testing_status` (varchar: 'Passed' | 'Failed' | 'Pending' | 'In Progress')
- `priority` (varchar: 'Critical' | 'High' | 'Medium' | 'Low')
- `assigned_user` (uuid, FK -> users.id)
- `is_archived` (boolean, default: false)
- `is_trashed` (boolean, default: false)

### 4. `notes`
Attached contextual notes for a test row.
- `id` (uuid, PK)
- `row_id` (uuid, FK -> test_rows.id)
- `author_id` (uuid, FK -> users.id)
- `text` (text)
- `created_at` (timestamp)

### 5. `attachments`
Screenshots or files attached to a test row.
- `id` (uuid, PK)
- `row_id` (uuid, FK -> test_rows.id)
- `file_url` (text)
- `created_at` (timestamp)

## Data Flow
1. **Auth:** User logs in -> `proxy.ts` validates session -> Access granted.
2. **Fetch:** Dashboard mounts -> Fetches `test_rows` where `is_archived = false` and `is_trashed = false`.
3. **Mutate:** User updates status -> Zustand store updates optimistically -> Supabase RPC/Update call syncs database.
4. **Archive Flow:** Task status changes to 'Passed' -> `is_archived` set to `true` -> Task moves to Archive view.

## RLS (Row Level Security) Policies
- **Admins:** Can read, write, update, and delete all rows across all tables.
- **Users:** Can read all `test_rows`, but can only update `test_rows` assigned to them, and can only insert `notes` associated with their `author_id`.
