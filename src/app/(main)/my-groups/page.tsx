import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyGroups } from "@/services/api/groups";
import MyGroupsClient from "@/components/layout/MyGroupsClient";

export default async function MyGroupsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const myGroups = await getMyGroups(supabase, user.id);

  return <MyGroupsClient user={user} initialGroups={myGroups} />;
}
