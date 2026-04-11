import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGroupById } from "@/services/api/groups";
import GroupDetailClient from "@/components/groups/GroupDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function GroupDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  try {
    const group = await getGroupById(supabase, id);

    // 私人群組只有創建者可以看
    if (!group.is_public && group.creator_id !== user?.id) {
      notFound();
    }

    return <GroupDetailClient group={group} user={user} />;
  } catch {
    notFound();
  }
}
