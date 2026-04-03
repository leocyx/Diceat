import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CreateGroupClient from "@/components/groups/CreateGroupClient";

export default async function CreateGroupPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <CreateGroupClient />;
}
