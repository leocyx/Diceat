"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Lock, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { updatePassword } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError("兩次輸入的密碼不一致");
    }
    if (password.length < 6) {
      return setError("密碼長度至少需要 6 個字元");
    }

    setLoading(true);
    setError(null);
    try {
      await updatePassword(password);
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "重設失敗，請確認連結是否過期");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 font-sans">
      <Card className="w-full max-w-md mx-auto shadow-2xl shadow-red-100 border-red-50">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto w-12 h-12 bg-red-700 rounded-xl flex items-center justify-center shadow-lg shadow-red-200 mb-4">
            <Lock className="text-white" size={24} />
          </div>
          <CardTitle className="text-3xl font-black text-red-700">
            重設密碼
          </CardTitle>
          <CardDescription className="font-medium text-slate-400">
            請輸入您的新密碼
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {success ? (
            <div className="flex flex-col items-center text-center space-y-4 py-4">
              <CheckCircle2 className="text-emerald-500 w-16 h-16 animate-bounce" />
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">
                  密碼重設成功！
                </h3>
                <p className="text-sm text-slate-500">
                  將於 3 秒後自動跳轉至登入頁面...
                </p>
              </div>
              <Button
                onClick={() => router.push("/login")}
                className="w-full rounded-xl"
              >
                立即登入
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-slate-700 font-bold"
                >
                  新密碼
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-xl border-slate-200 mt-2"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-slate-700 font-bold"
                >
                  確認新密碼
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                  className="rounded-xl border-slate-200 mt-2"
                />
              </div>
              {error && (
                <p className="text-xs text-red-500 font-medium bg-red-50 p-3 rounded-lg border border-red-100">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                className="w-full rounded-xl py-6 font-black shadow-lg shadow-red-100"
                isLoading={loading}
              >
                更新密碼
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
