import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrderById } from "@/services/api/orders";
import OrderDetailClient from "@/components/orders/OrderDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  try {
    const order = await getOrderById(supabase, id);
    if (!order) notFound();
    return <OrderDetailClient order={order} currentUserId={user?.id ?? null} />;
  } catch {
    notFound();
  }
}
