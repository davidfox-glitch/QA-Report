# UI & Design System Guide

## Design Principles
- **Modern & Dynamic:** Use glassmorphism, subtle gradients, and smooth hover micro-animations.
- **Clarity over Density:** Ensure adequate padding and whitespace so tables and modals don't feel cramped.
- **Feedback-Driven:** Every button click, save action, or state change should have visual feedback (loading spinners, toast notifications, color changes).

## Color Palette
- **Primary:** Indigo (`indigo-500` to `indigo-600`) for primary actions and accents.
- **Backgrounds:** Slate darks (`slate-900`, `slate-950`) for dark mode bases; pure white or `slate-50` for light mode.
- **Success/Passing:** Emerald (`emerald-500`).
- **Error/Failing:** Rose (`rose-500`).
- **Warning/Pending:** Amber (`amber-500`).
- **Borders:** Subtle slate borders (`slate-200` light / `slate-800` dark).

## Typography
- **Font Family:** Inter or system sans-serif (via Tailwind default sans).
- **Headings:** Bold, tightly tracked (`tracking-tight`), using `font-display` if configured.
- **Body:** Size `sm` or `xs` for dense table data to maintain readability without overwhelming the viewport.

## UI Components

### Buttons
- **Primary:** `bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg shadow-sm transition-all`.
- **Secondary:** `bg-white border border-slate-200 text-slate-700 hover:bg-slate-50`.
- **Danger:** `bg-rose-500 text-white hover:bg-rose-600`.

### Modals
- **Backdrop:** `bg-slate-900/50 backdrop-blur-sm fixed inset-0 z-50`.
- **Container:** `bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6`.

### Tables
- **Headers:** `bg-slate-50 dark:bg-slate-800 text-xs font-semibold uppercase text-slate-500 py-3 px-4`.
- **Rows:** Alternating subtle backgrounds or simple hover states (`hover:bg-slate-50 dark:hover:bg-slate-800/50`).

### Status Badges
- **Passed:** `bg-emerald-500/10 text-emerald-500 border border-emerald-500/20`.
- **Failed:** `bg-rose-500/10 text-rose-500 border border-rose-500/20`.
- **Pending:** `bg-amber-500/10 text-amber-500 border border-amber-500/20`.

## Dark Mode
Tailwind's `dark:` modifier is used extensively. Ensure that any new component explicitly styles its dark variant, defaulting to deep slate (`slate-900`/`slate-950`) backgrounds and inverted text colors.
