import { SupabaseClient } from "@supabase/supabase-js";

export async function getOrderById(supabase: SupabaseClient, orderId: string) {
  const { data, error } = await supabase
    .from("group_orders")
    .select(`
      *,
      group_order_items (*),
      group_order_selections (
        *,
        profiles (username, avatar_url)
      )
    `)
    .eq("id", orderId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    ...data,
    items: data.group_order_items || [],
    selections: data.group_order_selections || [],
  };
}

export async function getMyOrders(supabase: SupabaseClient, userId: string) {
  const [createdResult, participatingResult] = await Promise.all([
    supabase
      .from("group_orders")
      .select(`
        *,
        group_order_items (id),
        group_order_selections (user_id)
      `)
      .eq("creator_id", userId)
      .order("created_at", { ascending: false }),

    supabase
      .from("group_order_selections")
      .select(`
        group_order_id,
        group_orders!inner (
          *,
          group_order_items (id),
          group_order_selections (user_id)
        )
      `)
      .eq("user_id", userId)
      .neq("group_orders.creator_id", userId),
  ]);

  if (createdResult.error) throw createdResult.error;
  if (participatingResult.error) throw participatingResult.error;

  const createdOrders = (createdResult.data || []).map((order) => ({
    ...order,
    itemCount: (order.group_order_items || []).length,
    participantCount: new Set((order.group_order_selections || []).map((s: any) => s.user_id)).size,
  }));

  // Deduplicate participating orders by order id
  const seen = new Set<string>();
  const participatingOrders = (participatingResult.data || [])
    .map((row: any) => row.group_orders)
    .filter((order: any) => {
      if (!order || seen.has(order.id)) return false;
      seen.add(order.id);
      return true;
    })
    .map((order: any) => ({
      ...order,
      itemCount: (order.group_order_items || []).length,
      participantCount: new Set((order.group_order_selections || []).map((s: any) => s.user_id)).size,
    }));

  return { createdOrders, participatingOrders };
}
