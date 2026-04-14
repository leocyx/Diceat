'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createGroupOrderAction(payload: {
  restaurantId: string
  restaurantName: string
  groupId: string
  items: Array<{ name: string; price: number }>
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: order, error: orderError } = await supabase
    .from('group_orders')
    .insert({
      restaurant_id: payload.restaurantId,
      restaurant_name: payload.restaurantName,
      group_id: payload.groupId,
      creator_id: user.id,
    })
    .select('id')
    .single()

  if (orderError) throw new Error(orderError.message)

  const itemsToInsert = payload.items.map((item) => ({
    group_order_id: order.id,
    name: item.name,
    price: item.price,
  }))

  const { error: itemsError } = await supabase
    .from('group_order_items')
    .insert(itemsToInsert)

  if (itemsError) throw new Error(itemsError.message)

  revalidatePath('/orders')
  return { success: true, id: order.id }
}

export async function upsertSelectionAction(payload: {
  groupOrderId: string
  itemId: string
  quantity: number
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  if (payload.quantity === 0) {
    const { error } = await supabase
      .from('group_order_selections')
      .delete()
      .eq('item_id', payload.itemId)
      .eq('user_id', user.id)

    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase
      .from('group_order_selections')
      .upsert(
        {
          group_order_id: payload.groupOrderId,
          item_id: payload.itemId,
          user_id: user.id,
          quantity: payload.quantity,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'item_id,user_id' }
      )

    if (error) throw new Error(error.message)
  }

  revalidatePath(`/orders/${payload.groupOrderId}`)
  return { success: true }
}

export async function closeGroupOrderAction(orderId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('group_orders')
    .update({ status: 'closed' })
    .eq('id', orderId)
    .eq('creator_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath(`/orders/${orderId}`)
  revalidatePath('/orders')
  return { success: true }
}

export async function deleteGroupOrderAction(orderId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('group_orders')
    .delete()
    .eq('id', orderId)
    .eq('creator_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/orders')
  return { success: true }
}
