"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Music, Utensils, LogOut, Settings, ChevronRight, Sparkles, Calendar } from "lucide-react";

export default function HomePage() {
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState("");
  // 追加: スケジュール用 state
  const [schedules, setSchedules] = useState([
    { time: "18:00", title: "開宴・乾杯", desc: "追いコンスタート！" },
    { time: "18:30", title: "お食事タイム", desc: "寿司とピザが届きます" },
    { time: "19:30", title: "思い出ムービー", desc: "ハンカチを用意！" },
    { time: "20:00", title: "プレゼント贈呈", desc: "感謝を込めて" },
  ]);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const uid = localStorage.getItem("user_id");
      if (!uid) {
        router.push("/login");
        return;
      }

      // DB からスケジュールを取得して state にセット
      const fetchSchedules = async () => {
        const { data, error } = await supabase
          .from("schedules")
          .select("*")
          .order("time_start", { ascending: true });
        if (error) {
          console.error("fetchSchedules error:", error);
          return;
        }
        if (data && data.length > 0) {
          // DB のカラム名に合わせてマッピングが必要ならここで調整
          setSchedules(
            data.map((r: any) => ({
              time: r.time_start ?? r.time ?? "",
              title: r.title ?? "",
              desc: r.desc ?? r.description ?? "",
            }))
          );
        }
      };

      await fetchSchedules();

      const { data } = await supabase
        .from("members")
        .select("first_name, role")
        .eq("id", uid)
        .single();

      if (data) {
        setUserName(data.first_name);
        setRole(data.role);
      }
    };
    checkUser();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    router.push("/login");
  };

  const isAdmin = role === "admin";

  return (
    <div className="min-h-screen bg-[#fdf8f6] pb-20">
      {/* ヘッダーエリア */}
      <div className="p-8 pt-12 text-center space-y-2">
        <div className="inline-block px-3 py-1 bg-pink-100 text-pink-600 text-[10px] font-black rounded-full uppercase tracking-widest mb-2 animate-bounce">
          Farewell Party 2026
        </div>
        <h1 className="text-4xl font-black text-gray-800 tracking-tighter">
          HELLO, <span className="text-pink-500">{userName || "MEMBER"}</span>
        </h1>
        <p className="text-sm text-gray-400 font-medium">最高の追いコンにしよう！</p>
      </div>

      <div className="max-w-md mx-auto px-6 space-y-6">
        
        {/* メインメニュー：2列グリッド */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => router.push("/request")}
            className="flex flex-col items-center p-6 bg-white rounded-[2rem] shadow-xl shadow-pink-100 border border-pink-50 hover:scale-105 transition-all group"
          >
            <div className="w-14 h-14 bg-pink-500 rounded-2xl flex items-center justify-center text-white mb-4 group-hover:rotate-12 transition-transform">
              <Music size={28} />
            </div>
            <span className="font-black text-gray-700">MUSIC</span>
            <span className="text-[10px] text-pink-400 font-bold uppercase">Request</span>
          </button>

          <button 
            onClick={() => router.push("/meal")}
            className="flex flex-col items-center p-6 bg-white rounded-[2rem] shadow-xl shadow-orange-100 border border-orange-50 hover:scale-105 transition-all group"
          >
            <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white mb-4 group-hover:-rotate-12 transition-transform">
              <Utensils size={28} />
            </div>
            <span className="font-black text-gray-700">MEAL</span>
            <span className="text-[10px] text-orange-400 font-bold uppercase">Preference</span>
          </button>
        </div>

        {/* --- タイムスケジュールエリア --- */}
        <section className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-50">
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-xs font-black text-slate-800 flex items-center gap-2 tracking-widest">
              <Calendar size={16} className="text-blue-500" /> TIME SCHEDULE
            </h2>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">MAR. 2026</span>
          </div>

          <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
            {schedules.map((item, idx) => (
              <div key={idx} className="relative pl-8 group">
                <div className="absolute left-0 top-1.5 w-6 h-6 bg-white border-4 border-blue-500 rounded-full z-10 group-hover:scale-110 transition-transform" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-blue-500 leading-none">{item.time}</span>
                  <span className="text-sm font-bold text-slate-700 mt-1">{item.title}</span>
                  <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        {/* ------------------------------------------ */}

        {/* 管理者入り口 */}
        {isAdmin && (
          <div className="pt-2">
            <button 
              onClick={() => router.push("/admin")}
              className="w-full flex items-center justify-between p-5 bg-gray-900 text-white rounded-3xl shadow-2xl hover:bg-black transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                  <Settings size={20} className="text-gray-400 group-hover:text-white" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-black flex items-center gap-1">
                    管理者メニュー <Sparkles size={12} className="text-yellow-400" />
                  </div>
                  <div className="text-[10px] text-gray-500 font-bold">集計・名簿・運営管理</div>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-600 group-hover:text-white" />
            </button>
          </div>
        )}

        {/* ログアウトボタン */}
        <button 
          onClick={handleLogout}
          className="w-full py-4 text-gray-400 text-xs font-bold hover:text-red-400 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut size={14} /> ログアウトして戻る
        </button>

      </div>
    </div>
  );
}