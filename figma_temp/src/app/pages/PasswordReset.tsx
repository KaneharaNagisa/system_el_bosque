import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  FaKey,
  FaCheckCircle,
  FaChevronLeft,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem 1rem",
  backgroundColor: "#faf5e8",
  border: "1px solid rgba(30,60,14,0.2)",
  borderRadius: "3px",
  fontSize: "0.9rem",
  color: "#2c1e10",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
  fontFamily: "'Noto Sans JP', sans-serif",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.8rem",
  fontWeight: 700,
  color: "#1e3c0e",
  marginBottom: "0.4rem",
  letterSpacing: "0.04em",
};

export function PasswordReset() {
  const { isLoggedIn, changePassword } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focusedField, setFocusedField] = useState("");

  const focusedInputStyle = (field: string): React.CSSProperties => ({
    ...inputStyle,
    borderColor: focusedField === field ? "#1e3c0e" : "rgba(30,60,14,0.2)",
    boxShadow: focusedField === field ? "0 0 0 3px rgba(30,60,14,0.1)" : "none",
    paddingRight: "2.75rem",
  });

  if (!isLoggedIn) {
    return (
      <div>
        <div
          style={{
            background: "linear-gradient(135deg, #0e1a08 0%, #1b2f0e 60%, #254510 100%)",
            padding: "8rem 1.5rem 4rem",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 700,
              color: "#f0e8d0",
            }}
          >
            パスワード再設定
          </h1>
        </div>
        <section style={{ backgroundColor: "#f2e8d0", padding: "5rem 1.5rem", textAlign: "center" }}>
          <p style={{ color: "#5a4838", marginBottom: "1.5rem" }}>
            パスワード変更にはログインが必要です。
          </p>
          <Link
            to="/login"
            style={{
              display: "inline-block",
              backgroundColor: "#5c2e12",
              color: "#f0e8d0",
              padding: "0.8rem 1.75rem",
              borderRadius: "3px",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "0.9rem",
            }}
          >
            ログインページへ
          </Link>
        </section>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("新しいパスワードは8文字以上で入力してください。");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("新しいパスワードと確認パスワードが一致しません。");
      return;
    }
    if (currentPassword === newPassword) {
      setError("現在のパスワードと同じパスワードは設定できません。");
      return;
    }

    const result = changePassword(currentPassword, newPassword);
    if (result) {
      setSuccess(true);
      window.scrollTo(0, 0);
    } else {
      setError("現在のパスワードが正しくありません。");
    }
  };

  if (success) {
    return (
      <div>
        <div
          style={{
            background: "linear-gradient(135deg, #0e1a08 0%, #1b2f0e 60%, #254510 100%)",
            padding: "8rem 1.5rem 4rem",
            textAlign: "center",
          }}
        >
          <p
            style={{
              color: "#d4b070",
              fontSize: "0.72rem",
              letterSpacing: "0.25em",
              fontWeight: 700,
              textTransform: "uppercase",
              marginBottom: "0.75rem",
            }}
          >
            Password Reset
          </p>
          <h1
            style={{
              fontFamily: "'Noto Serif JP', serif",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 700,
              color: "#f0e8d0",
              lineHeight: 1.3,
            }}
          >
            パスワード再設定
          </h1>
        </div>
        <section style={{ backgroundColor: "#f2e8d0", padding: "5rem 1.5rem" }}>
          <div
            style={{
              maxWidth: "480px",
              margin: "0 auto",
              textAlign: "center",
              backgroundColor: "#faf5e8",
              borderRadius: "4px",
              padding: "3rem 2rem",
              boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
              border: "1px solid rgba(180,140,80,0.15)",
            }}
          >
            <FaCheckCircle size={48} color="#1e3c0e" style={{ marginBottom: "1.25rem" }} />
            <h2
              style={{
                fontFamily: "'Noto Serif JP', serif",
                fontSize: "1.3rem",
                fontWeight: 700,
                color: "#1e3c0e",
                marginBottom: "0.75rem",
              }}
            >
              パスワードを変更しました
            </h2>
            <p style={{ fontSize: "0.88rem", color: "#5a4838", lineHeight: 1.8, marginBottom: "2rem" }}>
              新しいパスワードで次回からログインしてください。
            </p>
            <Link
              to="/mypage"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                backgroundColor: "#1e3c0e",
                color: "#f0e8d0",
                padding: "0.8rem 1.75rem",
                borderRadius: "3px",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "0.9rem",
              }}
            >
              <FaChevronLeft size={11} />
              マイページに戻る
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #0e1a08 0%, #1b2f0e 60%, #254510 100%)",
          padding: "8rem 1.5rem 4rem",
          textAlign: "center",
        }}
      >
        <p
          style={{
            color: "#d4b070",
            fontSize: "0.72rem",
            letterSpacing: "0.25em",
            fontWeight: 700,
            textTransform: "uppercase",
            marginBottom: "0.75rem",
          }}
        >
          Password Reset
        </p>
        <h1
          style={{
            fontFamily: "'Noto Serif JP', serif",
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            fontWeight: 700,
            color: "#f0e8d0",
            lineHeight: 1.3,
          }}
        >
          パスワード再設定
        </h1>
        <p style={{ color: "rgba(240,232,208,0.7)", marginTop: "1rem", fontSize: "0.92rem" }}>
          新しいパスワードを設定してください
        </p>
      </div>

      <section style={{ backgroundColor: "#f2e8d0", padding: "4rem 1.5rem" }}>
        <div style={{ maxWidth: "480px", margin: "0 auto" }}>
          {/* Back link */}
          <Link
            to="/mypage"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              color: "#7a4020",
              fontSize: "0.85rem",
              fontWeight: 700,
              textDecoration: "none",
              marginBottom: "1.25rem",
            }}
          >
            <FaChevronLeft size={11} />
            マイページに戻る
          </Link>

          <form
            onSubmit={handleSubmit}
            style={{
              backgroundColor: "#faf5e8",
              borderRadius: "4px",
              padding: "2.5rem",
              boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
              border: "1px solid rgba(180,140,80,0.15)",
            }}
          >
            <h2
              style={{
                fontFamily: "'Noto Serif JP', serif",
                fontSize: "1.15rem",
                fontWeight: 700,
                color: "#1e3c0e",
                marginBottom: "2rem",
                paddingBottom: "0.75rem",
                borderBottom: "2px solid rgba(180,140,80,0.2)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <FaKey size={16} color="#7a4020" />
              パスワード変更
            </h2>

            {error && (
              <div
                style={{
                  backgroundColor: "rgba(160,48,32,0.06)",
                  border: "1px solid rgba(160,48,32,0.15)",
                  borderRadius: "3px",
                  padding: "0.75rem 1rem",
                  marginBottom: "1.5rem",
                  fontSize: "0.82rem",
                  color: "#a03020",
                  lineHeight: 1.6,
                }}
              >
                {error}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Current Password */}
              <div>
                <label style={labelStyle}>
                  現在のパスワード <span style={{ color: "#a03020" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    onFocus={() => setFocusedField("current")}
                    onBlur={() => setFocusedField("")}
                    required
                    style={focusedInputStyle("current")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    style={{
                      position: "absolute",
                      right: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#8a7868",
                      padding: "0.25rem",
                    }}
                  >
                    {showCurrent ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label style={labelStyle}>
                  新しいパスワード <span style={{ color: "#a03020" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onFocus={() => setFocusedField("new")}
                    onBlur={() => setFocusedField("")}
                    required
                    minLength={8}
                    style={focusedInputStyle("new")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    style={{
                      position: "absolute",
                      right: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#8a7868",
                      padding: "0.25rem",
                    }}
                  >
                    {showNew ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
                <p style={{ fontSize: "0.72rem", color: "#8a7868", marginTop: "0.3rem" }}>
                  ※ 8文字以上で入力してください
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label style={labelStyle}>
                  新しいパスワード（確認） <span style={{ color: "#a03020" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocusedField("confirm")}
                    onBlur={() => setFocusedField("")}
                    required
                    minLength={8}
                    style={focusedInputStyle("confirm")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    style={{
                      position: "absolute",
                      right: "0.75rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#8a7868",
                      padding: "0.25rem",
                    }}
                  >
                    {showConfirm ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!currentPassword || !newPassword || !confirmPassword}
              style={{
                width: "100%",
                marginTop: "2rem",
                backgroundColor: currentPassword && newPassword && confirmPassword ? "#5c2e12" : "#c8b8a0",
                color: currentPassword && newPassword && confirmPassword ? "#f0e8d0" : "#a09080",
                padding: "1rem",
                borderRadius: "3px",
                border: "none",
                cursor: currentPassword && newPassword && confirmPassword ? "pointer" : "not-allowed",
                fontSize: "1rem",
                fontWeight: 700,
                fontFamily: "'Noto Sans JP', sans-serif",
                transition: "background-color 0.2s",
              }}
            >
              パスワードを変更する
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
