import { createClient } from "@/lib/supabase/server";
import { getPublicGroups, getFavoritedGroups } from "@/services/api/groups";
import HomeClient from "@/components/layout/HomeClient";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [publicGroups, favoriteGroups] = await Promise.all([
    getPublicGroups(supabase),
    user ? getFavoritedGroups(supabase, user.id) : Promise.resolve([]),
  ]);

  return (
    <HomeClient
      user={user}
      initialPublicGroups={publicGroups}
      initialFavoriteGroups={favoriteGroups}
    />
  );
}
