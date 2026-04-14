"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Plus, Trash2, UtensilsCrossed } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createGroupOrderAction } from "@/actions/orders";

interface CreateOrderModalProps {
  restaurantId: string;
  restaurantName: string;
  groupId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  clientId: string;
  name: string;
  price: string;
}

function genId() {
  return Math.random().toString(36).slice(2);
}

export default function CreateOrderModal({
  restaurantId,
  restaurantName,
  groupId,
  isOpen,
  onClose,
}: CreateOrderModalProps) {
  const router = useRouter();
  const [items, setItems] = useState<MenuItem[]>([{ clientId: genId(), name: "", price: "" }]);

  const mutation = useMutation({
    mutationFn: (payload: Parameters<typeof createGroupOrderAction>[0]) =>
      createGroupOrderAction(payload),
    onSuccess: (data) => {
      router.push(`/orders/${data.id}`);
    },
  });

  const addItem = () => {
    setItems((prev) => [...prev, { clientId: genId(), name: "", price: "" }]);
  };

  const removeItem = (clientId: string) => {
    setItems((prev) => prev.filter((item) => item.clientId !== clientId));
  };

  const updateItem = (clientId: string, field: "name" | "price", value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.clientId === clientId ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = () => {
    const validItems = items.filter((item) => item.name.trim() !== "");
    if (validItems.length === 0) return;

    mutation.mutate({
      restaurantId,
      restaurantName,
      groupId,
      items: validItems.map((item) => ({
        name: item.name.trim(),
        price: Math.max(0, parseInt(item.price, 10) || 0),
      })),
    });
  };

  const canSubmit = items.some((item) => item.name.trim() !== "") && !mutation.isPending;

  const handleClose = () => {
    if (mutation.isPending) return;
    setItems([{ clientId: genId(), name: "", price: "" }]);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="建立揪團點餐">
      {/* Restaurant name */}
      <div className="flex items-center gap-2 mb-6 px-4 py-3 bg-red-50 rounded-2xl">
        <UtensilsCrossed size={16} className="text-red-700 shrink-0" />
        <span className="font-black text-red-800 text-sm">{restaurantName}</span>
      </div>

      {/* Items */}
      <div className="flex flex-col gap-3 mb-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">餐點清單</p>
        {items.map((item, idx) => (
          <div key={item.clientId} className="flex items-center gap-2">
            <Input
              placeholder={`餐點名稱（例：牛肉麵）`}
              value={item.name}
              onChange={(e) => updateItem(item.clientId, "name", e.target.value)}
              className="flex-1 text-sm"
            />
            <div className="relative">
              <Input
                type="number"
                placeholder="0"
                value={item.price}
                onChange={(e) => updateItem(item.clientId, "price", e.target.value)}
                className="w-24 text-sm pr-7"
                min={0}
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium pointer-events-none">
                元
              </span>
            </div>
            <button
              onClick={() => removeItem(item.clientId)}
              disabled={items.length === 1}
              className="p-2 text-slate-300 hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Add item */}
      <button
        onClick={addItem}
        className="flex items-center gap-1.5 text-sm font-bold text-red-700 hover:text-red-800 transition-colors mb-6"
      >
        <Plus size={16} />
        新增餐點
      </button>

      {/* Error */}
      {mutation.isError && (
        <p className="text-sm text-red-600 font-medium mb-4">
          建立失敗，請稍後再試
        </p>
      )}

      {/* Submit */}
      <Button
        className="w-full rounded-2xl"
        onClick={handleSubmit}
        disabled={!canSubmit}
        isLoading={mutation.isPending}
      >
        建立揪團
      </Button>
    </Modal>
  );
}
