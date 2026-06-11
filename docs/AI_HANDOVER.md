# AI Memory Handover

## Project Summary
QAFlow Pro is an Enterprise Testing Management Platform built with Next.js (SPA wrapper) and Supabase. The goal is to provide a seamless UI for QA teams to track, verify, and resolve application bugs, with extensive AI automation planned.

## Current State
The core application is stable. Auth is handled at the edge (`proxy.ts`). State is primarily in `src/store/useStore.ts`. The UI is styled with TailwindCSS.

## Recent Changes
- Renamed `middleware.ts` to `proxy.ts` to fix Next.js 16 deprecation warnings.
- Solved 500/404 errors by moving `app/page.tsx` to `app/[[...slug]]/page.tsx`.
- Completed the `Archive` and `Trash` task lifecycle flows.
- Generated the complete `docs/` Project Bible.

## Open Tasks
- Finish the `DocumentationDashboard` React component.
- Finalize the Audit reports generation.

## Important Decisions
- The Next.js `app` router is purely a container for the React SPA router (`src/App.tsx`). Do NOT attempt to build server-rendered subpages (`app/users/page.tsx`) as they will break the SPA state context.
- We enforce strict lifecycles: Never physically `delete` a task immediately; it must pass through the `Archive` or `Trash` states first.

## Next Steps
If you are a new AI reading this, review `docs/ROADMAP.md` and check `docs/PROJECT_STATUS.json` to find your next assignment.
