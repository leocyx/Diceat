"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  LayoutGrid,
  Plus,
  Search,
  MapPin,
  User as UserIcon,
  Edit,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { deleteGroupAction } from "@/actions/groups";

interface MyGroupsClientProps {
  user: any;
  initialGroups: any[];
}

export default function MyGroupsClient({
  user,
  initialGroups,
}: MyGroupsClientProps) {
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

  const deleteMutation = useMutation({
    mutationFn: deleteGroupAction,
    onSuccess: () => router.refresh(),
  });

  const handleDelete = (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("確定要刪除這個美食清單嗎？")) return;
    deleteMutation.mutate(groupId);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between px-2 gap-6">
          <div className="flex flex-col">
            <h2 className="font-black text-2xl text-slate-900 flex items-center gap-2">
              <LayoutGrid size={24} className="text-red-700" />
              我的美食地圖
            </h2>
            <p className="text-xs text-slate-400 font-bold mt-1">
              管理您建立的所有口袋名單
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full lg:w-72">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={18} className="text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋我的清單..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-red-700/20 focus:border-red-700 transition-all outline-none text-sm shadow-sm"
              />
            </div>
            <Link
              href="/groups/create"
              className="shrink-0 flex items-center gap-1.5 bg-red-700 text-white px-5 py-3 rounded-2xl font-bold hover:bg-red-800 transition-all shadow-sm text-sm"
            >
              <Plus size={16} />
              新增
            </Link>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-2">
          {filteredGroups.length === 0 ? (
            <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={32} className="text-slate-200" />
              </div>
              <p className="text-slate-400 font-bold mb-4">
                {searchQuery ? "找不到符合的清單" : "還沒有建立任何清單"}
              </p>
              {!searchQuery && (
                <Link
                  href="/groups/create"
                  className="inline-flex items-center gap-2 bg-red-700 text-white px-6 py-3 rounded-2xl font-bold hover:bg-red-800 transition-all shadow-sm"
                >
                  <Plus size={16} />
                  立即建立
                </Link>
              )}
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
                {/* Action buttons */}
                <div className="absolute top-6 right-6 z-20 flex items-center gap-1">
                  <Link
                    href={`/groups/${group.id}/edit`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-full bg-white text-slate-300 hover:text-red-700 hover:bg-red-50 shadow-sm border border-slate-50 transition-all"
                  >
                    <Edit size={16} />
                  </Link>
                  <button
                    onClick={(e) => handleDelete(group.id, e)}
                    className="p-2 rounded-full bg-white text-slate-300 hover:text-red-500 hover:bg-red-50 shadow-sm border border-slate-50 transition-all cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Creator info */}
                <div className="flex items-center gap-3 mb-5 relative z-10">
                  <div className="w-9 h-9 bg-slate-100 rounded-full overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
                    {user?.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt="me"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <UserIcon size={16} className="text-slate-300" />
                    )}
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {user?.user_metadata?.full_name || "我"}
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
                  {!group.is_public && (
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 py-1 bg-slate-100 rounded-full">
                      私人
                    </span>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
