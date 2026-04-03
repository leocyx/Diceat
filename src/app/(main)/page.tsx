import { createClient } from "@/lib/supabase/server";
import { getMyGroups, getFavoritedGroups, getPublicGroups } from "@/services/api/groups";
import HomeClient from "@/components/layout/HomeClient";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Parallel data fetching on the server
  const [myGroups, favoriteGroups, publicGroups] = await Promise.all([
    user ? getMyGroups(supabase, user.id) : Promise.resolve([]),
    user ? getFavoritedGroups(supabase, user.id) : Promise.resolve([]),
    getPublicGroups(supabase),
  ]);

  return (
    <HomeClient
      user={user}
      initialMyGroups={myGroups}
      initialFavoriteGroups={favoriteGroups}
      initialPublicGroups={publicGroups}
    />
  );
}
