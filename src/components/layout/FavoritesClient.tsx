"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Heart, Search, MapPin, User as UserIcon } from "lucide-react";
import { toggleFavoriteAction } from "@/actions/groups";

interface FavoritesClientProps {
  user: any;
  initialGroups: any[];
}

export default function FavoritesClient({
  user,
  initialGroups,
}: FavoritesClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGroups = useMemo(
    () =>
      initialGroups.filter(
        (g) =>
          g.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [initialGroups, searchQuery],
  );

  const favoriteMutation = useMutation({
    mutationFn: ({
      groupId,
      isFavorited,
    }: {
      groupId: string;
      isFavorited: boolean;
    }) => toggleFavoriteAction(groupId, isFavorited),
    onSuccess: () => router.refresh(),
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between px-2 gap-6">
          <div className="flex flex-col">
            <h2 className="font-black text-2xl text-slate-900 flex items-center gap-2">
              <Heart size={24} className="text-red-500 fill-red-500" />
              收藏的美食地圖
            </h2>
            <p className="text-xs text-slate-400 font-bold mt-1">
              您收藏的所有口袋名單
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
              placeholder="搜尋收藏清單..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-red-700/20 focus:border-red-700 transition-all outline-none text-sm shadow-sm"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-2">
          {filteredGroups.length === 0 ? (
            <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={32} className="text-slate-200" />
              </div>
              <p className="text-slate-400 font-bold">
                {searchQuery ? "找不到符合的清單" : "還沒有收藏任何清單"}
              </p>
            </div>
          ) : (
            filteredGroups.map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => router.push(`/groups/${group.id}`)}
                className="bg-white p-7 rounded-[2.5rem] border border-slate-100 hover:shadow-2xl hover:shadow-red-100 hover:-translate-y-2 transition-all text-left group relative overflow-hidden"
              >
                {/* Unfavorite button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    favoriteMutation.mutate({
                      groupId: group.id,
                      isFavorited: true,
                    });
                  }}
                  className="absolute top-6 right-6 z-20 p-2 rounded-full bg-red-50 text-red-500 shadow-sm transition-all cursor-pointer hover:bg-red-100"
                >
                  <Heart size={18} className="fill-current" />
                </button>

                {/* Creator info */}
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

                <h4 className="font-black text-slate-800 text-lg mb-1 group-hover:text-red-700 transition-colors leading-tight relative z-10">
                  {group.name}
                </h4>
                {group.description && (
                  <p className="text-slate-400 text-xs font-medium mb-3 line-clamp-2 leading-relaxed relative z-10">
                    {group.description}
                  </p>
                )}

                <div className="flex items-center gap-2 relative z-10">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full">
                    <MapPin size={10} className="fill-red-700" />
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
    </div>
  );
}
