# System Architecture

## Folder Structure
```text
team-of-genus/
├── app/                 # Next.js App Router (catch-all route)
├── docs/                # Project Bible & Documentation
├── public/              # Static assets (images, icons)
├── src/                 # Main React SPA codebase
│   ├── components/      # Reusable UI modules
│   │   ├── auth/        # LoginView
│   │   ├── dashboard/   # Main tables, Archive, Trash, Docs Dash
│   │   └── notes/       # NotesSidebar
│   ├── lib/             # Utility functions and clients
│   │   └── supabase.ts  # Supabase client instance
│   ├── store/           # Global state
│   │   └── useStore.ts  # Zustand store
│   └── App.tsx          # Main React router/container
├── proxy.ts             # Edge middleware for route protection
└── tailwind.config.js   # UI theme configuration
```

## Application Layers

### 1. Edge Layer (`proxy.ts`)
Intercepts incoming Next.js requests to check authentication tokens (via Supabase Auth cookies). Unauthenticated users are sent to `/login`, bypassing static assets.

### 2. Routing Layer (`app/[[...slug]]/page.tsx` & `src/App.tsx`)
Next.js passes all routes to the single `page.tsx` catch-all. From there, `src/App.tsx` handles dynamic rendering based on the `window.location.pathname` or its internal `currentView` state variable.

### 3. State Management Layer (`src/store/useStore.ts`)
Zustand provides a centralized store for all task data (`rows`, `archivedRows`, `trashRows`). This layer currently syncs to local storage to allow rapid development and will eventually sync purely to Supabase via RPCs.

### 4. Database Layer (Supabase PostgreSQL)
The ultimate source of truth. Handles structured data across `test_rows`, `notes`, `attachments`, and `invited_users`.

### 5. AI Layer (Future)
A planned integration layer (likely via Next.js `/api/` endpoints) that will pipe screenshots to Vision models and test text to LLMs for automated summaries.
