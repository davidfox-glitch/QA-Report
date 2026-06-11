# AI Context & Initialization

**ATTENTION AI MODELS (ChatGPT, Gemini, Claude, Copilot):**
Read this file carefully to understand the exact state of QAFlow Pro.

## Current Architecture
- **Framework:** Next.js 16.2.9 (Turbopack) functioning as a React SPA wrapper.
- **Routing Strategy:** We use a catch-all route `app/[[...slug]]/page.tsx` which loads `src/App.tsx`. `src/App.tsx` handles client-side routing based on `window.location.pathname` and `currentView` state.
- **State Management:** `zustand` is used heavily in `src/store/useStore.ts` to manage `test_rows`, `archivedRows`, `trashRows`, and notifications. It persists to localStorage for rapid dev.
- **Auth:** Supabase Auth (Google OAuth). Handled edge-side via `proxy.ts`.

## Current Progress
- **Working:** UI routing, Authentication, Auto-Archiving (tasks set to 'Passed' move to Archive), Trash Bin (requires 'DELETE' to perm-delete), Notes with `@mentions` alerting the top-right notification bell.
- **Pending:** Deep AI Notes integration, actual Supabase DB sync (currently relying on Zustand local storage mock for rows).

## Known Quirks / Rules
1. **Do not use `middleware.ts`.** Next.js 16 deprecated it. Use `proxy.ts` and export a `proxy` function. Ensure the matcher regex ignores `.*\.css`, `.*\.js`, `manifest.json`, and `service-worker.js` or they will be blocked by auth redirects.
2. **Never delete code randomly.** Always preserve existing CSS classes and UI layouts.
3. **Updating the Store:** When modifying state, ensure you explicitly call the `saveToLocal` (if implemented) or rely on Zustand's persist logic.
4. **Documentation:** You MUST update `ROADMAP.md` and `CHANGELOG.md` when completing new features.

## Next Steps
- Build out the actual Supabase data fetching in `useStore.ts`.
- Implement the automated Report Generator.
