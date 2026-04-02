import { supabase } from "@/lib/supabase";

export async function getMyGroups(userId: string) {
  const { data, error } = await supabase
    .from("groups")
    .select(
      `
      *,
      group_restaurants (
        restaurants (*)
      )
    `,
    )
    .eq("creator_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  
  // Format the data
  return data.map((group) => ({
    ...group,
    restaurants: group.group_restaurants.map((gr: any) => gr.restaurants),
  }));
}

export async function getPublicGroups() {
  const { data, error } = await supabase
    .from("groups")
    .select(
      `
      *,
      profiles (username, avatar_url),
      group_restaurants (
        restaurants (*)
      )
    `,
    )
    .eq("is_public", true)
    .limit(12)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []).map((group) => ({
    ...group,
    restaurants: (group.group_restaurants || []).map(
      (gr: any) => gr.restaurants,
    ),
  }));
}

export async function getGroupById(groupId: string) {
  const { data, error } = await supabase
    .from("groups")
    .select(
      `
      *,
      group_restaurants (
        restaurants (*)
      )
    `,
    )
    .eq("id", groupId)
    .single();

  if (error) throw error;

  return {
    ...data,
    restaurants: data.group_restaurants.map((gr: any) => gr.restaurants),
  };
}

export async function deleteGroup(groupId: string) {
  const { error } = await supabase.from("groups").delete().eq("id", groupId);

  if (error) throw error;
}

// Favorite related functions
export async function toggleFavorite(userId: string, groupId: string, isFavorited: boolean) {
  if (isFavorited) {
    const { error } = await supabase
      .from("user_favorites")
      .delete()
      .eq("user_id", userId)
      .eq("group_id", groupId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("user_favorites")
      .insert([{ user_id: userId, group_id: groupId }]);
    if (error) throw error;
  }
}

export async function getFavoritedGroups(userId: string) {
  const { data, error } = await supabase
    .from("user_favorites")
    .select(`
      groups (
        *,
        profiles (username, avatar_url),
        group_restaurants (
          restaurants (*)
        )
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((item: any) => {
    const group = item.groups;
    if (!group) return null;
    return {
      ...group,
      restaurants: (group.group_restaurants || []).map((gr: any) => gr.restaurants),
      is_favorite: true
    };
  }).filter(Boolean);
}
