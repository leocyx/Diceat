"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Save, Map as MapIcon, Loader2 } from "lucide-react";
import RestaurantSearch, {
  Restaurant,
} from "@/components/map/RestaurantSearch";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { getGroupById } from "@/services/api/groups";
import GroupSettingsForm from "@/components/groups/GroupSettingsForm";
import GroupRestaurantsList from "@/components/groups/GroupRestaurantsList";

export default function EditGroupPage() {
  const router = useRouter();
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();

  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/");
      return;
    }

    async function loadGroup() {
      try {
        const group = await getGroupById(id as string);

        // Security check: Only creator can edit
        if (!user || group.creator_id !== user.id) {
            alert("您沒有權限編輯此群組");
            router.push("/");
            return;
        }
        setGroupName(group.name);
        setDescription(group.description || "");
        setIsPublic(group.is_public);
        setRestaurants(
          group.restaurants.map((r: any) => ({
            id: r.google_place_id,
            name: r.name,
            address: r.address,
            rating: r.rating,
            photoUrl: r.photo_url,
            lat: r.coordinate?.lat || 0,
            lng: r.coordinate?.lng || 0,
          })),
        );
      } catch (err) {
        console.error(err);
        alert("載入群組失敗");
      } finally {
        setPageLoading(false);
      }
    }

    loadGroup();
  }, [id, user, authLoading, router]);

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
    if (!user) return;

    setIsSaving(true);
    try {
      // 1. Update Group Info
      const { error: groupError } = await supabase
        .from("groups")
        .update({
          name: groupName,
          description: description,
          is_public: isPublic,
        })
        .eq("id", id);

      if (groupError) throw groupError;

      // 2. Batch Upsert all restaurants and get their internal IDs
      const restaurantsToUpsert = restaurants.map((res) => ({
        google_place_id: res.id,
        name: res.name,
        address: res.address,
        rating: res.rating,
        photo_url: res.photoUrl,
        coordinate: { lat: res.lat, lng: res.lng },
      }));

      const { data: upsertedRestaurants, error: resError } = await supabase
        .from("restaurants")
        .upsert(restaurantsToUpsert, { onConflict: "google_place_id" })
        .select("id");

      if (resError) throw resError;

      // 3. Diff-based update：先 insert 新的、再 delete 不要的
      // 避免先 delete 再 insert 失敗時留下空 group
      const { data: currentRelations, error: fetchRelError } = await supabase
        .from("group_restaurants")
        .select("restaurant_id")
        .eq("group_id", id);

      if (fetchRelError) throw fetchRelError;

      const currentIds = new Set(
        (currentRelations ?? []).map((r) => r.restaurant_id),
      );
      const newIds = new Set(upsertedRestaurants.map((r) => r.id));

      const toAdd = [...newIds].filter((rid) => !currentIds.has(rid));
      const toRemove = [...currentIds].filter((rid) => !newIds.has(rid));

      if (toAdd.length > 0) {
        const { error: insertError } = await supabase
          .from("group_restaurants")
          .insert(
            toAdd.map((rid) => ({ group_id: id, restaurant_id: rid })),
          );
        if (insertError) throw insertError;
      }

      if (toRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from("group_restaurants")
          .delete()
          .eq("group_id", id)
          .in("restaurant_id", toRemove);
        if (deleteError) throw deleteError;
      }

      router.push("/");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      alert("儲存失敗: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-slate-400 font-bold">正在載入群組資料...</p>
        </div>
      </div>
    );
  }

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
            className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-100 cursor-pointer"
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
              <div className="flex items-center gap-2 mb-4 text-indigo-600">
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
