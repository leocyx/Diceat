# 🎲 Diceat - 決定今天要吃什麼！

[![Next.js](https://img.shields.io/badge/Next.js-15%2B-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_DB-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)

**Diceat** 是一個結合 Google Maps 與 3D 互動遊戲體驗的餐廳選擇平台。旨在解決現代人每天最煩惱的問題：「今天吃什麼？」。使用者可以建立專屬的美食清單，並透過有趣的 3D 骰子動畫隨機抽出下一餐的勝者。

---

## ✨ 核心功能

### 🗺️ 餐廳群組管理

- **地圖直覺操作**：串接 Google Maps API，支援 Places Autocomplete 搜尋與點擊地圖標記 (POI) 快速加入餐廳。
- **群組 CRUD**：自由建立、編輯、刪除您的私人或公開美食清單。
- **引用收藏 (Bookmark)**：發現別人的清單很棒？一鍵收藏到側邊欄，直接引用對方的美食地圖進行抽選。

### 🎲 獨家 3D 互動

- **經典 3D 骰子**：高品質 3D 動畫與平滑旋轉效果。
- **五重煙火特效**：抽出結果後觸發繽紛特效，增加決定晚餐的樂趣。

### 🔐 完善的會員系統

- **多種登入方式**：支援 Google OAuth 快速登入及傳統電子郵件密碼驗證。
- **個人檔案自動同步**：整合 Supabase Auth 與資料庫觸發器，自動同步 Google 頭像與姓名。
- **忘記密碼流程**：完整的密碼重設郵件發送與更新機制。

---

## 🛠️ 技術棧

- **前端框架**: Next.js 15 (App Router)
- **使用者介面**: React 19 + Framer Motion (動畫)
- **樣式解決方案**: Tailwind CSS 4
- **狀態管理**: TanStack Query v5 (React Query)
- **後端服務**: Supabase (Database / Auth / RLS)
- **地圖整合**: `@vis.gl/react-google-maps` (Google Places API)

---

## 🚀 快速開始

### 1. 複製專案

```bash
git clone https://github.com/your-username/diceat.git
cd diceat
```

### 2. 安裝依賴

```bash
npm install
```

### 3. 環境變數設定

建立 `.env.local` 檔案並填入您的憑證：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### 4. 啟動開發伺服器

```bash
npm run dev
```

造訪 `http://localhost:3000` 即可開始使用！

---

## 📄 授權聲明

本專案保留所有權利 (All Rights Reserved)。

目前僅供個人作品集展示與教學交流使用。未經原作者書面授權，禁止將本專案之程式碼用於任何商業用途、營利行為或未經授權的二次分發。
