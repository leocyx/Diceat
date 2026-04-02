"use client";

import { memo } from "react";
import { Plus, Utensils, User as UserIcon } from "lucide-react";
import { motion } from "framer-motion";
import Dice from "@/components/dice/Dice";
import Link from "next/link";

interface DiceSectionProps {
  selectedGroup: any;
  diceItems: string[];
  isLoading: boolean;
  user: any;
}

// Sub-component to isolate dice header
const DiceHeader = memo(({ group }: { group: any }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-10 flex flex-col items-center text-center w-full px-4"
  >
    <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter mb-3 leading-tight">
      {group ? group.name : "想好吃什麼了嗎？"}
    </h2>
    <p className="text-slate-400 text-sm font-medium max-w-xs leading-relaxed mx-auto">
      {group?.description || "選擇左側清單，或建立您的專屬地圖開始抽選！"}
    </p>
  </motion.div>
));
DiceHeader.displayName = "DiceHeader";

export default function DiceSection({
  selectedGroup,
  diceItems,
  isLoading,
  user,
}: DiceSectionProps) {
  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 lg:p-12 relative overflow-hidden flex flex-col items-center justify-center min-h-[550px]">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-50 rounded-full blur-[100px] opacity-40" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-violet-50 rounded-full blur-[100px] opacity-40" />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center gap-8 animate-pulse">
          <div className="flex flex-col items-center gap-3">
            <div className="h-4 bg-slate-100 rounded-full w-24" />
            <div className="h-10 bg-slate-100 rounded-2xl w-48" />
            <div className="h-3 bg-slate-50 rounded-full w-32" />
          </div>
          <div className="w-48 h-48 bg-slate-50 rounded-[3rem] border-4 border-slate-100" />
          <div className="h-14 bg-slate-100 rounded-full w-40 mt-4" />
        </div>
      ) : (
        <div className="relative z-10 w-full flex flex-col items-center min-h-[400px] justify-center">
          {diceItems.length > 0 ? (
            <>
              <DiceHeader group={selectedGroup} />
              <Dice items={diceItems} />
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center p-8 bg-indigo-50/50 rounded-[2.5rem] border border-dashed border-indigo-200 max-w-sm"
            >
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl shadow-indigo-100 mb-6">
                <Utensils size={32} className="text-indigo-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">
                {selectedGroup?.name}
              </h3>
              <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">
                這個清單目前還是空的喔！
                <br />
                快去地圖搜尋並加入您想吃的餐廳吧。
              </p>
              {user ? (
                user.id === selectedGroup?.creator_id ? (
                  <Link
                    href={`/groups/${selectedGroup.id}/edit`}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
                  >
                    <Plus size={18} />
                    立即加入餐廳
                  </Link>
                ) : (
                  <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
                    Wait for the owner to add items
                  </div>
                )
              ) : (
                <Link
                  href="/login"
                  className="bg-orange-500 text-white px-8 py-3 rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-100 flex items-center gap-2"
                >
                  <UserIcon size={18} />
                  登入以建立專屬地圖
                </Link>
              )}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
