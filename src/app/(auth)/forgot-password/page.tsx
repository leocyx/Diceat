"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { ChevronLeft, Mail } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { sendPasswordResetEmail } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await sendPasswordResetEmail(email);
      setMessage("重設密碼連結已發送至您的電子郵件信箱。");
    } catch (err: any) {
      setError(err.message || "發送失敗，請稍後再試。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 font-sans">
      <Card className="w-full max-w-md mx-auto shadow-2xl shadow-indigo-100 border-indigo-50">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-4">
            <Mail className="text-white" size={24} />
          </div>
          <CardTitle className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">忘記密碼</CardTitle>
          <CardDescription className="font-medium text-slate-400">輸入您的電子郵件，我們將發送重設連結給您</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
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
            {error && <p className="text-xs text-red-500 font-medium bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
            {message && <p className="text-xs text-emerald-600 font-medium bg-emerald-50 p-3 rounded-lg border border-emerald-100">{message}</p>}
            <Button type="submit" className="w-full rounded-xl py-6 font-black shadow-lg shadow-indigo-100" isLoading={loading}>
              發送重設連結
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center py-8">
          <Link href="/login" className="flex items-center gap-2 text-sm text-indigo-600 font-bold hover:underline">
            <ChevronLeft size={16} />
            返回登入
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
