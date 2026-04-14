"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import OrderCard from "@/components/orders/OrderCard";

interface MyOrdersClientProps {
  createdOrders: any[];
  participatingOrders: any[];
  currentUserId: string;
}

export default function MyOrdersClient({
  createdOrders,
  participatingOrders,
  currentUserId,
}: MyOrdersClientProps) {
  const hasAny = createdOrders.length > 0 || participatingOrders.length > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8 flex flex-col gap-10">
        {/* Header */}
        <div className="px-2">
          <h1 className="font-black text-2xl text-slate-900 flex items-center gap-2">
            <ShoppingBag size={24} className="text-red-700" />
            揪團點餐
          </h1>
          <p className="text-xs text-slate-400 font-bold mt-1">
            管理你建立或參與的揪團訂單
          </p>
        </div>

        {!hasAny && (
          <div className="py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
            <ShoppingBag size={36} className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold mb-2">還沒有揪團記錄</p>
            <p className="text-slate-300 text-sm">
              前往{" "}
              <Link href="/" className="text-red-700 font-bold hover:underline">
                餐廳清單
              </Link>{" "}
              點擊「揪團點餐」建立第一個訂單
            </p>
          </div>
        )}

        {/* Created orders */}
        {createdOrders.length > 0 && (
          <section>
            <h2 className="font-black text-slate-700 text-sm uppercase tracking-widest mb-4 px-1">
              我建立的揪團
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {createdOrders.map((order, idx) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  isOwner={true}
                  index={idx}
                />
              ))}
            </div>
          </section>
        )}

        {/* Participating orders */}
        {participatingOrders.length > 0 && (
          <section>
            <h2 className="font-black text-slate-700 text-sm uppercase tracking-widest mb-4 px-1">
              我參與的揪團
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {participatingOrders.map((order, idx) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  isOwner={order.creator_id === currentUserId}
                  index={idx}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
