"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ShoppingBag, Trash2, Users, UtensilsCrossed } from "lucide-react";
import { deleteGroupOrderAction } from "@/actions/orders";

interface OrderCardProps {
  order: {
    id: string;
    restaurant_name: string;
    status: "open" | "closed";
    created_at: string;
    creator_id: string;
    itemCount: number;
    participantCount: number;
  };
  isOwner: boolean;
  index: number;
}

export default function OrderCard({ order, isOwner, index }: OrderCardProps) {
  const router = useRouter();
  const isClosed = order.status === "closed";

  const deleteMutation = useMutation({
    mutationFn: () => deleteGroupOrderAction(order.id),
    onSuccess: () => router.refresh(),
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("確定要刪除這個揪團嗎？")) return;
    deleteMutation.mutate();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => router.push(`/orders/${order.id}`)}
      className="bg-white p-6 rounded-[2rem] border border-slate-100 hover:shadow-xl hover:shadow-red-50 hover:-translate-y-1 transition-all cursor-pointer group relative"
    >
      {/* Delete button (owner only) */}
      {isOwner && (
        <button
          onClick={handleDelete}
          className="absolute top-5 right-5 p-2 rounded-full bg-white text-slate-300 hover:text-red-500 hover:bg-red-50 shadow-sm border border-slate-50 transition-all"
        >
          <Trash2 size={15} />
        </button>
      )}

      {/* Icon + status */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center shrink-0">
          <UtensilsCrossed size={18} className="text-red-700" />
        </div>
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            isClosed ? "bg-slate-100 text-slate-500" : "bg-green-100 text-green-700"
          }`}
        >
          {isClosed ? "已關閉" : "進行中"}
        </span>
      </div>

      {/* Name */}
      <h3 className="font-black text-slate-800 text-base mb-3 group-hover:text-red-700 transition-colors leading-tight pr-8">
        {order.restaurant_name}
      </h3>

      {/* Meta */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <ShoppingBag size={11} />
          {order.itemCount} 項餐點
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <Users size={11} />
          {order.participantCount} 人點餐
        </div>
      </div>

      {/* Date */}
      <p className="text-[11px] text-slate-300 font-medium mt-3">
        {new Date(order.created_at).toLocaleDateString("zh-TW")}
      </p>
    </motion.div>
  );
}
