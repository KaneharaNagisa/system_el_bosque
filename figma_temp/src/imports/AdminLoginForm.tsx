import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";
import {
  ArrowLeftIcon,
  ShieldIcon,
  UserIcon,
  LockIcon,
  AlertTriangleIcon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";

export default function AdminLoginForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "メールアドレスを入力してください";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "有効なメールアドレスを入力してください";
    }

    if (!formData.password) {
      newErrors.password = "パスワードを入力してください";
    } else if (formData.password.length < 8) {
      newErrors.password = "パスワードは8文字以上で入力してください";
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call - 実際のアプリケーションでは認証APIを呼び出す
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock authentication - 実際のアプリケーションでは適切な認証を行う
      if (formData.email === "admin@example.com" && formData.password === "admin123456") {
        // onLogin(formData.email, formData.password);
        navigate("/admin/dashboard");
      } else {
        setErrors({ submit: "メールアドレスまたはパスワードが正しくありません" });
      }
    } catch (error) {
      setErrors({ submit: "ログインに失敗しました。しばらく時間をおいて再度お試しください。" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 font-sans font-normal">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                戻る
              </Button>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <ShieldIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-medium text-white">管理者ログイン</h1>
                <p className="text-sm text-slate-400">盆唄システム</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-md mx-auto">
          {/* Warning Alert */}
          <Alert className="mb-8 border-orange-200 bg-orange-50/10 border">
            <AlertTriangleIcon className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-200">
              <strong>管理者専用ページです。</strong>
              <br />
              許可された管理者のみがアクセス可能です。不正アクセスは記録されます。
            </AlertDescription>
          </Alert>

          {/* Login Form */}
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-orange-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldIcon className="w-8 h-8 text-orange-500" />
              </div>
              <CardTitle className="text-2xl text-white">管理者認証</CardTitle>
              <CardDescription className="text-slate-400">
                メールアドレスとパスワードを入力してください
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300">
                    メールアドレス
                  </Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-orange-500 focus:ring-orange-500"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.email && <p className="text-sm text-red-400">{errors.email}</p>}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300">
                    パスワード
                  </Label>
                  <div className="relative">
                    <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="パスワードを入力"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="pl-10 pr-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-orange-500 focus:ring-orange-500"
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-slate-400 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isSubmitting}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="w-4 h-4" />
                      ) : (
                        <EyeIcon className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  {errors.password && <p className="text-sm text-red-400">{errors.password}</p>}
                </div>

                {/* Submit Error */}
                {errors.submit && (
                  <Alert className="border-red-600 bg-red-900/20">
                    <AlertTriangleIcon className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-300">{errors.submit}</AlertDescription>
                  </Alert>
                )}

                <Separator className="bg-slate-700" />

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>認証中...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <ShieldIcon className="w-4 h-4" />
                      <span>管理画面にログイン</span>
                    </div>
                  )}
                </Button>
              </form>

              {/* Demo Credentials */}
              <div className="mt-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                <p className="text-xs text-slate-400 mb-2">デモ用認証情報:</p>
                <div className="space-y-1 text-xs">
                  <p className="text-slate-300">
                    メール: <code className="bg-slate-600 px-1 rounded">admin@example.com</code>
                  </p>
                  <p className="text-slate-300">
                    パスワード: <code className="bg-slate-600 px-1 rounded">admin123456</code>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500">
              このページへのアクセスは記録されています。
              <br />
              不正アクセスを試みた場合、適切な措置を取らせていただきます。
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}