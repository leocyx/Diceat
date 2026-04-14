"use client";

import Link from "next/link";
import { LogOut, User as UserIcon, LayoutGrid, Heart, ShoppingBag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <nav id="main-header" className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-200">
            <span className="text-white font-black text-xl">D</span>
          </div>
          <span className="text-xl font-bold text-red-700">
            Diceat
          </span>
        </Link>

        <div className="hidden sm:flex items-center gap-1">
          <Link
            href="/my-groups"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-all"
          >
            <LayoutGrid size={15} />
            我的地圖
          </Link>
          <Link
            href="/orders"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-all"
          >
            <ShoppingBag size={15} />
            揪團點餐
          </Link>
          <Link
            href="/favorites"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-all"
          >
            <Heart size={15} />
            收藏
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                {user.user_metadata?.avatar_url ? (
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-red-100 shadow-sm">
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="w-6 h-6 bg-red-50 rounded-full flex items-center justify-center border border-red-100">
                    <UserIcon size={12} className="text-red-700" />
                  </div>
                )}
                <span className="text-xs font-bold text-slate-700">
                  {user.user_metadata?.full_name || "使用者"}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="登出"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="bg-red-700 text-white px-6 py-2 rounded-full hover:bg-red-800 transition-all shadow-md font-bold text-sm"
            >
              登入 / 註冊
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
