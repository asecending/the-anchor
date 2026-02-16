# System Architecture & Technical Patterns

## 1. Tech Stack
- **Frontend:** Next.js 14 (App Router) + Tailwind CSS + Lucide React (Icons).
- **Backend/DB:** Supabase (PostgreSQL + Realtime Auth).
- **Deployment:** Vercel (Frontend).
- **PWA Wrapper:** `next-pwa` (to allow "Add to Home Screen" functionality).
- **State Management:** React Query (TanStack Query) for server state; Zustand for local UI state (modals, panic mode).

## 2. Database Schema (Supabase)
### Table: `users`
- `id` (UUID, PK)
- `email`
- `created_at`

### Table: `daily_logs`
- `id` (UUID, PK)
- `user_id` (FK -> users.id)
- `date` (DATE, unique per user)
- `anchor_therapy` (BOOL)
- `anchor_sobriety` (BOOL)
- `anchor_sleep` (BOOL)
- `anchor_movement` (BOOL)
- `mandate_exposure` (BOOL)
- `mandate_coursework` (BOOL)
- `mandate_interaction` (BOOL)
- `night_anchor_completed` (BOOL)
- `notes` (TEXT)
- `score` (INT, 0-10)

### Table: `mulligans`
- `id` (UUID, PK)
- `user_id` (FK)
- `used_at` (TIMESTAMP)
- `reason` (TEXT)
- `remaining` (INT, Computed or tracked)

## 3. Component Architecture
- **`DashboardHeader`**: Shows Day X/90 and Mulligan Count.
- **`AnchorList`**: Reusable component for checkbox items.
- **`PanicOverlay`**: Full-screen modal triggered by "Emergency" button.
- **`ConfettiTrigger`**: Visual reward when all daily tasks are done.

## 4. UI/UX Rules
- **Typography:** Inter or Geist Sans. Clean, readable, clinical but modern.
- **Color Palette:**
  - **Success:** Emerald-500
  - **Neutral:** Slate-900 (Dark Mode default)
  - **Danger:** Rose-600 (Panic Button/Mulligan Loss)
- **Interaction:**
  - Large touch targets (min 44px) for mobile usage.
  - "Swipe to Complete" or "Long Press" for major anchors (prevent accidental clicks).

## 5. Logic Patterns
- **Digital Sundown:** If `current_time > 21:00` (9 PM), the app shows a "Sleep Mode" overlay with only *one* option: "Confirm Phone is Outside Bedroom."
- **Mulligan Logic:** If a user unchecks a "Non-Negotiable" (like Sobriety) for a past date, prompt: "Is this a Mulligan?" -> If Yes, deduct from Bank.