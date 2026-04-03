import { SupabaseClient } from "@supabase/supabase-js";

export async function getMyGroups(supabase: SupabaseClient, userId: string) {
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
  
  return (data || []).map((group) => ({
    ...group,
    restaurants: (group.group_restaurants || []).map((gr: any) => gr.restaurants),
  }));
}

export async function getPublicGroups(supabase: SupabaseClient) {
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

  if (error) throw error;

  return (data || []).map((group) => ({
    ...group,
    restaurants: (group.group_restaurants || []).map((gr: any) => gr.restaurants),
  }));
}

export async function getGroupById(supabase: SupabaseClient, groupId: string) {
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
    restaurants: (data.group_restaurants || []).map((gr: any) => gr.restaurants),
  };
}

export async function getFavoritedGroups(supabase: SupabaseClient, userId: string) {
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

