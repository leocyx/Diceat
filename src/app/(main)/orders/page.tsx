import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyOrders } from "@/services/api/orders";
import MyOrdersClient from "@/components/orders/MyOrdersClient";

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { createdOrders, participatingOrders } = await getMyOrders(supabase, user.id);

  return (
    <MyOrdersClient
      createdOrders={createdOrders}
      participatingOrders={participatingOrders}
      currentUserId={user.id}
    />
  );
}
