"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const { data, error: dbError } = await supabase
      .from("members")
      .select("id, name, role")
      .eq("name", name)
      .eq("birthday", birthday)
      .single();

    if (dbError || !data) {
      setError("名前または誕生日が正しくありません。");
      return;
    }

    localStorage.setItem("user_id", data.id);
    localStorage.setItem("user_role", data.role);
    router.push("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form onSubmit={handleLogin} className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-6">ログイン</h1>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="お名前"
            className="w-full p-3 border rounded-lg"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="誕生日（例：0205）"
            className="w-full p-3 border rounded-lg"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold">ログイン</button>
        </div>
      </form>
    </div>
  );
}