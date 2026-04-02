"use client";

import { useState, useMemo } from "react";
import { Search, Globe, MapPin, User as UserIcon, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getPublicGroups } from "@/services/api/groups";
import { QUERY_STALE_TIME } from "@/lib/timeConstants";
import { useRouter } from "next/navigation";

interface PublicGroupsSectionProps {
  onSelectGroup: (group: any) => void;
  favoriteGroupIds?: Set<string>;
  onToggleFavorite?: (groupId: string, isFavorited: boolean) => void;
  user?: any;
}

export default function PublicGroupsSection({
  onSelectGroup,
  favoriteGroupIds = new Set(),
  onToggleFavorite,
  user,
}: PublicGroupsSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const {
    data: groups,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["groups", "public"],
    queryFn: getPublicGroups,
    staleTime: QUERY_STALE_TIME,
  });

  const displayGroups = groups ?? [];

  const filteredGroups = useMemo(() => {
    return displayGroups.filter(
      (group: any) =>
        group?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group?.description?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [displayGroups, searchQuery]);

  return (
    <div className="flex flex-col gap-8 py-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between px-2 gap-6">
        <div className="flex flex-col">
          <h2 className="font-black text-2xl text-slate-900 flex items-center gap-2">
            <Globe size={24} className="text-indigo-600" />
            熱門公開地圖
            {isPending && (
              <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full animate-pulse ml-2">
                Syncing...
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400 font-bold mt-1">
            看看大家都收藏了哪些口袋名單
          </p>
        </div>

        <div className="relative w-full lg:w-96">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋美食清單..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-sm shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-2">
        {isPending ? (
          [...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-44 bg-white rounded-[2.5rem] border border-slate-100 p-6 animate-pulse flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 rounded-full" />
                <div className="h-3 bg-slate-100 rounded w-20" />
              </div>
              <div className="h-5 bg-slate-100 rounded w-3/4 mt-2" />
              <div className="h-3 bg-slate-50 rounded w-1/4 mt-auto" />
            </div>
          ))
        ) : isError ? (
          <div className="col-span-full py-12 text-center text-red-500">
            載入失敗，請稍後再試。
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={32} className="text-slate-200" />
            </div>
            <p className="text-slate-400 font-bold">目前沒有公開清單</p>
          </div>
        ) : (
          filteredGroups.map((group, index) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => {
                onSelectGroup(group);
              }}
              className="bg-white p-7 rounded-[2.5rem] border border-slate-100 hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-2 transition-all text-left group relative overflow-hidden"
            >
              {/* Favorite Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!user) return router.push("/login");
                  onToggleFavorite?.(group.id, favoriteGroupIds.has(group.id));
                }}
                className={`absolute top-6 right-6 z-20 p-2 rounded-full transition-all cursor-pointer ${
                  favoriteGroupIds.has(group.id)
                    ? "bg-red-50 text-red-500 shadow-sm"
                    : "bg-white text-slate-300 hover:text-red-400 shadow-sm border border-slate-50"
                }`}
              >
                <Heart
                  size={18}
                  className={
                    favoriteGroupIds.has(group.id) ? "fill-current" : ""
                  }
                />
              </button>

              <div className="flex items-center gap-3 mb-5 relative z-10">
                <div className="w-9 h-9 bg-slate-100 rounded-full overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
                  {group.profiles?.avatar_url ? (
                    <img
                      src={group.profiles.avatar_url}
                      alt="Creator"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon size={16} className="text-slate-300" />
                  )}
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {group.profiles?.username || "未知食神"}
                </span>
              </div>

              <h4 className="font-black text-slate-800 text-lg mb-3 group-hover:text-indigo-600 transition-colors leading-tight relative z-10">
                {group.name}
              </h4>

              <div className="flex items-center gap-2 relative z-10">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full">
                  <MapPin size={10} className="fill-indigo-600" />
                  <span className="text-[10px] font-black uppercase">
                    {group.restaurants?.length || 0} Places
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
