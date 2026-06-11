# Changelog

All notable changes to this project will be documented in this file.

## [1.0.1] - 2026-06-11
### Added
- Complete Documentation System (`docs/` directory) acting as the Project Bible.
- `DocumentationDashboard` component to view project health.
- Feature Status Matrix integrated into the roadmap.
- Self Audit System initial run scripts.

### Fixed
- Next.js 16 deprecation warning by renaming `middleware.ts` to `proxy.ts` and updating exports.
- Module Not Found (500/404 Error) on `/login` and other routes by moving `app/page.tsx` into a catch-all route `app/[[...slug]]/page.tsx`.
- UI breakage and `service-worker.js` redirects by modifying the edge proxy matcher regex to bypass static file extensions.

## [1.0.0] - 2026-06-10
### Added
- Auto-Archiving logic in `useStore.ts`.
- `ArchiveView` and `TrashView` components.
- `PermanentDeleteModal` requiring 'DELETE' typing validation.
- `@mention` regex parsing in `NotesSidebar.tsx` connecting to the notification bell system.
- Supabase schema migrations for `invited_users`.
