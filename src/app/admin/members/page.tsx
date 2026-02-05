"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserCheck, UserX, Search, Mail, Music, Utensils, Trash2 } from "lucide-react";

export default function AdminMembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    // メンバー情報と、食事回答があるかどうかを結合して取得
    const { data, error } = await supabase
      .from("members")
      .select(`
        *,
        meal_preferences ( user_id )
      `)
      .order('name', { ascending: true });

    if (data) setMembers(data);
    setLoading(false);
  };

  // 出席ステータスの切り替え
  const togglePresence = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("members")
      .update({ is_present: !currentStatus })
      .eq("id", id);
    
    if (!error) {
      setMembers(members.map(m => m.id === id ? { ...m, is_present: !currentStatus } : m));
    }
  };

  // メンバーの削除
  const deleteMember = async (id: string, name: string) => {
    if (confirm(`${name}さんを名簿から削除しますか？`)) {
      const { error } = await supabase.from("members").delete().eq("id", id);
      if (!error) setMembers(members.filter(m => m.id !== id));
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.includes(searchTerm) || m.first_name.includes(searchTerm)
  );

  if (loading) return <div className="p-10 text-center text-gray-400 font-bold">名簿を読み込み中...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md p-6 border-b border-slate-200">
        <div className="max-w-4xl mx-auto flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/admin")} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">MEMBER LIST</h1>
          </div>
          
          {/* 検索バー */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="名前で検索..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-3">
        <div className="flex justify-between items-center px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>名前 / ステータス</span>
          <span>出席確認</span>
        </div>

        {filteredMembers.map((member) => (
          <div key={member.id} className={`flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border transition-all ${member.is_present ? "border-green-200 bg-green-50/30" : "border-white"}`}>
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${member.role === 'admin' ? "bg-slate-800 text-white" : "bg-blue-100 text-blue-600"}`}>
                {member.first_name[0]}
              </div>
              <div>
                <div className="font-bold text-slate-700 flex items-center gap-2">
                  {member.name}
                  {member.role === 'admin' && <span className="text-[8px] bg-slate-200 px-1 rounded text-slate-500">幹事</span>}
                </div>
                <div className="flex gap-2 mt-1">
                  {/* 食事回答済みかどうかのバッジ */}
                  <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${member.meal_preferences?.length > 0 ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-400"}`}>
                    <Utensils size={10} /> MEAL
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => deleteMember(member.id, member.name)}
                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
              <button 
                onClick={() => togglePresence(member.id, member.is_present)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${member.is_present ? "bg-green-500 text-white shadow-lg shadow-green-100" : "bg-white border-2 border-slate-100 text-slate-400"}`}
              >
                {member.is_present ? <UserCheck size={16} /> : <UserX size={16} />}
                {member.is_present ? "出席" : "未着"}
              </button>
            </div>
          </div>
        ))}
        
        {filteredMembers.length === 0 && (
          <div className="text-center py-20 text-slate-400 text-sm italic">
            該当するメンバーが見つかりません
          </div>
        )}
      </div>
    </div>
  );
}