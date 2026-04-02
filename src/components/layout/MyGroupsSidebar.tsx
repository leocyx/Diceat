"use client";

import MyCreatedGroups from "./MyCreatedGroups";
import FavoritedGroups from "./FavoritedGroups";

interface MyGroupsSidebarProps {
  groups: any[];
  favoriteGroups?: any[];
  isLoading: boolean;
  selectedGroupId: string | null;
  onSelectGroup: (group: any) => void;
  onDeleteGroup: (groupId: string, e: React.MouseEvent) => void;
  onToggleFavorite?: (groupId: string, isFavorited: boolean) => void;
  user: any;
}

export default function MyGroupsSidebar({
  groups,
  favoriteGroups = [],
  isLoading,
  selectedGroupId,
  onSelectGroup,
  onDeleteGroup,
  onToggleFavorite,
  user,
}: MyGroupsSidebarProps) {
  return (
    <div className="flex flex-col gap-6">
      <MyCreatedGroups
        groups={groups}
        isLoading={isLoading}
        selectedGroupId={selectedGroupId}
        onSelectGroup={onSelectGroup}
        onDeleteGroup={onDeleteGroup}
        user={user}
      />

      <FavoritedGroups
        favoriteGroups={favoriteGroups}
        isLoading={isLoading}
        selectedGroupId={selectedGroupId}
        onSelectGroup={onSelectGroup}
        onToggleFavorite={onToggleFavorite || (() => {})}
        user={user}
      />
    </div>
  );
}
