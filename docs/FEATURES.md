# Feature Inventory

## Authentication
- **What it does:** Allows users to log in securely using Google OAuth.
- **How it works:** Leverages Supabase Auth. Unauthenticated users are redirected to `/login` via `proxy.ts` edge middleware.
- **UI:** `<LoginView />`
- **DB/Store:** `supabase.auth`, `session` state.

## Users & Roles
- **What it does:** Differentiates between 'Admin' and standard users. Admins can access settings and user management.
- **How it works:** Role is stored in user metadata or `invited_users` table and verified via middleware and conditional UI rendering.
- **UI:** `<UserManagementView />`
- **DB/Store:** `invited_users` table.

## Testing Tasks (Core)
- **What it does:** Displays the main table of test cases, statuses, modules, and assignments.
- **How it works:** Centralized in Zustand store (`rows`). Editable via inline interactions.
- **UI:** `<Dashboard />`, `<TaskTable />`
- **DB/Store:** `TestRow` interface, `rows` state.

## Notifications & Mentions
- **What it does:** Alerts users when they are mentioned in a note.
- **How it works:** Regex parses note text for `@username`. If matched, triggers `addNotification` in the store.
- **UI:** Top-right Bell Icon, `<NotesSidebar />`
- **DB/Store:** `notifications` array in `useStore`.

## Archive & Trash System
- **What it does:** Manages the lifecycle of completed or deleted tasks to prevent accidental data loss.
- **How it works:** Auto-archives tasks marked as 'Passed'/'Working'. Trashed tasks require typing 'DELETE' to permanently remove.
- **UI:** `<ArchiveView />`, `<TrashView />`, `<PermanentDeleteModal />`
- **DB/Store:** `archivedRows`, `trashRows`, `archiveRow()`, `trashRow()`, `hardDeleteRow()` in `useStore`.

## Notes & Attachments
- **What it does:** Allows users to attach contextual notes and images to specific test cases.
- **How it works:** Stored as nested arrays within the `TestRow` object.
- **UI:** `<NotesSidebar />`
- **DB/Store:** `notes` and `attachments` inside `TestRow`.

## Import Wizard
- **What it does:** Allows bulk importing of test cases from spreadsheets.
- **How it works:** Parses CSV/Excel and maps them to `TestRow` objects.
- **UI:** `<SmartImportModal />`
- **DB/Store:** Updates `rows` state.

## Documentation Dashboard (WIP)
- **What it does:** In-app interface for Admins to view project health and read this documentation.
- **How it works:** Reads project status JSON and displays links to Markdown files.
- **UI:** `<DocumentationDashboard />`
- **DB/Store:** Local file reads / static JSON.
