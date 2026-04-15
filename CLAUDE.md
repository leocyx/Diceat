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

**Diceat** (決定今天要吃什麼 - "What should we eat today?") is a restaurant selection app. Users create groups of restaurants, then roll a 3D animated dice to randomly pick where to eat. Features include Google Maps restaurant search, public/private groups, bookmarking other users' groups, Google OAuth + email/password auth, and group ordering (揪團點餐).

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

- `src/actions/` — Server Actions (group CRUD, toggle favorite, order CRUD); all mutations verify auth and ownership before writing
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
- **Google Maps** (`MapsProvider`) is loaded only in `/groups/create` and `/groups/[id]/edit` pages — NOT in shared layout. Do not add it back to `(main)/layout.tsx`.
- **Auth**: `AuthProvider` is nested inside `QueryProvider` in the root layout (requires `QueryClient` to be available)
- **Time constants**: all `staleTime`, `gcTime`, timeouts use named exports from `src/lib/timeConstants.ts`
- The `Dice` component uses Framer Motion for 3D CSS transforms and `canvas-confetti` for the celebration effect on roll
- **Color scheme**: red/black/white (`red-700`, `red-50`, `slate-*`). No indigo/violet/purple anywhere in the codebase.

## Route Structure (current)

```
/                    → public: 熱門公開地圖，點卡片 → /groups/[id]
/my-groups           → protected: 我的美食地圖
/favorites           → protected: 收藏地圖
/groups/[id]         → public: 抽獎頁（骰子 + 餐廳清單）
/groups/[id]/edit    → protected: 編輯群組
/groups/create       → protected: 建立群組
/orders              → protected: 我的揪團（建立的 + 參與的）
/orders/[id]         → protected: 揪團詳情（點餐 + 總覽）
```

Middleware regex allows unauthenticated access to `/groups/[id]` but NOT `/groups/[id]/edit`:
```ts
!/^\/groups\/[^/]+$/.test(request.nextUrl.pathname)
```

## Key Architectural Decisions

- **Homepage** only fetches `publicGroups` + `favoriteGroups` (for heart state). No myGroups fetch.
- **My-groups page** cards: edit + delete buttons only, NO heart/favorite button.
- **Favorites page** cards: filled heart button to unfavorite.
- **Group cards** all show `group.description` below the name (line-clamp-2).
- **revalidatePath calls** in `src/actions/groups.ts`:
  - `deleteGroupAction` → revalidates `/`, `/my-groups`
  - `toggleFavoriteAction` → revalidates `/`, `/favorites`
  - `updateGroupAction` → revalidates `/`, `/my-groups`, `/groups/${groupId}`, `/groups/${groupId}/edit`
  - `createGroupAction` → revalidates `/`

## 揪團點餐（Group Ordering）

### 資料表（需手動在 Supabase 建立）

- `group_orders` — 揪團主表：`id`, `restaurant_id`, `restaurant_name`（反正規化）, `group_id`, `creator_id`, `status`（open/closed）, `created_at`
- `group_order_items` — 菜單品項：`id`, `group_order_id`, `name`, `price`（整數，元）
- `group_order_selections` — 使用者點餐：`id`, `group_order_id`, `item_id`, `user_id`, `quantity`, `updated_at`；UNIQUE(`item_id`, `user_id`)

### RLS 政策重點

- `group_orders` SELECT：`USING (true)` — 所有登入者皆可讀（含已關閉的，方便分享連結）
- `group_order_items` / `group_order_selections` SELECT：同樣 `USING (true)`
- 寫入操作：`group_orders` 僅 creator 可 UPDATE/DELETE；`selections` 僅本人可 INSERT/UPDATE/DELETE

### Key Files

- `src/actions/orders.ts` — `createGroupOrderAction`, `submitSelectionsAction`, `closeGroupOrderAction`, `deleteGroupOrderAction`
- `src/services/api/orders.ts` — `getOrderById`, `getMyOrders`
- `src/components/ui/Modal.tsx` — 通用 Modal（Framer Motion + `createPortal`）
- `src/components/orders/CreateOrderModal.tsx` — 建立揪團彈窗
- `src/components/orders/OrderDetailClient.tsx` — 揪團詳情頁

### 設計決策

- `restaurant_name` 反正規化儲存，避免餐廳資料刪除後揪團失去名稱
- `price` 用 `integer`（元），避免浮點數問題
- `quantity = 0` 時刪除 selection 列，保持資料表乾淨
- 點餐數量調整為**本地 state**，需按「送出點餐」才寫入；按鈕僅在有改動（`isDirty`）時啟用
- 揪團關閉後：`submitSelectionsAction` 用 `maybeSingle()` 查 status，查不到或 closed 一律拋 `ORDER_CLOSED`；client 捕捉後顯示提示並 `router.refresh()`
- `RestaurantCard` 的揪團按鈕透過可選 `onCreateOrder` prop 控制，`GroupDetailClient` 持有 modal state；未登入者不傳 prop（不顯示按鈕）

### revalidatePath calls in `src/actions/orders.ts`

- `createGroupOrderAction` → revalidates `/orders`
- `submitSelectionsAction` → revalidates `/orders/${groupOrderId}`
- `closeGroupOrderAction` → revalidates `/orders/${orderId}`, `/orders`
- `deleteGroupOrderAction` → revalidates `/orders`

## Google Places Photo URL

`PlacePhoto.getUrl()` without parameters may return a session-based URL that expires. Always use `getUrl({ maxWidth: 800 })`. Store `null` (not empty string) when no photo available:
```ts
photo_url: res.photoUrl || null,
```
Existing records with broken URLs must be fixed by re-adding restaurants in the edit page.

## DiceSection Layout

- `DiceSection` accepts an optional `className` prop to override default `min-h-[550px]`.
- On `/groups/[id]`, DiceSection is set to `lg:min-h-0 lg:h-[600px]` for consistent desktop sizing.
- Dice cube: `160×160px` with `translateZ(80px)` (half of cube size). Do not change translateZ independently from cube size.
- Back/edit bar in `GroupDetailClient` uses natural `py-5` height (no fixed h-16).

## Map Info Card (RestaurantSearch)

- Shows rich overlay with photo, rating, user_ratings_total, price_level, opening_hours, address.
- Clicking empty map area closes the card (`setSelectedPlace(null)`).
- `disableDefaultUI={true}` on Map component.
- Pin color: `#b91c1c` (red-700).
- `ev.stop()` is NOT called on POI click — Google's default info panel is allowed to show.
