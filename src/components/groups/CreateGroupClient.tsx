"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Map as MapIcon } from "lucide-react";
import RestaurantSearch, {
  Restaurant,
} from "@/components/map/RestaurantSearch";
import { createGroupAction } from "@/actions/groups";
import GroupSettingsForm from "@/components/groups/GroupSettingsForm";
import GroupRestaurantsList from "@/components/groups/GroupRestaurantsList";

export default function CreateGroupClient() {
  const router = useRouter();

  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublic, setIsPublic] = useState(false);

  const addRestaurant = (res: Restaurant) => {
    if (restaurants.find((r) => r.id === res.id)) return;
    setRestaurants((prev) => [...prev, res]);
  };

  const removeRestaurant = (id: string) => {
    setRestaurants((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSave = async () => {
    if (!groupName) return alert("請輸入群組名稱");
    if (restaurants.length === 0) return alert("請至少加入一家餐廳");

    setIsSaving(true);
    try {
      const result = await createGroupAction({
        name: groupName,
        description: description,
        is_public: isPublic,
        restaurants: restaurants,
      });

      if (result.success) {
        router.push("/");
        router.refresh();
      }
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
            建立新群組
          </h1>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-red-700 text-white px-8 py-3 rounded-2xl font-black hover:bg-red-800 disabled:opacity-50 transition-all shadow-lg shadow-red-100 cursor-pointer"
          >
            {isSaving ? (
              "儲存中..."
            ) : (
              <>
                <Save size={20} />
                儲存群組
              </>
            )}
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left: Settings & Map */}
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
                <h2 className="font-bold">在地圖上尋找餐廳</h2>
              </div>
              <div className="flex-1">
                <RestaurantSearch onAddRestaurant={addRestaurant} />
              </div>
            </section>
          </div>

          {/* Right: Selection List */}
          <div className="lg:col-span-4">
            <GroupRestaurantsList
              restaurants={restaurants}
              onRemoveRestaurant={removeRestaurant}
              onClearAll={() => setRestaurants([])}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
