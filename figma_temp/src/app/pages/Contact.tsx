import { useState } from "react";
import { Link } from "react-router";
import {
  FaChevronRight,
  FaCheckCircle,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
} from "react-icons/fa";

interface ContactFormState {
  name: string;
  email: string;
  phone: string;
  category: string;
  message: string;
}

const initialState: ContactFormState = {
  name: "",
  email: "",
  phone: "",
  category: "general",
  message: "",
};

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

export function Contact() {
  const [form, setForm] = useState<ContactFormState>(initialState);
  const [submitted, setSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState<string>("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    window.scrollTo(0, 0);
  };

  const focusedInputStyle = (field: string): React.CSSProperties => ({
    ...inputStyle,
    borderColor: focusedField === field ? "#1e3c0e" : "rgba(30,60,14,0.2)",
    boxShadow: focusedField === field ? "0 0 0 3px rgba(30,60,14,0.1)" : "none",
  });

  if (submitted) {
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
            Contact
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
            お問い合わせ
          </h1>
        </div>
        <section style={{ backgroundColor: "#f2e8d0", padding: "5rem 1.5rem" }}>
          <div
            style={{
              maxWidth: "580px",
              margin: "0 auto",
              textAlign: "center",
              backgroundColor: "#faf5e8",
              borderRadius: "4px",
              padding: "3.5rem 2rem",
              boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
              border: "1px solid rgba(180,140,80,0.15)",
            }}
          >
            <FaCheckCircle size={56} color="#1e3c0e" style={{ marginBottom: "1.5rem" }} />
            <h2
              style={{
                fontFamily: "'Noto Serif JP', serif",
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#1e3c0e",
                marginBottom: "1rem",
              }}
            >
              お問い合わせありがとうございます
            </h2>
            <p style={{ color: "#5a4838", lineHeight: 2, fontSize: "0.95rem", marginBottom: "0.75rem" }}>
              <strong>{form.name}</strong> 様からのご連絡を承りました。
            </p>
            <p style={{ color: "#5a4838", lineHeight: 2, fontSize: "0.9rem", marginBottom: "2rem" }}>
              2〜3営業日以内に <strong>{form.email}</strong> 宛にご連絡いたします。
            </p>
            <Link
              to="/"
              style={{
                display: "inline-block",
                backgroundColor: "#1e3c0e",
                color: "#f0e8d0",
                padding: "0.875rem 2rem",
                borderRadius: "3px",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "0.95rem",
              }}
            >
              トップページへ戻る
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
          Contact
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
          お問い合わせ
        </h1>
        <p style={{ color: "rgba(240,232,208,0.7)", marginTop: "1rem", fontSize: "0.92rem" }}>
          ご質問・ご相談など、お気軽にお問い合わせください
        </p>
      </div>

      <section style={{ backgroundColor: "#f2e8d0", padding: "4rem 1.5rem" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "2rem", alignItems: "start" }}
            className="contact-grid"
          >
            {/* Form */}
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
                    borderBottom: "2px solid rgba(180,140,80,0.2)",
                  }}
                >
                  お問い合わせフォーム
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  {/* Name */}
                  <div>
                    <label style={labelStyle}>
                      お名前 <span style={{ color: "#a03020" }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("name")}
                      onBlur={() => setFocusedField("")}
                      placeholder="山田 太郎"
                      required
                      style={focusedInputStyle("name")}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label style={labelStyle}>
                      メールアドレス <span style={{ color: "#a03020" }}>*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField("")}
                      placeholder="example@email.com"
                      required
                      style={focusedInputStyle("email")}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label style={labelStyle}>電話番号</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("phone")}
                      onBlur={() => setFocusedField("")}
                      placeholder="090-0000-0000"
                      style={focusedInputStyle("phone")}
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label style={labelStyle}>
                      お問い合わせ種別 <span style={{ color: "#a03020" }}>*</span>
                    </label>
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      style={inputStyle}
                    >
                      <option value="general">一般的なご質問</option>
                      <option value="facility">施設・設備について</option>
                      <option value="pet">ペット同伴について</option>
                      <option value="experience">体験プログラムについて</option>
                      <option value="access">アクセス・送迎について</option>
                      <option value="other">その他</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label style={labelStyle}>
                      お問い合わせ内容 <span style={{ color: "#a03020" }}>*</span>
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("message")}
                      onBlur={() => setFocusedField("")}
                      placeholder="ご質問やご相談の内容をご記入ください"
                      rows={7}
                      required
                      style={{
                        ...focusedInputStyle("message"),
                        resize: "vertical",
                        fontFamily: "'Noto Sans JP', sans-serif",
                      }}
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
                    transition: "background-color 0.2s",
                  }}
                >
                  お問い合わせを送信する <FaChevronRight size={15} />
                </button>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#8a7868",
                    textAlign: "center",
                    marginTop: "0.75rem",
                  }}
                >
                  ※ 2〜3営業日以内にメールにてご返答いたします
                </p>
              </div>
            </form>

            {/* Sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Contact Info */}
              <div
                style={{
                  backgroundColor: "#1b2f0e",
                  borderRadius: "4px",
                  padding: "1.5rem",
                  color: "#f0e8d0",
                  border: "1px solid rgba(212,176,112,0.18)",
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Noto Serif JP', serif",
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "#d4b070",
                    marginBottom: "1.25rem",
                  }}
                >
                  連絡先情報
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
                    <FaEnvelope size={14} color="#d4b070" style={{ flexShrink: 0, marginTop: "3px" }} />
                    <div>
                      <p style={{ fontSize: "0.82rem", color: "rgba(240,232,208,0.9)", margin: 0 }}>
                        info@elbosque.jp
                      </p>
                      <p style={{ fontSize: "0.72rem", color: "rgba(240,232,208,0.5)", margin: "0.2rem 0 0" }}>
                        メールでのお問い合わせ
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
                    <FaMapMarkerAlt size={14} color="#d4b070" style={{ flexShrink: 0, marginTop: "3px" }} />
                    <div>
                      <p style={{ fontSize: "0.82rem", color: "rgba(240,232,208,0.9)", margin: 0, lineHeight: 1.7 }}>
                        〒399-1612
                        <br />
                        長野県下伊那郡阿南町新野3728-96
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
                    <FaClock size={14} color="#d4b070" style={{ flexShrink: 0, marginTop: "3px" }} />
                    <div>
                      <p style={{ fontSize: "0.82rem", color: "rgba(240,232,208,0.9)", margin: 0 }}>
                        返信：2〜3営業日以内
                      </p>
                      <p style={{ fontSize: "0.72rem", color: "rgba(240,232,208,0.5)", margin: "0.2rem 0 0" }}>
                        営業期間：3月〜12月
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reservation Link */}
              <div
                style={{
                  backgroundColor: "#faf5e8",
                  borderRadius: "4px",
                  padding: "1.5rem",
                  border: "1px solid rgba(180,140,80,0.18)",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Noto Serif JP', serif",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: "#1e3c0e",
                    marginBottom: "0.75rem",
                  }}
                >
                  ご予約はこちら
                </h3>
                <p style={{ fontSize: "0.82rem", color: "#5a4838", lineHeight: 1.85, marginBottom: "1rem" }}>
                  宿泊のご予約は専用の予約フォームからお申し込みいただけます。
                </p>
                <Link
                  to="/reservation"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.4rem",
                    backgroundColor: "#5c2e12",
                    color: "#f0e8d0",
                    padding: "0.75rem 1.25rem",
                    borderRadius: "3px",
                    textDecoration: "none",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    border: "1px solid rgba(212,176,112,0.2)",
                  }}
                >
                  予約フォームへ <FaChevronRight size={12} />
                </Link>
              </div>

              {/* FAQ Link */}
              <div
                style={{
                  backgroundColor: "#f2e8d0",
                  borderRadius: "4px",
                  padding: "1.5rem",
                  border: "1px solid rgba(180,140,80,0.15)",
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Noto Serif JP', serif",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: "#1e3c0e",
                    marginBottom: "0.75rem",
                  }}
                >
                  よくある質問
                </h3>
                <p style={{ fontSize: "0.82rem", color: "#5a4838", lineHeight: 1.85, marginBottom: "0.75rem" }}>
                  よくいただくご質問をまとめています。お問い合わせの前にぜひご確認ください。
                </p>
                <Link
                  to="/faq"
                  style={{
                    display: "block",
                    textAlign: "center",
                    color: "#7a4020",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  よくある質問を見る →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
