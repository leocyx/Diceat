import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CreateGroupClient from "@/components/groups/CreateGroupClient";
import MapsProvider from "@/components/map/MapsProvider";

export default async function CreateGroupPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <MapsProvider>
      <CreateGroupClient />
    </MapsProvider>
  );
}
