"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ShoppingCart, ArrowLeft, Beer, Coffee, Pizza, AlertTriangle, Users, CheckCircle } from "lucide-react";

export default function AdminMealPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchMealPrefs();
  }, []);

  const fetchMealPrefs = async () => {
    const { data: prefs, error } = await supabase
      .from("meal_preferences")
      .select(`
        *,
        members:user_id ( name, first_name )
      `);
    
    if (!error) setData(prefs || []);
    setLoading(false);
  };

  // 集計ロジック：配列の中身をカウントする関数
  const countItems = (key: string) => {
    const counts: { [key: string]: number } = {};
    data.forEach(item => {
      const array = item[key];
      if (Array.isArray(array)) {
        array.forEach(val => {
          counts[val] = (counts[val] || 0) + 1;
        });
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  };

  const alcoholStats = countItems("favorite_alcohols");
  const softDrinkStats = countItems("favorite_soft_drinks");
  const foodStats = countItems("food_categories");
  const alcoholCount = data.filter(d => d.drink_type === 'alcohol').length;
  const softCount = data.filter(d => d.drink_type === 'soft').length;
  const allergyList = data.filter(d => d.has_allergy);

  if (loading) return <div className="p-10 text-center">集計中...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* ヘッダー */}
      <div className="sticky top-0 z-10 bg-white shadow-sm p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/")} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <ShoppingCart className="text-blue-600" /> 買い出し集計リスト
          </h1>
        </div>
        <div className="bg-blue-100 px-4 py-1 rounded-full text-blue-700 text-sm font-bold">
          回答数: {data.length}名
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8 space-y-8">
        
        {/* 1. クイックサマリー（飲み物比率） */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 text-orange-500 mb-2 font-bold">
              <Beer size={20} /> お酒を飲む
            </div>
            <div className="text-4xl font-black text-slate-800">{alcoholCount}<span className="text-sm ml-1">名</span></div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 text-blue-500 mb-2 font-bold">
              <Coffee size={20} /> ソフトのみ
            </div>
            <div className="text-4xl font-black text-slate-800">{softCount}<span className="text-sm ml-1">名</span></div>
          </div>
        </section>

        {/* 2. アレルギー・要注意リスト */}
        {allergyList.length > 0 && (
          <section className="bg-red-50 p-6 rounded-3xl border-2 border-red-100 space-y-4">
            <h2 className="flex items-center gap-2 font-bold text-red-700">
              <AlertTriangle /> アレルギー確認が必要な人（{allergyList.length}名）
            </h2>
            <div className="space-y-2">
              {allergyList.map(item => (
                <div key={item.user_id} className="bg-white p-3 rounded-xl shadow-sm flex justify-between">
                  <span className="font-bold text-slate-700">{item.members?.name}さん</span>
                  <span className="text-red-600 text-sm font-medium">{item.allergy_details}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* 3. お酒の詳細集計 */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
            <h2 className="font-bold text-slate-800 border-b pb-2">🍺 お酒の人気ランキング</h2>
            {alcoholStats.map(([name, count]) => (
              <div key={name} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{name}</span>
                <div className="flex items-center gap-2 flex-1 justify-end">
                  <div className="h-2 bg-orange-100 rounded-full flex-1 max-w-[100px] overflow-hidden">
                    <div className="h-full bg-orange-500" style={{ width: `${(count / alcoholCount) * 100}%` }}></div>
                  </div>
                  <span className="font-bold text-slate-800 w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </section>

          {/* 4. ソフトドリンクの詳細集計 */}
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-4">
            <h2 className="font-bold text-slate-800 border-b pb-2">🥤 ソフトドリンク人気</h2>
            {softDrinkStats.map(([name, count]) => (
              <div key={name} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{name}</span>
                <div className="flex items-center gap-2 flex-1 justify-end">
                  <div className="h-2 bg-blue-100 rounded-full flex-1 max-w-[100px] overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${(count / softCount) * 100}%` }}></div>
                  </div>
                  <span className="font-bold text-slate-800 w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </section>
        </div>

        {/* 5. 食べ物リクエスト・ジャンル */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <Pizza className="text-yellow-500" /> 追加の食べ物リクエスト
          </h2>
          
          <div className="flex flex-wrap gap-3">
            {foodStats.map(([name, count]) => (
              <div key={name} className="bg-yellow-50 px-4 py-2 rounded-2xl border border-yellow-100 flex items-center gap-2">
                <span className="text-sm font-bold text-yellow-700">{name}</span>
                <span className="bg-yellow-500 text-white text-[10px] px-2 py-0.5 rounded-full">{count}票</span>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-4 border-t">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">個別の具体的リクエスト</p>
            <div className="grid gap-2">
              {data.filter(d => d.food_request).map(item => (
                <div key={item.user_id} className="bg-slate-50 p-4 rounded-2xl text-sm italic text-slate-600 flex gap-2">
                  <span className="font-bold text-slate-800 not-italic shrink-0">{item.members?.first_name}さん:</span>
                  「{item.food_request}」
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}