# Diceat - 餐廳選擇平台開發進度存檔

## 1. 核心願景

幫助使用者快速、有趣地決定今天要吃什麼。透過 Google Maps 建立私人或公開的餐廳群組，並使用 3D 骰子動畫進行隨機抽選。

## 2. 目前已完成功能 (Completed)

### 認證與會員 (Auth)

- [x] **多重登入方案**：支援 Google OAuth 快速登入及電子郵件密碼註冊。
- [x] **忘記密碼流程**：實作發送重設郵件與自定義重設密碼頁面（`/forgot-password`, `/reset-password`）。
- [x] **資料庫自動同步**：透過 Postgres Trigger 自動將 Auth 資料同步至 `profiles` 表。
- [x] **登入保護**：實作 Client-side 路由保護，未登入使用者無法進入建立頁面。

### 餐廳群組管理 (Groups)

- [x] **地圖搜尋與建立**：支援 Google Places Autocomplete 搜尋並加入餐廳。
- [x] **編輯與刪除**：完整的 CRUD 功能，並透過「共用元件」統一建立與編輯頁面的 UI 邏輯。
- [x] **引用收藏 (Reference)**：新增 `user_favorites` 機制，使用者可收藏他人公開清單並於側欄即時調用抽選。
- [x] **身分權限分開**：自建群組顯示「編輯/刪除」，收藏群組顯示「移除收藏」，未登入則引導登入。

### 架構與效能 (Architecture & Performance)

- [x] **全站導覽列整合**：將 `Header` 移至 `layout.tsx` (Root Layout)，實現全站導航無閃爍切換。
- [x] **極致元件化**：
  - 側邊欄分拆為 `MyCreatedGroups` 與 `FavoritedGroups`。
  - 群組設定與餐廳清單封裝為 `GroupSettingsForm` 與 `GroupRestaurantsList` 共用元件。
  - 骰子區域獨立為 `DiceSection`。

### 安全性 (Security)

- [x] **RLS 安全加固**：擬定完整的 Row Level Security 政策，確保 `anon-key` 暴露下的資料安全性。

## 3. 技術棧 (Current Tech Stack)

- **Framework**: Next.js 15+ (App Router)
- **UI**: React 19 + Framer Motion
- **Styling**: Tailwind CSS 4 (全站藍紫色調統一)
- **State Management**: TanStack Query v5 (React Query)
- **Backend**: Supabase (Auth, Database, RLS)
- **Maps**: @vis.gl/react-google-maps

## 4. 接下來的計畫 (Upcoming Tasks)

1. [ ] **架構升級 (SSR)**：將 Client-side Supabase 邏輯遷移至 Server Components 與 Server Actions 以提升安全性。
2. [ ] **複製他人清單 (Fork)**：將收藏的清單實體化複製到「我的建立」，允許使用者修改他人模板。
3. [ ] **抽中詳情卡片**：結果出爐後顯示餐廳詳細卡片（地址、照片、評分、開啟導航）。
4. [ ] **多人群組協作**：邀請好友共同編輯同一份美食清單。
5. [ ] **標籤系統**：為群組加入標籤（#拉麵 #台北）並優化篩選功能。
