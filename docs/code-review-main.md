# Code Review：`main` 分支（client-side 版本）

針對原始 client-side logic 版本的 code review，按實際影響程度排序。

---

## 已修復

### ~~1. `upsert` 順序假設錯誤~~ （誤判，撤回）
原以為 `.upsert(...).select("id")` 回傳順序錯亂會造成餐廳跟錯 group，實際上 `relationsToInsert` 只是產生 `{group_id, restaurant_id}` pair，`group_id` 固定、`restaurant_id` 直接從回傳 row 拿，**沒有用 index 對回原始陣列**，順序不影響結果。

### ~~2. Edit 流程沒有 transaction~~ ✅ 已修復
**檔案**：`src/app/(main)/groups/[id]/edit/page.tsx`

原本先 `delete all group_restaurants` 再 insert，中間失敗會把使用者餐廳清光。

已改成 **diff-based update**：
1. 先 fetch 當前的 relations
2. 算出 `toAdd` / `toRemove`
3. **先 insert 新增的**（安全：失敗不會掉資料）
4. **再 delete 要移除的**（就算失敗，頂多多留幾筆孤兒）

### 3. Ownership 只在 client 檢查 — 已由 DB RLS 處理
`edit/page.tsx:38-43` 的 client-side check 只是 UX 提示，實際防護靠 Supabase RLS policy，已確認有設。

### ~~4. `useAuth` 每個 component 各訂閱一次~~ ✅ 已修復
**新檔案**：`src/contexts/AuthContext.tsx`

改成 `AuthProvider` Context：
- 全 app 只有**一個** `onAuthStateChange` listener
- 全 app 只有**一個** profile query
- `src/hooks/useAuth.ts` 改成 re-export，所有 importer 不需改

layout.tsx 包成：`<QueryProvider><AuthProvider>{children}</AuthProvider></QueryProvider>`

### ~~5. Profile auto-create race condition~~ ✅ 已修復
**檔案**：`src/contexts/AuthContext.tsx`

原本 SELECT → 查不到就 INSERT，兩個 concurrent 呼叫會撞 unique constraint。

已改成：
```ts
.upsert({...}, { onConflict: 'id', ignoreDuplicates: true })
```
Insert 後再 re-select，race 情況下兩邊都會拿到同一筆 row，不會 throw。

---

## 已修復（中優先級）

### ~~6. `RestaurantSearch` Autocomplete listener 沒清除~~ ✅ 已修復
**檔案**：`src/components/map/RestaurantSearch.tsx`

加了 cleanup，同時改用局部變數取代 ref 避免 closure 問題：
```ts
return () => { google.maps.event.clearInstanceListeners(autocomplete) }
```

### ~~7. Map 用 `defaultCenter` 無法重新定位~~ ✅ 已修復
**檔案**：`src/components/map/RestaurantSearch.tsx`

移掉沒作用的 `mapCenter` state，改用 `map.panTo()` imperative：搜尋選取和地圖點擊 POI 時都會呼叫 `map.panTo()`。

### ~~8. Dice items 改變不會 reset 中獎結果~~ ✅ 已修復
**檔案**：`src/components/dice/Dice.tsx`

items useEffect 加入 `setWinner(null)`，切換群組時下方結果文字會清除。

### ~~9. 頁面保護只在 client-side~~ 不列入（SSR 分支處理）

---

## 低優先級

- `page.tsx:60` `deleteMutation.onSuccess` 無論刪哪個 group 都 `setSelectedGroup(null)`，應只在刪的是當前選中的才清
- `page.tsx:40-52` `hasInitiallySelected` ref 登出再登入不會 reset
- `PublicGroupsSection.tsx:33` `staleTime: 10s` 比全域 5 分鐘短
- `useAuth.ts:121-123` `logout()` 後 Home 還留著 `selectedGroup`
- `page.tsx:17` `logout` import 但未使用
