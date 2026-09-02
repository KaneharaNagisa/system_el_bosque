import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "../router";
import { FaSignInAlt, FaExclamationCircle } from "react-icons/fa";
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

export function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [focusedField, setFocusedField] = useState("");
    const { login } = useAuth();
    const [searchParams] = useSearchParams();
    const redirect = searchParams.get("redirect") || "/mypage";

    const focusedInputStyle = (field: string): React.CSSProperties => ({
        ...inputStyle,
        borderColor: focusedField === field ? "#1e3c0e" : "rgba(30,60,14,0.2)",
        boxShadow:
            focusedField === field ? "0 0 0 3px rgba(30,60,14,0.1)" : "none",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        login(email, password, redirect, setError);
    };

    return (
        <div>
            {/* Header */}
            <div
                style={{
                    background:
                        "linear-gradient(135deg, #0e1a08 0%, #1b2f0e 60%, #254510 100%)",
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
                    Login
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
                    ログイン
                </h1>
                <p
                    style={{
                        color: "rgba(240,232,208,0.7)",
                        marginTop: "1rem",
                        fontSize: "0.92rem",
                    }}
                >
                    会員の方はメールアドレスとパスワードでログインしてください
                </p>
            </div>

            <section
                style={{
                    backgroundColor: "#f2e8d0",
                    padding: "4rem 1.5rem",
                }}
            >
                <div style={{ maxWidth: "480px", margin: "0 auto" }}>
                    <form onSubmit={handleSubmit}>
                        <div
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
                                    fontSize: "1.2rem",
                                    fontWeight: 700,
                                    color: "#1e3c0e",
                                    marginBottom: "2rem",
                                    paddingBottom: "1rem",
                                    borderBottom:
                                        "2px solid rgba(180,140,80,0.2)",
                                    textAlign: "center",
                                }}
                            >
                                会員ログイン
                            </h2>

                            {error && (
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: "0.6rem",
                                        backgroundColor: "rgba(160,48,32,0.08)",
                                        border: "1px solid rgba(160,48,32,0.2)",
                                        borderRadius: "3px",
                                        padding: "1rem",
                                        marginBottom: "1.5rem",
                                    }}
                                >
                                    <FaExclamationCircle
                                        size={16}
                                        color="#a03020"
                                        style={{
                                            flexShrink: 0,
                                            marginTop: "2px",
                                        }}
                                    />
                                    <p
                                        style={{
                                            fontSize: "0.82rem",
                                            color: "#a03020",
                                            margin: 0,
                                            lineHeight: 1.7,
                                        }}
                                    >
                                        {error}
                                    </p>
                                </div>
                            )}

                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "1.25rem",
                                }}
                            >
                                <div>
                                    <label style={labelStyle}>
                                        メールアドレス{" "}
                                        <span style={{ color: "#a03020" }}>
                                            *
                                        </span>
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        onFocus={() => setFocusedField("email")}
                                        onBlur={() => setFocusedField("")}
                                        placeholder="example@email.com"
                                        required
                                        style={focusedInputStyle("email")}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>
                                        パスワード{" "}
                                        <span style={{ color: "#a03020" }}>
                                            *
                                        </span>
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        onFocus={() =>
                                            setFocusedField("password")
                                        }
                                        onBlur={() => setFocusedField("")}
                                        placeholder="パスワードを入力"
                                        required
                                        style={focusedInputStyle("password")}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                style={{
                                    width: "100%",
                                    marginTop: "2rem",
                                    backgroundColor: "#5c2e12",
                                    color: "#f0e8d0",
                                    padding: "1rem",
                                    borderRadius: "3px",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: "1rem",
                                    fontWeight: 700,
                                    fontFamily: "'Noto Sans JP', sans-serif",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "0.5rem",
                                }}
                            >
                                <FaSignInAlt size={16} />
                                ログイン
                            </button>
                        </div>
                    </form>

                    {/* Demo credentials card */}
                    <div
                        style={{
                            marginTop: "1.25rem",
                            backgroundColor: "rgba(45,106,30,0.06)",
                            borderRadius: "4px",
                            padding: "1.5rem",
                            border: "1px solid rgba(45,106,30,0.18)",
                        }}
                    >
                        <p
                            style={{
                                fontSize: "0.78rem",
                                fontWeight: 700,
                                color: "#1e3c0e",
                                marginBottom: "0.85rem",
                                textAlign: "center",
                                letterSpacing: "0.04em",
                            }}
                        >
                            デモ用アカウント
                        </p>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.4rem",
                                marginBottom: "1rem",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.75rem",
                                    fontSize: "0.82rem",
                                    color: "#2c1e10",
                                }}
                            >
                                <span
                                    style={{
                                        flexShrink: 0,
                                        width: "5.5rem",
                                        fontSize: "0.72rem",
                                        fontWeight: 700,
                                        color: "#5a4838",
                                    }}
                                >
                                    メール
                                </span>
                                <code
                                    style={{
                                        fontFamily: "monospace",
                                        backgroundColor:
                                            "rgba(255,255,255,0.6)",
                                        padding: "0.25rem 0.6rem",
                                        borderRadius: "3px",
                                        fontSize: "0.82rem",
                                        color: "#5c2e12",
                                        letterSpacing: "0.02em",
                                        userSelect: "all",
                                    }}
                                >
                                    登録済みのメールアドレス
                                </code>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.75rem",
                                    fontSize: "0.82rem",
                                    color: "#2c1e10",
                                }}
                            >
                                <span
                                    style={{
                                        flexShrink: 0,
                                        width: "5.5rem",
                                        fontSize: "0.72rem",
                                        fontWeight: 700,
                                        color: "#5a4838",
                                    }}
                                >
                                    パスワード
                                </span>
                                <code
                                    style={{
                                        fontFamily: "monospace",
                                        backgroundColor:
                                            "rgba(255,255,255,0.6)",
                                        padding: "0.25rem 0.6rem",
                                        borderRadius: "3px",
                                        fontSize: "0.82rem",
                                        color: "#5c2e12",
                                        letterSpacing: "0.02em",
                                        userSelect: "all",
                                    }}
                                >
                                    登録済みのパスワード
                                </code>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setError("")}
                            style={{
                                width: "100%",
                                background:
                                    "linear-gradient(135deg, #1b2f0e, #254510)",
                                color: "#f0e8d0",
                                padding: "0.75rem 1rem",
                                borderRadius: "3px",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "0.85rem",
                                fontWeight: 700,
                                fontFamily: "'Noto Sans JP', sans-serif",
                                letterSpacing: "0.04em",
                            }}
                        >
                            会員情報でログインしてください
                        </button>
                    </div>

                    {/* Registration CTA */}
                    <div
                        style={{
                            marginTop: "1.5rem",
                            backgroundColor: "#1b2f0e",
                            borderRadius: "4px",
                            padding: "2rem",
                            textAlign: "center",
                            border: "1px solid rgba(212,176,112,0.18)",
                        }}
                    >
                        <h3
                            style={{
                                fontFamily: "'Noto Serif JP', serif",
                                fontSize: "1rem",
                                fontWeight: 700,
                                color: "#f0e8d0",
                                marginBottom: "0.75rem",
                            }}
                        >
                            会員登録がお済みでない方
                        </h3>
                        <p
                            style={{
                                fontSize: "0.82rem",
                                color: "rgba(240,232,208,0.7)",
                                lineHeight: 1.85,
                                marginBottom: "1.25rem",
                            }}
                        >
                            初めてご利用の方は、会員登録（無料）をお願いいたします。
                            <br />
                            ご予約がスムーズになります。
                        </p>
                        <Link
                            to={`/register?redirect=${encodeURIComponent(redirect)}`}
                            style={{
                                display: "inline-block",
                                backgroundColor: "rgba(240,232,208,0.12)",
                                color: "#f0e8d0",
                                padding: "0.875rem 2rem",
                                borderRadius: "3px",
                                textDecoration: "none",
                                fontWeight: 700,
                                fontSize: "0.92rem",
                                border: "1px solid rgba(240,232,208,0.25)",
                            }}
                        >
                            会員登録はこちら
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
