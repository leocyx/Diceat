# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test framework is configured.

## What This App Does

**Diceat** (決定今天要吃什麼 - "What should we eat today?") is a restaurant selection app. Users create groups of restaurants, then roll a 3D animated dice to randomly pick where to eat. Features include Google Maps restaurant search, public/private groups, bookmarking other users' groups, and Google OAuth + email/password auth.

## Architecture

**Next.js App Router** with a hybrid SSR + client pattern:

- **Server Components** fetch initial data from Supabase and pass it as props to Client Components
- **Server Actions** (`src/actions/groups.ts`) handle all mutations, calling `revalidatePath()` after changes
- **Client Components** call Server Actions via `useMutation`, then call `router.refresh()` on success to pull in the revalidated server data
- **Middleware** (`src/middleware.ts`) protects most routes — unauthenticated users are redirected to `/login`. The homepage `/` is an exception; it renders with empty data for unauthenticated users.

### Route Groups

- `src/app/(main)/` — Protected routes (home, group create/edit)
- `src/app/(auth)/` — Public routes (login, register, password reset)
- `src/app/auth/callback/route.ts` — OAuth exchange handler

### Data Flow

1. Page (Server Component) fetches data in parallel via `src/services/api/groups.ts`
2. Data is passed as props to Client Components (e.g. `HomeClient`, `CreateGroupClient`)
3. User mutations call Server Actions via `useMutation` → Supabase → `revalidatePath()`
4. Client calls `router.refresh()` after mutation success, which triggers the server to re-render and deliver fresh props

### Supabase Clients

Two separate clients must be used correctly:
- `src/lib/supabase/server.ts` — Server Components, Server Actions, Route Handlers (uses `next/headers` cookies)
- `src/lib/supabase/client.ts` — Client Components only (browser SSR client); create inside event handlers or query functions, not at component render scope

### Key Directories

- `src/actions/` — Server Actions (group CRUD, toggle favorite); all mutations verify auth and ownership before writing
- `src/services/api/` — Data fetching functions (used in Server Components only)
- `src/contexts/AuthContext.tsx` — `AuthProvider` + `useAuth`; single auth listener for the whole app
- `src/hooks/useAuth.ts` — Re-exports `useAuth` from `src/contexts/AuthContext`; import from either path
- `src/lib/timeConstants.ts` — Shared time constants (`QUERY_STALE_TIME`, `QUERY_GC_TIME`, etc.)
- `src/components/providers/` — `QueryProvider` + `AuthProvider` wrap the app at root layout

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

## Notable Patterns

- **Path alias**: `@/*` maps to `./src/*`
- **Tailwind CSS 4** — uses PostCSS integration (not the Tailwind v3 config file)
- **Google Maps** is loaded via `MapsProvider` in the `(main)` layout; only available within protected routes
- **Auth**: `AuthProvider` is nested inside `QueryProvider` in the root layout (requires `QueryClient` to be available)
- **Time constants**: all `staleTime`, `gcTime`, timeouts use named exports from `src/lib/timeConstants.ts`
- The `Dice` component uses Framer Motion for 3D CSS transforms and `canvas-confetti` for the celebration effect on roll
