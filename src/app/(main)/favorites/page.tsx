import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFavoritedGroups } from "@/services/api/groups";
import FavoritesClient from "@/components/layout/FavoritesClient";

export default async function FavoritesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const favoriteGroups = await getFavoritedGroups(supabase, user.id);

  return <FavoritesClient user={user} initialGroups={favoriteGroups} />;
}
