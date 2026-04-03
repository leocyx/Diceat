"use client";

import { LayoutGrid, Plus, ChevronRight, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

interface MyCreatedGroupsProps {
  groups: any[];
  isLoading: boolean;
  selectedGroupId: string | null;
  onSelectGroup: (group: any) => void;
  onDeleteGroup: (groupId: string, e: React.MouseEvent) => void;
  user: any;
}

export default function MyCreatedGroups({
  groups,
  isLoading,
  selectedGroupId,
  onSelectGroup,
  onDeleteGroup,
  user,
}: MyCreatedGroupsProps) {
  return (
    <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-black text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider">
          <LayoutGrid size={18} className="text-red-700" />
          我的美食地圖
        </h2>
        {user && (
          <Link
            href="/groups/create"
            className="w-8 h-8 bg-red-50 text-red-700 rounded-full flex items-center justify-center hover:bg-red-700 hover:text-white transition-all"
          >
            <Plus size={18} />
          </Link>
        )}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-slate-50 rounded-2xl animate-pulse flex items-center px-4 gap-3"
              >
                <div className="w-8 h-8 bg-slate-200 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-2/3" />
                  <div className="h-2 bg-slate-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : !user ? (
          <div className="py-10 text-center px-6 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
            <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-tighter">
              登入後即可建立
              <br />
              您的專屬口袋名單 🌮
            </p>
          </div>
        ) : groups.length === 0 ? (
          <div className="py-8 text-center px-6 bg-red-50/30 rounded-[2rem] border border-dashed border-red-100">
            <p className="text-[10px] text-red-400 font-bold mb-3 uppercase tracking-tighter">
              清單空空如也...
            </p>
            <Link
              href="/groups/create"
              className="inline-block bg-red-700 text-white px-4 py-2 rounded-xl text-[10px] font-black shadow-lg shadow-red-100 uppercase"
            >
              立即建立
            </Link>
          </div>
        ) : (
          groups.map((group) => (
            <button
              key={group.id}
              onClick={() => onSelectGroup(group)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                selectedGroupId === group.id
                  ? "bg-red-700 text-white shadow-lg shadow-red-100 scale-[1.02]"
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
                  {group.restaurants.length} 間餐廳
                </span>
              </div>
              <div className="flex items-center gap-1">
                {user?.id === group.creator_id && (
                  <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    <Link
                      href={`/groups/${group.id}/edit`}
                      onClick={(e) => e.stopPropagation()}
                      className={`p-1.5 rounded-lg transition-all ${
                        selectedGroupId === group.id
                          ? "hover:bg-white/20 text-red-100"
                          : "hover:bg-red-50 text-slate-300 hover:text-red-700"
                      }`}
                      title="編輯"
                    >
                      <Edit size={14} />
                    </Link>
                    <div
                      onClick={(e) => onDeleteGroup(group.id, e)}
                      className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                        selectedGroupId === group.id
                          ? "hover:bg-white/20 text-red-100"
                          : "hover:bg-red-50 text-slate-300 hover:text-red-500"
                      }`}
                      title="刪除"
                    >
                      <Trash2 size={14} />
                    </div>
                  </div>
                )}
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
