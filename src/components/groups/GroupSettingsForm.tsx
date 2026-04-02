"use client";

import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";

interface GroupSettingsFormProps {
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  isPublic: boolean;
  setIsPublic: (isPublic: boolean) => void;
}

export default function GroupSettingsForm({
  name,
  setName,
  description,
  setDescription,
  isPublic,
  setIsPublic,
}: GroupSettingsFormProps) {
  return (
    <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
      <div className="grid gap-6">
        <div className="space-y-2">
          <Label htmlFor="groupName" className="text-slate-700 font-bold">群組名稱</Label>
          <Input 
            id="groupName" 
            type="text" 
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="例如：信義區必吃火鍋"
            className="rounded-2xl border-slate-200 mt-2"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description" className="text-slate-700 font-bold">描述 (選填)</Label>
          <textarea 
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="簡單介紹一下這個群組吧..."
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none h-24 resize-none mt-2 text-sm"
          />
        </div>
        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <input 
            type="checkbox" 
            id="isPublic"
            checked={isPublic}
            onChange={e => setIsPublic(e.target.checked)}
            className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <div className="flex flex-col">
            <Label htmlFor="isPublic" className="text-sm font-bold text-slate-700 cursor-pointer">
              公開此群組
            </Label>
            <p className="text-[10px] text-slate-400">讓其他人也能在熱門公開地圖中搜尋到此清單</p>
          </div>
        </div>
      </div>
    </section>
  );
}
