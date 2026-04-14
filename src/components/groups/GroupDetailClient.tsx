"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Edit, Utensils } from "lucide-react";
import Link from "next/link";
import { toggleFavoriteAction } from "@/actions/groups";
import DiceSection from "@/components/layout/DiceSection";
import RestaurantCard from "@/components/groups/RestaurantCard";
import CreateOrderModal from "@/components/orders/CreateOrderModal";

interface GroupDetailClientProps {
  group: any;
  user: any;
}

export default function GroupDetailClient({ group, user }: GroupDetailClientProps) {
  const router = useRouter();
  const [orderTarget, setOrderTarget] = useState<{ id: string; name: string } | null>(null);

  const diceItems = useMemo(
    () => group.restaurants.map((r: any) => r.name),
    [group],
  );

  const favoriteMutation = useMutation({
    mutationFn: ({ groupId, isFavorited }: { groupId: string; isFavorited: boolean }) =>
      toggleFavoriteAction(groupId, isFavorited),
    onSuccess: () => router.refresh(),
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Back + meta bar */}
      <div className="max-w-5xl mx-auto px-4 lg:px-8 flex items-center justify-between py-5">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-red-700 transition-colors"
        >
          <ArrowLeft size={16} />
          返回首頁
        </Link>

        {user?.id === group.creator_id && (
          <Link
            href={`/groups/${group.id}/edit`}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-red-700 transition-colors px-4 py-2 bg-white rounded-xl border border-slate-100 hover:border-red-100"
          >
            <Edit size={14} />
            編輯清單
          </Link>
        )}
      </div>

      {/* Dice Section — fills viewport minus header (4rem) and back bar (4rem) on desktop */}
      <div className="max-w-5xl mx-auto px-4 lg:px-8">
        <DiceSection
          selectedGroup={group}
          diceItems={diceItems}
          isLoading={false}
          user={user}
          className="lg:min-h-0 lg:h-[600px]"
        />
      </div>

      <div className="max-w-5xl mx-auto px-4 lg:px-8 pb-8 flex flex-col gap-10 mt-10">

        {/* Restaurant List */}
        <section>
          <div className="flex items-center gap-2 mb-6 px-1">
            <Utensils size={20} className="text-red-700" />
            <h2 className="font-black text-slate-900 text-xl">
              餐廳清單
            </h2>
            <span className="text-sm font-bold text-slate-400">
              ({group.restaurants.length} 間)
            </span>
          </div>

          {group.restaurants.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
              <p className="text-slate-400 font-bold">此清單目前還沒有餐廳</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {group.restaurants.map((r: any) => (
                <RestaurantCard
                  key={r.id}
                  restaurant={r}
                  onCreateOrder={user ? (id, name) => setOrderTarget({ id, name }) : undefined}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {orderTarget && (
        <CreateOrderModal
          restaurantId={orderTarget.id}
          restaurantName={orderTarget.name}
          groupId={group.id}
          isOpen={!!orderTarget}
          onClose={() => setOrderTarget(null)}
        />
      )}
    </div>
  );
}
