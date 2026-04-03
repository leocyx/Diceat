"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Map as MapIcon } from "lucide-react";
import RestaurantSearch, {
  Restaurant,
} from "@/components/map/RestaurantSearch";
import { updateGroupAction } from "@/actions/groups";
import GroupSettingsForm from "@/components/groups/GroupSettingsForm";
import GroupRestaurantsList from "@/components/groups/GroupRestaurantsList";

interface EditGroupClientProps {
  groupId: string;
  initialData: {
    name: string;
    description: string;
    is_public: boolean;
    restaurants: any[];
  };
}

export default function EditGroupClient({
  groupId,
  initialData,
}: EditGroupClientProps) {
  const router = useRouter();

  const [groupName, setGroupName] = useState(initialData.name);
  const [description, setDescription] = useState(initialData.description || "");
  const [restaurants, setRestaurants] = useState<Restaurant[]>(
    initialData.restaurants.map((r: any) => ({
      id: r.google_place_id,
      name: r.name,
      address: r.address,
      rating: r.rating,
      photoUrl: r.photo_url,
      lat: r.coordinate?.lat || 0,
      lng: r.coordinate?.lng || 0,
    })),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isPublic, setIsPublic] = useState(initialData.is_public);

  const addRestaurant = (res: Restaurant) => {
    if (restaurants.find((r) => r.id === res.id)) return;
    setRestaurants((prev) => [...prev, res]);
  };

  const removeRestaurant = (id: string) => {
    setRestaurants((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUpdate = async () => {
    if (!groupName) return alert("請輸入群組名稱");
    if (restaurants.length === 0) return alert("請至少保留一家餐廳");

    setIsSaving(true);
    try {
      await updateGroupAction(groupId, {
        name: groupName,
        description: description,
        is_public: isPublic,
        restaurants: restaurants,
      });

      router.push("/");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      alert("儲存失敗: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-8">
        {/* Page Title & Action Bar */}
        <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight pl-2">
            編輯群組
          </h1>
          <button
            onClick={handleUpdate}
            disabled={isSaving}
            className="flex items-center gap-2 bg-red-700 text-white px-8 py-3 rounded-2xl font-black hover:bg-red-800 disabled:opacity-50 transition-all shadow-lg shadow-red-100 cursor-pointer"
          >
            {isSaving ? (
              "儲存中..."
            ) : (
              <>
                <Save size={20} />
                儲存修改
              </>
            )}
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <GroupSettingsForm
              name={groupName}
              setName={setGroupName}
              description={description}
              setDescription={setDescription}
              isPublic={isPublic}
              setIsPublic={setIsPublic}
            />

            <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex-1 flex flex-col min-h-[500px]">
              <div className="flex items-center gap-2 mb-4 text-red-700">
                <MapIcon size={20} />
                <h2 className="font-bold">在地圖上新增更多餐廳</h2>
              </div>
              <div className="flex-1">
                <RestaurantSearch onAddRestaurant={addRestaurant} />
              </div>
            </section>
          </div>

          <div className="lg:col-span-4">
            <GroupRestaurantsList
              restaurants={restaurants}
              onRemoveRestaurant={removeRestaurant}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
