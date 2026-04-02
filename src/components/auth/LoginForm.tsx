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

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, loginWithEmail, loginWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await loginWithEmail(email, password);
      router.push("/");
    } catch (err: any) {
      let friendlyMessage = "登入失敗，請檢查帳號密碼";
      
      if (err.message === "Invalid login credentials") {
        friendlyMessage = "電子郵件或密碼錯誤，請再試一次";
      } else if (err.message === "Email not confirmed") {
        friendlyMessage = "您的電子郵件尚未驗證，請先檢查信箱";
      }
      
      setError(friendlyMessage);
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
        <CardTitle className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">Diceat</CardTitle>
        <CardDescription className="font-medium text-slate-400">歡迎回來！今天想吃什麼？</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleEmailLogin} className="space-y-4">
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-slate-700 font-bold">密碼</Label>
              <Link href="/forgot-password" className="text-xs text-indigo-600 hover:text-indigo-700 font-bold">忘記密碼？</Link>
            </div>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              className="rounded-xl border-slate-200 mt-2"
            />
          </div>
          {error && <p className="text-xs text-red-500 font-medium bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
          <Button type="submit" className="w-full rounded-xl py-6 font-black shadow-lg shadow-indigo-100" isLoading={loading}>
            登入
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
          使用 Google 帳號登入
        </Button>
      </CardContent>
      <CardFooter className="flex flex-wrap justify-center gap-1 text-sm text-slate-400 py-8">
        還沒有帳號？
        <Link href="/register" className="text-indigo-600 font-bold hover:underline">
          立即註冊
        </Link>
      </CardFooter>
    </Card>
  );
}
