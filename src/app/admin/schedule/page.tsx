"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2, Clock } from "lucide-react";

export default function AdminSchedulePage() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSchedules(); }, []);

  const fetchSchedules = async () => {
    const { data } = await supabase.from("schedules").select("*").order("time_start", { ascending: true });
    if (data) setSchedules(data);
    setLoading(false);
  };

  const addRow = () => {
    setSchedules([...schedules, { time_start: "00:00", title: "", description: "" }]);
  };

  const deleteRow = async (id: string, index: number) => {
    if (id) await supabase.from("schedules").delete().eq("id", id);
    const newSched = [...schedules];
    newSched.splice(index, 1);
    setSchedules(newSched);
  };

  const handleSave = async () => {
    for (const item of schedules) {
      await supabase.from("schedules").upsert({
        id: item.id || undefined,
        time_start: item.time_start,
        title: item.title,
        description: item.description,
      });
    }
    alert("スケジュールを更新しました！");
    fetchSchedules();
  };

  if (loading) return <div className="p-10 text-center">読み込み中...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white p-6 flex items-center justify-between border-b sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/admin")} className="p-2 bg-slate-100 rounded-full"><ArrowLeft size={20} /></button>
          <h1 className="text-xl font-black text-slate-800">編集：タイムライン</h1>
        </div>
        <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-100 active:scale-95 transition-all">
          <Save size={16} /> 保存する
        </button>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4 mt-4">
        {schedules.map((item, idx) => (
          <div key={idx} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-3 relative">
            <button onClick={() => deleteRow(item.id, idx)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-blue-500" />
              <input 
                type="text" 
                value={item.time_start} 
                onChange={(e) => { const n = [...schedules]; n[idx].time_start = e.target.value; setSchedules(n); }}
                className="font-black text-blue-600 w-20 outline-none"
              />
            </div>
            <input 
              type="text" 
              placeholder="タイトル（例：乾杯）"
              value={item.title} 
              onChange={(e) => { const n = [...schedules]; n[idx].title = e.target.value; setSchedules(n); }}
              className="w-full font-bold text-slate-700 text-lg outline-none border-b border-transparent focus:border-slate-100"
            />
            <input 
              type="text" 
              placeholder="詳細（例：飲みすぎ注意）"
              value={item.description} 
              onChange={(e) => { const n = [...schedules]; n[idx].description = e.target.value; setSchedules(n); }}
              className="w-full text-xs text-slate-400 outline-none"
            />
          </div>
        ))}
        <button onClick={addRow} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-all">
          <Plus size={18} /> 項目を追加
        </button>
      </div>
    </div>
  );
}