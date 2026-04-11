import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGroupById } from "@/services/api/groups";
import EditGroupClient from "@/components/groups/EditGroupClient";
import MapsProvider from "@/components/map/MapsProvider";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditGroupPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  try {
    const group = await getGroupById(supabase, id);

    // Security check: Only creator can edit
    if (group.creator_id !== user.id) {
      redirect("/");
    }

    return (
      <MapsProvider>
        <EditGroupClient
          groupId={id}
          initialData={{
            name: group.name,
            description: group.description,
            is_public: group.is_public,
            restaurants: group.restaurants
          }}
        />
      </MapsProvider>
    );
  } catch (err) {
    console.error(err);
    redirect("/");
  }
}
