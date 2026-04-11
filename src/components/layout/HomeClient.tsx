"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toggleFavoriteAction } from "@/actions/groups";
import PublicGroupsSection from "@/components/layout/PublicGroupsSection";

interface HomeClientProps {
  user: any;
  initialPublicGroups: any[];
  initialFavoriteGroups: any[];
}

export default function HomeClient({
  user,
  initialPublicGroups,
  initialFavoriteGroups,
}: HomeClientProps) {
  const router = useRouter();

  const favoriteMutation = useMutation({
    mutationFn: ({ groupId, isFavorited }: { groupId: string; isFavorited: boolean }) =>
      toggleFavoriteAction(groupId, isFavorited),
    onSuccess: () => router.refresh(),
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <PublicGroupsSection
          initialGroups={initialPublicGroups}
          onSelectGroup={(group) => router.push(`/groups/${group.id}`)}
          favoriteGroupIds={new Set(initialFavoriteGroups.map((g) => g.id))}
          onToggleFavorite={(groupId, isFavorited) =>
            favoriteMutation.mutate({ groupId, isFavorited })
          }
          user={user}
        />
      </div>
    </div>
  );
}
