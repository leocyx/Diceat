"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  Copy,
  Lock,
  Minus,
  Plus,
  ShoppingBag,
  UtensilsCrossed,
  X,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { submitSelectionsAction, closeGroupOrderAction } from "@/actions/orders";

interface Item {
  id: string;
  name: string;
  price: number;
}

interface Selection {
  id: string;
  item_id: string;
  user_id: string;
  quantity: number;
  profiles: { username: string; avatar_url: string | null };
}

interface Order {
  id: string;
  restaurant_name: string;
  creator_id: string;
  status: "open" | "closed";
  created_at: string;
  items: Item[];
  selections: Selection[];
}

interface OrderDetailClientProps {
  order: Order;
  currentUserId: string | null;
}

export default function OrderDetailClient({ order, currentUserId }: OrderDetailClientProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const isClosed = order.status === "closed";
  const isCreator = currentUserId === order.creator_id;

  // Local quantity state, initialised from server data
  const mySelections = order.selections.filter((s) => s.user_id === currentUserId);
  const initialQty: Record<string, number> = {};
  mySelections.forEach((s) => {
    initialQty[s.item_id] = s.quantity;
  });
  const [quantities, setQuantities] = useState<Record<string, number>>(initialQty);
  const [submitted, setSubmitted] = useState(false);
  const [closedError, setClosedError] = useState(false);

  const isDirty = order.items.some(
    (item) => (quantities[item.id] ?? 0) !== (initialQty[item.id] ?? 0)
  );

  const submitMutation = useMutation({
    mutationFn: () =>
      submitSelectionsAction({
        groupOrderId: order.id,
        selections: order.items.map((item) => ({
          itemId: item.id,
          quantity: quantities[item.id] ?? 0,
        })),
      }),
    onSuccess: () => {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2000);
      router.refresh();
    },
    onError: (err: Error) => {
      if (err.message === "ORDER_CLOSED") {
        setClosedError(true);
        router.refresh();
      }
    },
  });

  const closeMutation = useMutation({
    mutationFn: () => closeGroupOrderAction(order.id),
    onSuccess: () => router.refresh(),
  });

  const handleQuantityChange = (itemId: string, delta: number) => {
    if (isClosed || !currentUserId) return;
    const current = quantities[itemId] ?? 0;
    const next = Math.max(0, current + delta);
    setQuantities((prev) => ({ ...prev, [itemId]: next }));
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Build participant summary
  const participantMap: Record<
    string,
    { username: string; items: Array<{ name: string; price: number; qty: number }>; subtotal: number }
  > = {};

  order.selections.forEach((sel) => {
    if (sel.quantity === 0) return;
    const item = order.items.find((i) => i.id === sel.item_id);
    if (!item) return;
    if (!participantMap[sel.user_id]) {
      participantMap[sel.user_id] = {
        username: sel.profiles?.username ?? "使用者",
        items: [],
        subtotal: 0,
      };
    }
    participantMap[sel.user_id].items.push({
      name: item.name,
      price: item.price,
      qty: sel.quantity,
    });
    participantMap[sel.user_id].subtotal += item.price * sel.quantity;
  });

  const participants = Object.values(participantMap);
  const grandTotal = participants.reduce((sum, p) => sum + p.subtotal, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Back bar */}
      <div className="max-w-2xl mx-auto px-4 lg:px-8 flex items-center justify-between py-5">
        <Link
          href="/orders"
          className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-red-700 transition-colors"
        >
          <ArrowLeft size={16} />
          我的揪團
        </Link>

        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-red-700 transition-colors px-4 py-2 bg-white rounded-xl border border-slate-100 hover:border-red-100"
        >
          {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
          {copied ? "已複製" : "複製連結"}
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 lg:px-8 pb-12">
        {/* Header card */}
        <div className="bg-white rounded-[2rem] border border-slate-100 p-6 mb-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center shrink-0">
                <UtensilsCrossed size={22} className="text-red-700" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 leading-tight">
                  {order.restaurant_name}
                </h1>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {new Date(order.created_at).toLocaleDateString("zh-TW", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <span
              className={`shrink-0 text-xs font-bold px-3 py-1 rounded-full ${
                isClosed
                  ? "bg-slate-100 text-slate-500"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {isClosed ? "已關閉" : "進行中"}
            </span>
          </div>
        </div>

        {/* Menu items */}
        <section className="mb-4">
          <div className="flex items-center gap-2 mb-4 px-1">
            <ShoppingBag size={18} className="text-red-700" />
            <h2 className="font-black text-slate-900 text-lg">點餐清單</h2>
            {isClosed && (
              <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                <Lock size={11} />
                已關閉
              </span>
            )}
          </div>

          <div className="flex flex-col gap-3 mb-5">
            {order.items.map((item) => {
              const qty = quantities[item.id] ?? 0;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-100 px-5 py-4 flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{item.name}</p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      NT${item.price}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleQuantityChange(item.id, -1)}
                      disabled={isClosed || qty === 0}
                      className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-red-300 hover:text-red-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center font-black text-slate-800 text-sm">
                      {qty}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.id, 1)}
                      disabled={isClosed}
                      className="w-8 h-8 rounded-full bg-red-700 text-white flex items-center justify-center hover:bg-red-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Closed error banner */}
          {closedError && (
            <div className="flex items-center gap-2 px-4 py-3 mb-3 bg-red-50 border border-red-100 rounded-2xl text-sm font-bold text-red-700">
              <Lock size={14} className="shrink-0" />
              揪團已被關閉，無法送出點餐
            </div>
          )}

          {/* Submit button */}
          {!isClosed && currentUserId && (
            <Button
              className="w-full rounded-2xl"
              onClick={() => submitMutation.mutate()}
              isLoading={submitMutation.isPending}
              disabled={submitMutation.isPending || !isDirty}
            >
              {submitted ? (
                <>
                  <Check size={15} className="mr-1.5" />
                  已送出
                </>
              ) : (
                "送出點餐"
              )}
            </Button>
          )}
        </section>

        {/* Close order button (creator only, open only) */}
        {isCreator && !isClosed && (
          <div className="mb-8">
            <Button
              variant="outline"
              className="w-full rounded-2xl border-slate-200 text-slate-500 hover:border-red-200 hover:text-red-600"
              onClick={() => closeMutation.mutate()}
              isLoading={closeMutation.isPending}
            >
              <X size={15} className="mr-1.5" />
              關閉揪團
            </Button>
          </div>
        )}

        {/* Participants summary */}
        {participants.length > 0 && (
          <section>
            <h2 className="font-black text-slate-900 text-lg mb-4 px-1">點餐總覽</h2>

            <div className="flex flex-col gap-4">
              {participants.map((p, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
                >
                  <div className="px-5 py-3 border-b border-slate-50 flex items-center justify-between">
                    <span className="font-black text-slate-800 text-sm">{p.username}</span>
                    <span className="text-xs font-bold text-red-700">
                      小計 NT${p.subtotal}
                    </span>
                  </div>
                  <div className="px-5 py-3 flex flex-col gap-2">
                    {p.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">
                          {item.name} × {item.qty}
                        </span>
                        <span className="text-slate-400 font-medium">
                          NT${item.price * item.qty}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Grand total */}
              <div className="bg-red-700 rounded-2xl px-5 py-4 flex items-center justify-between">
                <span className="font-black text-white">總計</span>
                <span className="font-black text-white text-lg">NT${grandTotal}</span>
              </div>
            </div>
          </section>
        )}

        {participants.length === 0 && (
          <div className="py-12 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
            <ShoppingBag size={28} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-bold text-sm">還沒有人點餐</p>
            <p className="text-slate-300 text-xs mt-1">複製連結分享給朋友吧</p>
          </div>
        )}
      </div>
    </div>
  );
}
