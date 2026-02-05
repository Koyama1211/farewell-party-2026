"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, AlertCircle, Beer, Pizza, CheckCircle2, Coffee } from "lucide-react";

export default function MealPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  // フォームの状態
  const [hasAllergy, setHasAllergy] = useState(false);
  const [allergyDetails, setAllergyDetails] = useState("");
  const [drinkType, setDrinkType] = useState<"soft" | "alcohol" | null>(null);
  const [selectedAlcohols, setSelectedAlcohols] = useState<string[]>([]);
  const [selectedSoftDrinks, setSelectedSoftDrinks] = useState<string[]>([]);
  const [alcoholAmount, setAlcoholAmount] = useState("");
  const [selectedFoodCats, setSelectedFoodCats] = useState<string[]>([]);
  const [foodRequest, setFoodRequest] = useState("");

  const alcoholOptions = ["ビール", "レモンサワー", "ハイボール", "梅酒", "カクテル", "その他"];
  const softDrinkOptions = ["お茶", "コーラ", "オレンジ・リンゴ", "カルピス", "炭酸水", "コーヒー・紅茶"];
  const foodOptions = ["ホットスナック", "サラダ・さっぱり系", "スイーツ", "アイス", "特定のお菓子"];

  // 1. 初回読み込み時に自分の回答を取得
  useEffect(() => {
    const fetchMyPref = async () => {
      const uid = localStorage.getItem("user_id");
      if (!uid) { router.push("/login"); return; }
      
      const { data, error } = await supabase
        .from("meal_preferences")
        .select("*")
        .eq("user_id", uid)
        .single();
      
      if (data) {
        setHasAllergy(data.has_allergy);
        setAllergyDetails(data.allergy_details || "");
        setDrinkType(data.drink_type as any);
        setSelectedAlcohols(data.favorite_alcohols || []);
        setSelectedSoftDrinks(data.favorite_soft_drinks || []);
        setAlcoholAmount(data.alcohol_amount || "");
        setSelectedFoodCats(data.food_categories || []);
        setFoodRequest(data.food_request || "");
      }
      setLoading(false);
    };
    fetchMyPref();
  }, [router]);

  // 複数選択用の共通関数
  const toggleSelection = (item: string, list: string[], setList: (l: string[]) => void) => {
    if (list.includes(item)) setList(list.filter(i => i !== item));
    else setList([...list, item]);
  };

  // 2. 送信処理（Upsert: なければ作成、あれば更新）
  const handleSave = async () => {
    const uid = localStorage.getItem("user_id");
    
    const { error } = await supabase.from("meal_preferences").upsert({
      user_id: uid, // これをキーにして上書き判定を行う
      has_allergy: hasAllergy,
      allergy_details: allergyDetails,
      drink_type: drinkType,
      favorite_alcohols: selectedAlcohols,
      favorite_soft_drinks: selectedSoftDrinks,
      alcohol_amount: alcoholAmount,
      food_categories: selectedFoodCats,
      food_request: foodRequest,
      updated_at: new Date()
    }, { onConflict: 'user_id' }); // 重複時は更新

    if (!error) {
      alert("回答を更新しました！買い出しに反映されます。");
      router.push("/");
    } else {
      console.error(error);
      alert("送信に失敗しました。");
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-gray-400">読み込み中...</div>;

  return (
    <div className="min-h-screen bg-orange-50 pb-20">
      <div className="sticky top-0 z-10 bg-orange-50/80 backdrop-blur-md p-6 flex items-center gap-4 border-b border-orange-100">
        <button onClick={() => router.push("/")} className="p-2 bg-white rounded-full shadow-sm"><ArrowLeft size={20} /></button>
        <h1 className="text-xl font-black text-orange-600 uppercase">Meal & Drink</h1>
      </div>

      <div className="max-w-md mx-auto px-4 mt-8 space-y-6">
        
        {/* アレルギー */}
        <section className="bg-white p-6 rounded-3xl shadow-lg space-y-4">
          <h2 className="flex items-center gap-2 font-bold text-gray-800"><AlertCircle className="text-red-500" /> アレルギー</h2>
          <div className="flex gap-4">
            {[{v: false, l:"なし"}, {v: true, l:"あり"}].map(opt => (
              <button key={opt.l} onClick={() => setHasAllergy(opt.v)} className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${hasAllergy === opt.v ? "border-red-400 bg-red-50 text-red-600" : "border-gray-100 text-gray-400"}`}>{opt.l}</button>
            ))}
          </div>
          {hasAllergy && (
            <textarea className="w-full p-4 bg-gray-50 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-red-200" value={allergyDetails} onChange={(e)=>setAllergyDetails(e.target.value)} placeholder="具体例：エビ、そば 等" />
          )}
        </section>

        {/* 飲み物 */}
        <section className="bg-white p-6 rounded-3xl shadow-lg space-y-4">
          <h2 className="flex items-center gap-2 font-bold text-gray-800"><Beer className="text-orange-500" /> お飲み物</h2>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setDrinkType('soft')} className={`p-4 rounded-xl border-2 font-bold transition-all ${drinkType === 'soft' ? "border-orange-500 bg-orange-50 text-orange-600" : "border-gray-50 text-gray-400"}`}>ソフトドリンク</button>
            <button onClick={() => setDrinkType('alcohol')} className={`p-4 rounded-xl border-2 font-bold transition-all ${drinkType === 'alcohol' ? "border-orange-500 bg-orange-50 text-orange-600" : "border-gray-50 text-gray-400"}`}>お酒も飲む 🍺</button>
          </div>

          {drinkType === 'soft' && (
            <div className="pt-4 border-t border-dashed space-y-3">
              <p className="text-[10px] font-bold text-orange-400 uppercase">飲みたい種類は？</p>
              <div className="flex flex-wrap gap-2">
                {softDrinkOptions.map(opt => (
                  <button key={opt} onClick={() => toggleSelection(opt, selectedSoftDrinks, setSelectedSoftDrinks)} className={`px-4 py-2 rounded-full text-[11px] font-bold transition-all ${selectedSoftDrinks.includes(opt) ? "bg-orange-500 text-white shadow-md" : "bg-gray-100 text-gray-400"}`}>{opt}</button>
                ))}
              </div>
            </div>
          )}

          {drinkType === 'alcohol' && (
            <div className="pt-4 border-t border-dashed space-y-4">
              <p className="text-[10px] font-bold text-orange-400 uppercase">何が好きですか？</p>
              <div className="flex flex-wrap gap-2">
                {alcoholOptions.map(opt => (
                  <button key={opt} onClick={() => toggleSelection(opt, selectedAlcohols, setSelectedAlcohols)} className={`px-4 py-2 rounded-full text-[11px] font-bold transition-all ${selectedAlcohols.includes(opt) ? "bg-orange-500 text-white shadow-md" : "bg-gray-100 text-gray-400"}`}>{opt}</button>
                ))}
              </div>
              <p className="text-[10px] font-bold text-orange-400 uppercase">量は？</p>
              <div className="flex gap-3">
                {["ほどほどに", "たくさん！"].map(opt => (
                  <button key={opt} onClick={() => setAlcoholAmount(opt)} className={`flex-1 py-2 rounded-xl border-2 text-[11px] font-bold transition-all ${alcoholAmount === opt ? "border-orange-500 bg-orange-50 text-orange-600" : "border-gray-100 text-gray-400"}`}>{opt}</button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 食べ物 */}
        <section className="bg-white p-6 rounded-3xl shadow-lg space-y-4">
          <h2 className="flex items-center gap-2 font-bold text-gray-800"><Pizza className="text-yellow-500" /> 食べたいもの！</h2>
          <div className="flex flex-wrap gap-2">
            {foodOptions.map(opt => (
              <button key={opt} onClick={() => toggleSelection(opt, selectedFoodCats, setSelectedFoodCats)} className={`px-4 py-2 rounded-full text-[11px] font-bold transition-all ${selectedFoodCats.includes(opt) ? "bg-yellow-500 text-white shadow-md" : "bg-gray-100 text-gray-400"}`}>{opt}</button>
            ))}
          </div>
          <textarea className="w-full p-4 bg-gray-50 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-yellow-200" value={foodRequest} onChange={(e)=>setFoodRequest(e.target.value)} placeholder="例：ファミチキ、ミスド、じゃがりこ等！" />
        </section>

        <button onClick={handleSave} className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all">
          <CheckCircle2 size={18} /> 回答を送信・更新する
        </button>
      </div>
    </div>
  );
}