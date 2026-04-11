# Code Review：`feature/ssr-refactor` 分支

三個平行 agent 檢查 `main..feature/ssr-refactor` ~850 行 diff 的收斂結果。

---

## 已修復

### ~~1. Sidebar 刪除/收藏後不會更新~~ ✅ 已修復
**檔案**：`src/components/layout/HomeClient.tsx`

`deleteMutation` / `favoriteMutation` 成功後改為呼叫 `router.refresh()`，觸發 server 重新 render 並更新 props。
- delete 只在刪的是當前 selectedGroup 時才清空
- `useState` 初始值改為 `() => initialMyGroups[0] ?? null` 消除 hydration flash
- 同時加入手機版 scroll to dice section 邏輯（`diceSectionRef` + `main-header` 動態高度）

### ~~2. OAuth callback open redirect~~ ✅ 已修復
**檔案**：`src/app/auth/callback/route.ts`

加入 `next` 參數驗證：
```ts
const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/'
```

### ~~3. `deleteGroupAction` 沒驗 ownership~~ ✅ 已修復
**檔案**：`src/actions/groups.ts`

- `deleteGroupAction`：加入 `auth.getUser()` + `.eq('creator_id', user.id)` filter
- `updateGroupAction`：UPDATE 加上 `.eq('creator_id', user.id)` defense-in-depth

### ~~4. `useAuth` 每次 render 建新 Supabase client~~ ✅ 已修復
`hooks/useAuth.ts` 改為 re-export `AuthContext.tsx`，全 app 只有一個 AuthProvider instance，auth listener 只訂閱一次。

### ~~5. middleware `startsWith('/auth')` 太寬鬆~~ ✅ 已修復
**檔案**：`src/middleware.ts`

`startsWith('/auth')` → `startsWith('/auth/')` 避免 match 到 `/auth-debug` 等路徑。

### ~~6. `PublicGroupsSection` 每次 render `createClient()`~~ ✅ 已修復
**檔案**：`src/components/layout/PublicGroupsSection.tsx`

`createClient()` 移入 `queryFn` 內，只在 React Query 實際發起請求時才執行，不在 render 週期中。

### ~~7. `services/api/groups.ts` 有死碼~~ ✅ 已修復
**檔案**：`src/services/api/groups.ts`

移除 `deleteGroup`、`toggleFavorite` 兩個 mutation helpers（已被 Server Actions 取代）。

---

## 低優先級（已處理）

- `HomeClient.tsx` `useState` 初始值直接用 `initialMyGroups[0] ?? null` ✅
- `middleware.ts` 放行 `/`：homepage 本身透過 server component 內的 `getUser()` 處理 auth，不需要 middleware 擋，行為一致 ✅（不需修改）
