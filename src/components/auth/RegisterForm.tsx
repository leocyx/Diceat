"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Chrome } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, signUpWithEmail, loginWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signUpWithEmail(email, password, username);
      setError("註冊成功！請檢查您的電子郵件信箱以完成驗證。");
      // 清空表單
      setEmail("");
      setPassword("");
      setUsername("");
    } catch (err: any) {
      setError(err.message || "註冊失敗");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || "Google 登入失敗");
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl shadow-indigo-100 border-indigo-50">
      <CardHeader className="text-center pb-8">
        <div className="mx-auto w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-4">
          <span className="text-white font-black text-2xl">D</span>
        </div>
        <CardTitle className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">加入 Diceat</CardTitle>
        <CardDescription className="font-medium text-slate-400">建立您的美食清單，不再為下一餐煩惱</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-slate-700 font-bold">使用者名稱</Label>
            <Input 
              id="username" 
              placeholder="美食愛好者" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
              className="rounded-xl border-slate-200 mt-2"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700 font-bold">電子郵件</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="name@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              className="rounded-xl border-slate-200 mt-2"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-700 font-bold">密碼</Label>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              className="rounded-xl border-slate-200 mt-2"
            />
          </div>
          {error && (
            <p className={`text-xs font-medium p-3 rounded-lg border ${
              error.includes("成功") 
                ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                : "bg-red-50 text-red-500 border-red-100"
            }`}>
              {error}
            </p>
          )}
          <Button type="submit" className="w-full rounded-xl py-6 font-black shadow-lg shadow-indigo-100" isLoading={loading}>
            註冊帳號
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-100" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-slate-400">
            <span className="bg-white px-4">或使用</span>
          </div>
        </div>

        <Button variant="outline" className="w-full rounded-xl border-slate-200 hover:bg-slate-50 transition-all font-bold text-slate-600" onClick={handleGoogleLogin} disabled={loading}>
          <Chrome className="mr-2 h-4 w-4" />
          使用 Google 快速註冊
        </Button>
      </CardContent>
      <CardFooter className="flex flex-wrap justify-center gap-1 text-sm text-slate-400 py-8">
        已經有帳號了？
        <Link href="/login" className="text-indigo-600 font-bold hover:underline">
          立即登入
        </Link>
      </CardFooter>
    </Card>
  );
}
