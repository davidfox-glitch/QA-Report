# Security Documentation

## Authentication
Authentication is strictly handled by Supabase Auth using Google OAuth. 

## Authorization & Protected Routes
- **Edge Proxy (`proxy.ts`):** Next.js middleware intercepts all requests. If a user is unauthenticated, they are immediately redirected to `/login`.
- **Static Asset Bypass:** The regex matcher in `proxy.ts` ensures that `service-worker.js`, `manifest.json`, `.css`, and `.js` files bypass the auth check, preventing infinite redirect loops for the UI.

## Roles & Permissions
The application relies on an invite system stored in the `invited_users` table.
- **Admin:** Has full access to the `Users` and `Settings` dashboards. Can view and modify all tasks.
- **User:** Can access the `Dashboard`, view tasks, and edit tasks specifically assigned to them.

## RLS (Row Level Security)
Supabase database tables are protected by Row Level Security.
- Users can `SELECT` all active tasks.
- Users can only `UPDATE` tasks where `assigned_user = auth.uid()`.
- Users can `INSERT` notes but the `author_id` must match `auth.uid()`.
- Admins bypass these restrictions via specific RLS policy checks looking up their role.

## Session Management
Sessions are persisted securely via cookies mapped by `@supabase/ssr`. The middleware automatically refreshes expired sessions using `supabase.auth.getSession()`.

## Security Checklist
- [x] Middleware route protection active.
- [x] Admin routes protected from standard users.
- [x] Static assets excluded from proxy.
- [ ] Supabase RLS policies fully implemented and tested.
- [ ] Content Security Policy (CSP) headers applied.
