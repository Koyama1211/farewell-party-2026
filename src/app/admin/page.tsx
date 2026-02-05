"use client";
import { useRouter } from "next/navigation";
import { 
  Users, 
  ShoppingCart, 
  Music, 
  ArrowLeft, 
  Settings, 
  ChevronRight,
  Clock
} from "lucide-react";

export default function AdminHub() {
  const router = useRouter();

  const menuGroups = [
    {
      title: "事前準備・集計",
      items: [
        { 
          label: "買い出し集計リスト", 
          desc: "お酒・飲み物・アレルギーの確認", 
          icon: <ShoppingCart className="text-orange-500" />, 
          path: "/admin/meal",
          color: "bg-orange-50"
        },
        { 
          label: "参加者名簿の管理", 
          desc: "メンバー一覧の確認・編集", 
          icon: <Users className="text-blue-500" />, 
          path: "/admin/members",
          color: "bg-blue-50"
        },
      ]
    },
    {
      title: "当日運用",
      items: [
        { 
          label: "ミュージックボックス管理", 
          desc: "投稿されたリクエストの確認", 
          icon: <Music className="text-pink-500" />, 
          path: "/request", 
          color: "bg-pink-50"
        },
        {
          label: "スケジュールの編集",
          desc: "当日のタイムラインを管理",
          icon: <Clock className="text-blue-600" />,
          path: "/admin/schedule",
          color: "bg-blue-100"
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      {/* ヘッダー */}
      <div className="bg-white border-b border-slate-200 p-6 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <button onClick={() => router.push("/")} className="p-2 hover:bg-slate-100 rounded-full">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-800">Administrator</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">幹事専用コントロールパネル</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-8 space-y-8">
        {menuGroups.map((group) => (
          <section key={group.title} className="space-y-3">
            <h2 className="text-xs font-bold text-slate-400 ml-2 uppercase tracking-widest">
              {group.title}
            </h2>
            <div className="grid gap-3">
              {group.items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => router.push(item.path)}
                  className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-blue-300 hover:shadow-md transition-all group text-left"
                >
                  <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center shrink-0`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-700">{item.label}</div>
                    <div className="text-[10px] text-slate-400">{item.desc}</div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                </button>
              ))}
            </div>
          </section>
        ))}

        {/* システム情報（おまけ） */}
        <div className="p-6 bg-slate-200/50 rounded-3xl border border-dashed border-slate-300">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <Settings size={14} />
            <span className="text-[10px] font-bold uppercase">System Status</span>
          </div>
          <div className="text-[10px] text-slate-400 leading-relaxed">
            追いコン2026 管理システム稼働中。<br />
            毅さん、泰雅さん、準備お疲れ様です！
          </div>
        </div>
      </div>
    </div>
  );
}