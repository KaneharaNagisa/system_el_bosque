import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { FaShieldAlt, FaUser, FaLock, FaEye, FaEyeSlash, FaExclamationTriangle, FaArrowLeft } from "react-icons/fa";

export function AdminLogin() {
  const navigate = useNavigate();
  const { adminLogin, isAdminLoggedIn } = useAdminAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAdminLoggedIn) {
      navigate("/admin/dashboard");
    }
  }, [isAdminLoggedIn, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) newErrors.email = "メールアドレスを入力してください";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "有効なメ��ルアドレスを入力してください";
    if (!formData.password) newErrors.password = "パスワードを入力してください";
    else if (formData.password.length < 6) newErrors.password = "パスワードは6文字以上で入力してください";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const success = adminLogin(formData.email, formData.password);
    if (success) {
      navigate("/admin/dashboard");
    } else {
      setErrors({ submit: "メールアドレスまたはパスワードが正しくありません" });
    }
    setIsSubmitting(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        fontFamily: "'Noto Sans JP', sans-serif",
        background: "linear-gradient(135deg, #061a03 0%, #0a2105 30%, #122e0e 60%, #0a2105 100%)",
      }}
    >
      {/* Header */}
      <header style={{ borderBottom: "1px solid rgba(44,151,108,0.25)", backgroundColor: "rgba(6,26,3,0.9)", backdropFilter: "blur(8px)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm transition-colors"
            style={{ color: "#6ee7a8" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#a7f3d0")}
            onMouseLeave={e => (e.currentTarget.style.color = "#6ee7a8")}
          >
            <FaArrowLeft className="w-3 h-3" />
            サイトに戻る
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#2c976c" }}>
              <FaShieldAlt className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base" style={{ color: "#e8f5e9" }}>管理者ログイン</h1>
              <p className="text-xs" style={{ color: "#6ee7a8" }}>貸別荘エルボスケ</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Warning */}
          <div className="mb-8 p-4 rounded-lg flex items-start gap-3" style={{ border: "1px solid rgba(44,151,108,0.35)", backgroundColor: "rgba(44,151,108,0.08)" }}>
            <FaExclamationTriangle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#6ee7a8" }} />
            <div className="text-sm" style={{ color: "#c8ddd0" }}>
              <strong>管理者専用ページです。</strong><br />
              許可された管理者のみがアクセス可能です。
            </div>
          </div>

          {/* Login Form */}
          <div className="rounded-xl p-8" style={{ border: "1px solid rgba(44,151,108,0.25)", backgroundColor: "rgba(10,33,5,0.7)", backdropFilter: "blur(8px)" }}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "rgba(44,151,108,0.15)" }}>
                <FaShieldAlt className="w-7 h-7" style={{ color: "#6ee7a8" }} />
              </div>
              <h2 className="text-xl" style={{ color: "#e8f5e9" }}>管理者認証</h2>
              <p className="text-sm mt-1" style={{ color: "#6ee7a8" }}>メールアドレスとパスワードを入力してください</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1" style={{ color: "#c8ddd0" }}>メールアドレス</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#6ee7a8" }} />
                  <input
                    type="email"
                    placeholder="admin@elbosque.jp"
                    value={formData.email}
                    onChange={e => handleInputChange("email", e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg text-sm outline-none"
                    style={{
                      backgroundColor: "rgba(18,46,14,0.5)",
                      border: "1px solid rgba(44,151,108,0.3) !important",
                      color: "#e8f5e9",
                    }}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.email && <p className="text-sm mt-1" style={{ color: "#f87171" }}>{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm mb-1" style={{ color: "#c8ddd0" }}>パスワード</label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#6ee7a8" }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="パスワードを入力"
                    value={formData.password}
                    onChange={e => handleInputChange("password", e.target.value)}
                    className="w-full pl-10 pr-12 py-3 rounded-lg text-sm outline-none"
                    style={{
                      backgroundColor: "rgba(18,46,14,0.5)",
                      border: "1px solid rgba(44,151,108,0.3) !important",
                      color: "#e8f5e9",
                    }}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "#6ee7a8" }}
                  >
                    {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm mt-1" style={{ color: "#f87171" }}>{errors.password}</p>}
              </div>

              {errors.submit && (
                <div className="p-3 rounded-lg flex items-center gap-2" style={{ border: "1px solid rgba(248,113,113,0.4)", backgroundColor: "rgba(248,113,113,0.08)" }}>
                  <FaExclamationTriangle className="w-4 h-4" style={{ color: "#f87171" }} />
                  <span className="text-sm" style={{ color: "#fca5a5" }}>{errors.submit}</span>
                </div>
              )}

              <div className="pt-4" style={{ borderTop: "1px solid rgba(44,151,108,0.25)" }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 text-white rounded-lg flex items-center justify-center gap-2 text-sm transition-colors disabled:opacity-60"
                  style={{ backgroundColor: "#2c976c" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#237a57")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#2c976c")}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      認証中...
                    </>
                  ) : (
                    <>
                      <FaShieldAlt className="w-4 h-4" />
                      管理画面にログイン
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: "rgba(18,46,14,0.5)", border: "1px solid rgba(44,151,108,0.25)" }}>
              <p className="text-xs mb-2" style={{ color: "#6ee7a8" }}>デモ用認証情報:</p>
              <div className="space-y-1 text-xs">
                <p style={{ color: "#c8ddd0" }}>メール: <code className="px-1 rounded" style={{ backgroundColor: "rgba(44,151,108,0.2)" }}>admin@elbosque.jp</code></p>
                <p style={{ color: "#c8ddd0" }}>パスワード: <code className="px-1 rounded" style={{ backgroundColor: "rgba(44,151,108,0.2)" }}>admin1234</code></p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}