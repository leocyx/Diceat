"use client";

import { Utensils, Star, Trash2, Search, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Restaurant } from "@/components/map/RestaurantSearch";

interface GroupRestaurantsListProps {
  restaurants: Restaurant[];
  onRemoveRestaurant: (id: string) => void;
  onClearAll?: () => void;
}

export default function GroupRestaurantsList({
  restaurants,
  onRemoveRestaurant,
  onClearAll,
}: GroupRestaurantsListProps) {
  return (
    <aside className="bg-white rounded-3xl shadow-sm border border-slate-100 sticky top-[100px] overflow-hidden">
      <div className="p-6 border-b border-slate-50 bg-red-50/30">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <Utensils size={18} className="text-red-700" />
            已選餐廳 ({restaurants.length})
          </h2>
          {onClearAll && restaurants.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-xs font-bold text-red-500 hover:text-red-600"
            >
              全部清空
            </button>
          )}
        </div>
      </div>

      <div className="p-4 max-h-[60vh] overflow-y-auto">
        <AnimatePresence initial={false}>
          {restaurants.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-12 flex flex-col items-center text-center px-6"
            >
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Search size={24} className="text-slate-300" />
              </div>
              <p className="text-slate-400 text-sm">
                尚未加入任何餐廳，
                <br />
                請使用地圖搜尋並加入。
              </p>
            </motion.div>
          ) : (
            <div className="grid gap-3">
              {restaurants.map((res) => (
                <motion.div
                  key={res.id}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="group bg-slate-50 p-4 rounded-2xl flex justify-between items-center hover:bg-white hover:shadow-md hover:ring-1 hover:ring-red-100 transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-800 text-sm group-hover:text-red-700 transition-colors">
                      {res.name}
                    </h4>
                    {res.address && (
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{res.address}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 text-orange-500 font-bold text-[10px]">
                        <Star size={10} className="fill-orange-500" />
                        {res.rating}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveRestaurant(res.id)}
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-6 bg-slate-50/50 border-t border-slate-100">
        <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-red-50">
          <Info size={16} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-[10px] text-slate-400 leading-relaxed">
            加入餐廳後，您可以在首頁進入此群組，使用 3D 骰子隨機決定午餐或晚餐！
          </p>
        </div>
      </div>
    </aside>
  );
}
