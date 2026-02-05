"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Music, ArrowLeft, Send, MessageSquare, ListMusic, User } from "lucide-react";

export default function RequestPage() {
  const [song, setSong] = useState("");
  const [artist, setArtist] = useState("");
  const [msg, setMsg] = useState("");
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 1. データの取得（membersテーブルからfirst_nameを結合して取得）
  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from("requests")
      .select(`
        *,
        members:user_id ( 
          first_name 
        )
      `)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching requests:", error);
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    const uid = localStorage.getItem("user_id");
    if (!uid) {
      router.push("/login");
      return;
    }
    fetchRequests();
  }, []);

  // 2. リクエストの送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const uid = localStorage.getItem("user_id");
    
    // ユーザーのフルネームを取得（念のため保存用）
    const { data: user } = await supabase.from("members").select("name").eq("id", uid).single();

    const { error } = await supabase.from("requests").insert([
      { 
        user_id: uid, 
        user_name: user?.name,
        song_title: song, 
        artist_name: artist, 
        message: msg 
      }
    ]);

    if (!error) {
      setSong("");
      setArtist("");
      setMsg("");
      fetchRequests(); // 送信完了後にリストを再読込
    } else {
      alert("送信に失敗しました。");
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 pb-20">
      {/* ヘッダー */}
      <div className="sticky top-0 z-10 bg-pink-50/80 backdrop-blur-md p-6 flex items-center gap-4 border-b border-pink-100">
        <button onClick={() => router.push("/")} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-black text-pink-600 tracking-tighter">MUSIC BOX</h1>
      </div>

      <div className="max-w-md mx-auto px-4 mt-6 space-y-8">
        
        {/* 投稿フォーム */}
        <section className="bg-white p-6 rounded-3xl shadow-xl border border-pink-100">
          <div className="flex items-center gap-2 mb-4 text-pink-500 font-bold">
            <Send size={18} />
            <h2>リクエストを投稿</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input 
              required 
              className="w-full p-4 bg-gray-50 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-pink-300 transition-all" 
              placeholder="曲名（必須）" 
              value={song} 
              onChange={(e) => setSong(e.target.value)} 
            />
            <input 
              className="w-full p-4 bg-gray-50 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-pink-300 transition-all" 
              placeholder="アーティスト名" 
              value={artist} 
              onChange={(e) => setArtist(e.target.value)} 
            />
            <textarea 
              className="w-full p-4 bg-gray-50 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-pink-300 transition-all min-h-[60px]" 
              placeholder="メッセージ（思い出など）" 
              value={msg} 
              onChange={(e) => setMsg(e.target.value)} 
            />
            <button 
              type="submit" 
              className="w-full py-4 bg-pink-500 text-white rounded-2xl font-black shadow-lg shadow-pink-200 active:scale-95 hover:bg-pink-600 transition-all"
            >
              リクエストを送る
            </button>
          </form>
        </section>

        {/* リクエスト一覧 */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2 text-gray-600 font-bold">
            <ListMusic size={20} />
            <h2>みんなのプレイリスト ({requests.length})</h2>
          </div>

          <div className="grid gap-3">
            {loading ? (
              <p className="text-center py-10 text-gray-400">読み込み中...</p>
            ) : requests.length === 0 ? (
              <div className="text-center py-12 bg-white/50 rounded-3xl border-2 border-dashed border-pink-200 text-pink-300">
                まだリクエストがありません
              </div>
            ) : (
              requests.map((req) => (
                <div key={req.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-3">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-sm leading-tight">{req.song_title}</h3>
                      <p className="text-[11px] text-gray-400 mt-0.5">{req.artist_name || "Unknown Artist"}</p>
                    </div>
                    {/* 名前（first_name）の表示部分 */}
                    <div className="flex items-center gap-1 bg-pink-50 px-2 py-1 rounded-lg shrink-0 ml-2">
                      <User size={10} className="text-pink-400" />
                      <span className="text-[10px] font-bold text-pink-600">
                        {(req.members as any)?.first_name || "不明"}さん
                      </span>
                    </div>
                  </div>
                  
                  {req.message && (
                    <div className="mt-2 bg-pink-50/50 p-2 rounded-xl border border-pink-100">
                      <p className="text-[11px] text-pink-700 leading-relaxed italic">
                        「{req.message}」
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}