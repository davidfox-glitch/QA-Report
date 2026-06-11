# Security & RLS Audit

**Date:** 2026-06-11
**Status:** WARNING

## Findings
- **Edge Proxy:** `proxy.ts` is correctly blocking unauthenticated access to the application, except for static assets (which are safely whitelisted).
- **Supabase RLS:** Row Level Security (RLS) policies are active, but need a thorough review to ensure standard users cannot forge `assigned_user` ID tokens when calling `supabase.from('test_rows').update()`.
- **Data Leakage:** The `invited_users` table is correctly protected so only Admins can query full user lists.

## Next Actions
- Write automated RLS unit tests using `pgTAP` or a similar Supabase testing framework.
- Add Content Security Policy (CSP) headers in `next.config.js`.
