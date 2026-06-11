# Testing Workflow Guide

## Import Process
1. Admin clicks **Import**.
2. `<SmartImportModal>` reads CSV/XLSX files.
3. Maps columns to the `TestRow` interface (Module, Test Point, Expected Result).
4. Data is pushed to the active `rows` array in Zustand.

## Task Lifecycle Flow
1. **Active State:** Tasks sit in the main Dashboard table. Testers click the status badge to cycle through `Pending` -> `In Progress` -> `Passed` / `Failed`.
2. **Documentation:** Testers open the Notes Sidebar to add actual results, attach screenshots, or `@mention` a developer for clarification.
3. **Archiving:** If a task status is changed to `Passed` or `Working`, `useStore.ts` intercepts the update and automatically pushes the task to `archivedRows`, removing it from the active clutter.
4. **Trashing:** If a task is invalid, it can be moved to the Trash. From the Trash, it can be restored or permanently deleted (requiring the explicit 'DELETE' confirmation).

## User vs Admin Workflow
- **Users:** Focus on executing tests. They see the main dashboard and their assigned modules.
- **Admins:** Oversee project health via the `DocumentationDashboard` and `Users` view, managing invites and reading automated audit reports.
