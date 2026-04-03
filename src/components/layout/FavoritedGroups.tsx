"use client";

import { Heart, HeartOff, ChevronRight, Search } from "lucide-react";
import Link from "next/link";

interface FavoritedGroupsProps {
  favoriteGroups: any[];
  isLoading: boolean;
  selectedGroupId: string | null;
  onSelectGroup: (group: any) => void;
  onToggleFavorite: (groupId: string, isFavorited: boolean) => void;
  user: any;
}

export default function FavoritedGroups({
  favoriteGroups,
  isLoading,
  selectedGroupId,
  onSelectGroup,
  onToggleFavorite,
  user,
}: FavoritedGroupsProps) {
  return (
    <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-black text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider">
          <Heart size={18} className="text-red-500 fill-red-500" />
          收藏的美食地圖
        </h2>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-slate-50 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : !user ? (
          <div className="py-8 text-center px-6 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
            <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-tighter">
              登入後即可收藏別人的清單
              <br />
              隨時隨地輕鬆開抽！ 💖
            </p>
          </div>
        ) : favoriteGroups.length === 0 ? (
          <div className="py-8 text-center px-6 bg-red-50/30 rounded-[2rem] border border-dashed border-red-100">
            <p className="text-[10px] text-red-400 font-bold mb-3 uppercase tracking-tighter leading-relaxed">
              尚未收藏任何清單
              <br />
              快去下方探索熱門清單吧！
            </p>
            <div className="flex justify-center text-red-200">
              <Search size={20} />
            </div>
          </div>
        ) : (
          favoriteGroups.map((group) => (
            <button
              key={group.id}
              onClick={() => onSelectGroup(group)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                selectedGroupId === group.id
                  ? "bg-red-500 text-white shadow-lg shadow-red-100 scale-[1.02]"
                  : "bg-slate-50 text-slate-600 hover:bg-white hover:shadow-md hover:ring-1 hover:ring-red-100"
              }`}
            >
              <div className="flex flex-col items-start overflow-hidden text-left">
                <span className="font-bold text-xs truncate w-full">
                  {group.name}
                </span>
                <span
                  className={`text-[9px] font-medium ${
                    selectedGroupId === group.id
                      ? "text-red-100"
                      : "text-slate-400"
                  }`}
                >
                  by {group.profiles?.username || "未知"} ·{" "}
                  {group.restaurants?.length || 0} 間餐廳
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(group.id, true);
                  }}
                  className={`p-1.5 rounded-lg opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all cursor-pointer ${
                    selectedGroupId === group.id
                      ? "hover:bg-white/20 text-red-100"
                      : "hover:bg-red-50 text-slate-300 hover:text-red-500"
                  }`}
                  title="移除收藏"
                >
                  <HeartOff size={14} />
                </div>
                <ChevronRight
                  size={14}
                  className={
                    selectedGroupId === group.id
                      ? "text-white"
                      : "text-slate-300"
                  }
                />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
