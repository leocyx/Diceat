'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteGroupAction(groupId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('groups')
    .delete()
    .eq('id', groupId)
    .eq('creator_id', user.id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/')
  return { success: true }
}

export async function toggleFavoriteAction(groupId: string, isFavorited: boolean) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  if (isFavorited) {
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('group_id', groupId)
    
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase
      .from('user_favorites')
      .insert([{ user_id: user.id, group_id: groupId }])
    
    if (error) throw new Error(error.message)
  }

  revalidatePath('/')
  return { success: true }
}

export async function updateGroupAction(groupId: string, payload: {
  name: string;
  description: string;
  is_public: boolean;
  restaurants: any[];
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // 1. Update Group Info
  const { error: groupError } = await supabase
    .from("groups")
    .update({
      name: payload.name,
      description: payload.description,
      is_public: payload.is_public,
    })
    .eq("id", groupId)
    .eq("creator_id", user.id);

  if (groupError) throw groupError;

  // 2. Batch Upsert all restaurants and get their internal IDs
  const restaurantsToUpsert = payload.restaurants.map((res) => ({
    google_place_id: res.id,
    name: res.name,
    address: res.address,
    rating: res.rating,
    photo_url: res.photoUrl,
    coordinate: { lat: res.lat, lng: res.lng },
  }));

  const { data: upsertedRestaurants, error: resError } = await supabase
    .from("restaurants")
    .upsert(restaurantsToUpsert, { onConflict: "google_place_id" })
    .select("id");

  if (resError) throw resError;

  // 3. Delete old relations and Batch Insert new ones
  const { error: deleteRelError } = await supabase.from("group_restaurants").delete().eq("group_id", groupId);
  if (deleteRelError) throw deleteRelError;

  const relationsToInsert = (upsertedRestaurants || []).map((r) => ({
    group_id: groupId,
    restaurant_id: r.id,
  }));

  const { error: relError } = await supabase
    .from("group_restaurants")
    .insert(relationsToInsert);

  if (relError) throw relError;

  revalidatePath('/')
  revalidatePath(`/groups/${groupId}/edit`)
  return { success: true }
}

export async function createGroupAction(payload: {
  name: string;
  description: string;
  is_public: boolean;
  restaurants: any[];
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // 1. Insert Group
  const { data: groupData, error: groupError } = await supabase
    .from("groups")
    .insert({
      name: payload.name,
      description: payload.description,
      is_public: payload.is_public,
      creator_id: user.id
    })
    .select("id")
    .single();

  if (groupError) throw groupError;

  const groupId = groupData.id;

  // 2. Batch Upsert restaurants
  const restaurantsToUpsert = payload.restaurants.map((res) => ({
    google_place_id: res.id,
    name: res.name,
    address: res.address,
    rating: res.rating,
    photo_url: res.photoUrl,
    coordinate: { lat: res.lat, lng: res.lng },
  }));

  const { data: upsertedRestaurants, error: resError } = await supabase
    .from("restaurants")
    .upsert(restaurantsToUpsert, { onConflict: "google_place_id" })
    .select("id");

  if (resError) throw resError;

  // 3. Batch Insert relations
  const relationsToInsert = (upsertedRestaurants || []).map((r) => ({
    group_id: groupId,
    restaurant_id: r.id,
  }));

  const { error: relError } = await supabase
    .from("group_restaurants")
    .insert(relationsToInsert);

  if (relError) throw relError;

  revalidatePath('/')
  return { success: true, id: groupId }
}
