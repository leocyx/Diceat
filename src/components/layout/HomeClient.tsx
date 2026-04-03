"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteGroupAction, toggleFavoriteAction } from "@/actions/groups";
import PublicGroupsSection from "@/components/layout/PublicGroupsSection";
import MyGroupsSidebar from "@/components/layout/MyGroupsSidebar";
import DiceSection from "@/components/layout/DiceSection";

interface HomeClientProps {
  user: User | null;
  initialMyGroups: any[];
  initialFavoriteGroups: any[];
  initialPublicGroups: any[];
}

export default function HomeClient({
  user,
  initialMyGroups,
  initialFavoriteGroups,
  initialPublicGroups,
}: HomeClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedGroup, setSelectedGroup] = useState<any>(() => initialMyGroups[0] ?? null);

  const defaultRestaurants = useMemo(
    () => ["一蘭拉麵", "鼎泰豐", "海底撈", "壽司郎", "麥當勞", "星巴克"],
    [],
  );

  const diceSectionRef = useRef<HTMLDivElement>(null);

  // 手機版切換群組後 scroll 到骰子區塊
  useEffect(() => {
    if (selectedGroup && window.innerWidth < 1024 && diceSectionRef.current) {
      const headerHeight = document.getElementById("main-header")?.offsetHeight ?? 0;
      const top = diceSectionRef.current.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, [selectedGroup]);

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: deleteGroupAction,
    onSuccess: (_, deletedGroupId) => {
      if (selectedGroup?.id === deletedGroupId) {
        setSelectedGroup(null);
      }
      router.refresh();
    },
  });

  // Favorite Mutation
  const favoriteMutation = useMutation({
    mutationFn: ({
      groupId,
      isFavorited,
    }: {
      groupId: string;
      isFavorited: boolean;
    }) => toggleFavoriteAction(groupId, isFavorited),
    onSuccess: () => {
      router.refresh();
    },
  });

  const handleSelectGroup = (group: any) => {
    setSelectedGroup(group);
  };

  const handleDeleteGroup = async (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("確定要刪除這個美食清單嗎？")) return;
    deleteMutation.mutate(groupId);
  };

  const diceItems = useMemo(() => {
    return selectedGroup
      ? selectedGroup.restaurants.map((r: any) => r.name)
      : defaultRestaurants;
  }, [selectedGroup, defaultRestaurants]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-4 lg:p-8 gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-80 flex flex-col gap-6">
          <MyGroupsSidebar
            groups={initialMyGroups}
            favoriteGroups={initialFavoriteGroups}
            isLoading={false}
            selectedGroupId={selectedGroup?.id}
            onSelectGroup={handleSelectGroup}
            onDeleteGroup={handleDeleteGroup}
            onToggleFavorite={(groupId, isFav) =>
              favoriteMutation.mutate({ groupId, isFavorited: isFav })
            }
            user={user}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col gap-8">
          <div ref={diceSectionRef}>
          <DiceSection
            selectedGroup={selectedGroup}
            diceItems={diceItems}
            isLoading={false}
            user={user}
          />
          </div>

          {/* Public Groups Grid */}
          <PublicGroupsSection
            initialGroups={initialPublicGroups}
            onSelectGroup={handleSelectGroup}
            favoriteGroupIds={new Set(initialFavoriteGroups.map((g) => g.id))}
            onToggleFavorite={(groupId, isFav) =>
              favoriteMutation.mutate({ groupId, isFavorited: isFav })
            }
            user={user}
          />
        </main>
      </div>
    </div>
  );
}
