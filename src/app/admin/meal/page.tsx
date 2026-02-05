"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ArrowLeft, Beer, Pizza, AlertTriangle, User } from "lucide-react";

export default function AdminMealPage() {
  const router = useRouter();
  const [prefs, setPrefs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data } = await supabase
      .from("meal_preferences")
      .select(`
        *,
        members ( name )
      `)
      .order('updated_at', { ascending: false });
    
    if (data) setPrefs(data);
    setLoading(false);
  };

  if (loading) return <div className="p-10 text-center">読み込み中...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white p-6 flex items-center gap-4 border-b">
        <button onClick={() => router.push("/admin")} className="p-2 bg-gray-100 rounded-full"><ArrowLeft size={20} /></button>
        <h1 className="text-xl font-bold">食事・飲み物 要望一覧</h1>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {prefs.length === 0 ? (
          <p className="text-center text-gray-400 py-10">まだ回答がありません</p>
        ) : (
          prefs.map((p) => (
            <div key={p.user_id} className="bg-white p-6 rounded-2xl shadow-sm border space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <div className="flex items-center gap-2 font-bold text-lg text-blue-600">
                  <User size={18} /> {p.members?.name || "不明なユーザー"}
                </div>
                <span className="text-[10px] text-gray-400">
                  更新: {new Date(p.updated_at).toLocaleString('ja-JP')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-400 flex items-center gap-1"><Beer size={14} /> 飲み物 ({p.drink_type === 'alcohol' ? 'お酒' : 'ソフトのみ'})</p>
                  <p className="text-gray-700">
                    {[...(p.favorite_alcohols || []), ...(p.favorite_soft_drinks || [])].join(", ") || "未選択"}
                    {p.alcohol_amount && ` (${p.alcohol_amount})`}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-400 flex items-center gap-1"><Pizza size={14} /> 食べたいもの</p>
                  <p className="text-gray-700">{p.food_categories?.join(", ") || "未選択"}</p>
                  {p.food_request && <p className="bg-yellow-50 p-2 rounded text-xs mt-1 italic">「{p.food_request}」</p>}
                </div>
              </div>

              {p.has_allergy && (
                <div className="bg-red-50 p-3 rounded-xl flex items-start gap-2 border border-red-100">
                  <AlertTriangle className="text-red-500 shrink-0" size={16} />
                  <div>
                    <p className="text-xs font-bold text-red-600">アレルギーあり</p>
                    <p className="text-sm text-red-700">{p.allergy_details}</p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}