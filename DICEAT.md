# Diceat - 餐廳選擇平台開發進度存檔

## 1. 核心願景

幫助使用者快速、有趣地決定今天要吃什麼。透過 Google Maps 建立私人或公開的餐廳群組，並使用 3D 骰子動畫進行隨機抽選。

## 2. 目前已完成功能 (Completed)

### 認證與會員 (Auth)

- [x] **多重登入方案**：支援 Google OAuth 快速登入及電子郵件密碼註冊。
- [x] **忘記密碼流程**：實作發送重設郵件與自定義重設密碼頁面（`/forgot-password`, `/reset-password`）。
- [x] **資料庫自動同步**：透過 Postgres Trigger 自動將 Auth 資料同步至 `profiles` 表。
- [x] **登入保護**：Middleware 路由保護，未登入使用者自動導向 `/login`。

### 餐廳群組管理 (Groups)

- [x] **地圖搜尋與建立**：支援 Google Places Autocomplete 搜尋並加入餐廳。
- [x] **編輯與刪除**：完整的 CRUD 功能，並透過「共用元件」統一建立與編輯頁面的 UI 邏輯。
- [x] **引用收藏 (Reference)**：新增 `user_favorites` 機制，使用者可收藏他人公開清單並於側欄即時調用抽選。
- [x] **身分權限分開**：自建群組顯示「編輯/刪除」，收藏群組顯示「移除收藏」，未登入則引導登入。

### 揪團點餐 (Group Ordering)

- [x] **建立揪團**：在餐廳清單頁任一餐廳 card 點擊「揪團點餐」，彈窗輸入菜單品項（名稱 + 價格）後建立。
- [x] **分享連結**：每個揪團有獨立 URL (`/orders/[id]`)，複製連結分享給朋友即可共同點餐。
- [x] **點餐送出**：調整各品項數量後按「送出點餐」一次更新，有改動才能送出（dirty state 判斷）。
- [x] **即時總覽**：頁面下方顯示所有參與者的點餐明細與個人小計、全體總計。
- [x] **關閉揪團**：建立者可關閉揪團，關閉後所有人無法再修改數量。
- [x] **過期防護**：未重整頁面就送出時 server 端檢查 status，已關閉則回傳明確錯誤提示。
- [x] **我的揪團頁**：`/orders` 列出自己建立與參與的所有揪團，支援刪除。

### 架構與效能 (Architecture & Performance)

- [x] **SSR 重構**：Server Components 抓資料並以 props 傳入 Client Components，Server Actions 處理所有寫入。
- [x] **極致元件化**：
  - 側邊欄分拆為 `MyCreatedGroups` 與 `FavoritedGroups`。
  - 群組設定與餐廳清單封裝為 `GroupSettingsForm` 與 `GroupRestaurantsList` 共用元件。
  - 骰子區域獨立為 `DiceSection`。
  - 通用 `Modal` 元件（Framer Motion + `createPortal`）。

### 安全性 (Security)

- [x] **RLS 安全加固**：完整的 Row Level Security 政策，確保 `anon-key` 暴露下的資料安全性。

## 3. 技術棧 (Current Tech Stack)

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19 + Framer Motion
- **Styling**: Tailwind CSS 4 (red/black/white 色調)
- **State Management**: TanStack Query v5 (React Query)
- **Backend**: Supabase (Auth, Database, RLS)
- **Maps**: @vis.gl/react-google-maps

## 4. 接下來的計畫 (Upcoming Tasks)

1. [ ] **複製他人清單 (Fork)**：將收藏的清單實體化複製到「我的建立」，允許使用者修改他人模板。
2. [ ] **抽中詳情卡片**：結果出爐後顯示餐廳詳細卡片（地址、照片、評分、開啟導航）。
3. [ ] **多人群組協作**：邀請好友共同編輯同一份美食清單。
4. [ ] **標籤系統**：為群組加入標籤（#拉麵 #台北）並優化篩選功能。
5. [ ] **揪團即時更新**：Supabase Realtime 訂閱 `group_order_selections`，其他人點餐後自動刷新頁面。
