import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  FaChevronRight,
  FaChevronLeft,
  FaPaperPlane,
  FaEnvelopeOpenText,
  FaCheckCircle,
  FaUserPlus,
} from "react-icons/fa";
import { useAuth, type UserProfile } from "../context/AuthContext";
import { BirthDatePicker } from "../components/BirthDatePicker";

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

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "0.85rem",
  fontWeight: 700,
  color: "#7a4020",
  marginBottom: "1rem",
  paddingBottom: "0.5rem",
  borderBottom: "1px solid rgba(180,140,80,0.15)",
};

// Step indicator
function StepIndicator({ current }: { current: number }) {
  const steps = [
    { num: 1, label: "メール仮登録" },
    { num: 2, label: "メール確認" },
    { num: 3, label: "本登録入力" },
    { num: 4, label: "入力確認" },
    { num: 5, label: "登録完了" },
  ];
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "0.25rem",
        marginBottom: "2rem",
        flexWrap: "wrap",
      }}
    >
      {steps.map((s, i) => (
        <div key={s.num} style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.72rem",
                fontWeight: 700,
                backgroundColor:
                  current > s.num ? "#1e3c0e" : current === s.num ? "#5c2e12" : "#d8cbb8",
                color: current >= s.num ? "#f0e8d0" : "#8a7a68",
                transition: "all 0.3s",
              }}
            >
              {current > s.num ? "✓" : s.num}
            </div>
            <div
              style={{
                fontSize: "0.6rem",
                color: current === s.num ? "#5c2e12" : "#8a7a68",
                marginTop: "0.25rem",
                fontWeight: current === s.num ? 700 : 400,
                whiteSpace: "nowrap",
              }}
            >
              {s.label}
            </div>
          </div>
          {i < steps.length - 1 && (
            <div
              style={{
                width: "24px",
                height: "2px",
                backgroundColor: current > s.num ? "#1e3c0e" : "#d8cbb8",
                marginBottom: "1rem",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function Register() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [focusedField, setFocusedField] = useState("");
  const { register: authRegister, setPendingEmail } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/reservation";

  const [profile, setProfile] = useState({
    lastName: "",
    firstName: "",
    lastNameKana: "",
    firstNameKana: "",
    phone: "",
    postalCode: "",
    address: "",
    password: "",
    passwordConfirm: "",
    birthDate: "",
    hasPet: "no",
    petBreed: "",
    petBreed2: "",
    hasFamily: "individual",
    familyDetail: "",
    concerns: "",
    howFound: "",
    expectations: "",
  });

  const focusedInputStyle = (field: string): React.CSSProperties => ({
    ...inputStyle,
    borderColor: focusedField === field ? "#1e3c0e" : "rgba(30,60,14,0.2)",
    boxShadow: focusedField === field ? "0 0 0 3px rgba(30,60,14,0.1)" : "none",
  });

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "hasPet") {
      if (value === "no") {
        setProfile((prev) => ({ ...prev, hasPet: value, petBreed: "", petBreed2: "" }));
      } else if (value !== "small2" && value !== "large2") {
        setProfile((prev) => ({ ...prev, hasPet: value, petBreed2: "" }));
      } else {
        setProfile((prev) => ({ ...prev, hasPet: value }));
      }
    } else {
      setProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Step 1: Email provisional registration
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPendingEmail(email);
    setStep(2);
    window.scrollTo(0, 0);
  };

  // Step 2 → Step 3: Simulate email link click
  const handleEmailConfirm = () => {
    setStep(3);
    window.scrollTo(0, 0);
  };

  // Step 3: Main registration form submit → confirm
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.password !== profile.passwordConfirm) {
      alert("パスワードが一致しません。");
      return;
    }
    setStep(4);
    window.scrollTo(0, 0);
  };

  // Step 4: Confirm → Complete
  const handleConfirm = () => {
    const userData: UserProfile = {
      lastName: profile.lastName,
      firstName: profile.firstName,
      lastNameKana: profile.lastNameKana,
      firstNameKana: profile.firstNameKana,
      email,
      phone: profile.phone,
      address: profile.address,
      password: profile.password,
      birthDate: profile.birthDate,
      hasPet: profile.hasPet,
      petBreed: profile.petBreed,
      petBreed2: profile.hasPet === "small2" ? profile.petBreed2 : undefined,
      hasFamily: profile.hasFamily,
      concerns: profile.concerns,
      howFound: profile.howFound,
      expectations: profile.expectations,
    };
    authRegister(userData);
    setStep(5);
    window.scrollTo(0, 0);
  };

  const petLabel = (val: string) => {
    const map: Record<string, string> = {
      no: "なし",
      small: "小型犬1頭",
      small2: "小型犬2頭",
      large: "大型犬1頭",
      large2: "大型犬2頭",
    };
    return map[val] || val;
  };

  const howFoundLabel = (val: string) => {
    const map: Record<string, string> = {
      search: "検索エンジン",
      sns: "SNS（Instagram・X等）",
      friend: "知人の紹介",
      media: "雑誌・テレビ",
      other: "その他",
    };
    return map[val] || val;
  };

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
          Registration
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
          会員登録
        </h1>
        <p style={{ color: "rgba(240,232,208,0.7)", marginTop: "1rem", fontSize: "0.92rem" }}>
          {step <= 2 && "メールアドレスで仮登録を行います"}
          {step === 3 && "お客様情報をご入力ください"}
          {step === 4 && "入力内容をご確認ください"}
          {step === 5 && "会員登録が完了しました"}
        </p>
      </div>

      <section style={{ backgroundColor: "#f2e8d0", padding: "4rem 1.5rem" }}>
        <div style={{ maxWidth: "580px", margin: "0 auto" }}>
          <StepIndicator current={step} />

          {/* ─── Step 1: Email Input ─── */}
          {step === 1 && (
            <form onSubmit={handleEmailSubmit}>
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
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    color: "#1e3c0e",
                    marginBottom: "1rem",
                    textAlign: "center",
                  }}
                >
                  メールアドレス仮登録
                </h2>
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "#5a4838",
                    lineHeight: 1.9,
                    marginBottom: "1.75rem",
                    textAlign: "center",
                  }}
                >
                  ご登録用のメールアドレスを入力してください。
                  <br />
                  確認メールをお送りいたします。
                </p>
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={labelStyle}>
                    メールアドレス <span style={{ color: "#a03020" }}>*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField("")}
                    placeholder="example@email.com"
                    required
                    style={focusedInputStyle("email")}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    width: "100%",
                    backgroundColor: "#5c2e12",
                    color: "#f0e8d0",
                    padding: "1rem",
                    borderRadius: "3px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    fontFamily: "'Noto Sans JP', sans-serif",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  <FaPaperPlane size={14} />
                  確認メールを送信する
                </button>
                <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
                  <Link
                    to={`/login?redirect=${encodeURIComponent(redirect)}`}
                    style={{ fontSize: "0.82rem", color: "#7a4020", fontWeight: 700, textDecoration: "none" }}
                  >
                    ← すでに会員の方はログイン
                  </Link>
                </div>
              </div>
            </form>
          )}

          {/* ─── Step 2: Email Sent (Simulation) ─── */}
          {step === 2 && (
            <div
              style={{
                backgroundColor: "#faf5e8",
                borderRadius: "4px",
                padding: "2.5rem",
                boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
                border: "1px solid rgba(180,140,80,0.15)",
                textAlign: "center",
              }}
            >
              <FaEnvelopeOpenText size={48} color="#1e3c0e" style={{ marginBottom: "1.25rem" }} />
              <h2
                style={{
                  fontFamily: "'Noto Serif JP', serif",
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  color: "#1e3c0e",
                  marginBottom: "1rem",
                }}
              >
                確認メールを送信しました
              </h2>
              <p style={{ fontSize: "0.88rem", color: "#5a4838", lineHeight: 1.9, marginBottom: "0.5rem" }}>
                以下のメールアドレス宛に確認メールをお送りしました。
              </p>
              <p
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: "#1e3c0e",
                  marginBottom: "1.25rem",
                  padding: "0.6rem 1rem",
                  backgroundColor: "rgba(30,60,14,0.06)",
                  borderRadius: "3px",
                  display: "inline-block",
                }}
              >
                {email}
              </p>
              <p style={{ fontSize: "0.82rem", color: "#8a7868", lineHeight: 1.9, marginBottom: "2rem" }}>
                メール本文に記載のURLをクリックして、本登録にお進みください。
                <br />
                ※ メールが届かない場合は迷惑メールフォルダをご確認ください。
              </p>

              <div
                style={{
                  backgroundColor: "#f2e8d0",
                  borderRadius: "3px",
                  padding: "1.25rem",
                  marginBottom: "1.5rem",
                  border: "1px solid rgba(180,140,80,0.15)",
                }}
              >
                <p style={{ fontSize: "0.75rem", color: "#8a7868", marginBottom: "0.75rem" }}>
                  ※ デモ環境のため、下のボタンで本登録に進めます
                </p>
                <button
                  onClick={handleEmailConfirm}
                  style={{
                    backgroundColor: "#1e3c0e",
                    color: "#f0e8d0",
                    padding: "0.75rem 1.5rem",
                    borderRadius: "3px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    fontFamily: "'Noto Sans JP', sans-serif",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  メール内のURLをクリック（シミュレーション）
                  <FaChevronRight size={12} />
                </button>
              </div>
            </div>
          )}

          {/* ─── Step 3: Main Registration Form ─── */}
          {step === 3 && (
            <form onSubmit={handleProfileSubmit}>
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
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    color: "#1e3c0e",
                    marginBottom: "0.5rem",
                    textAlign: "center",
                  }}
                >
                  本会員登録
                </h2>
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "#8a7868",
                    textAlign: "center",
                    marginBottom: "2rem",
                  }}
                >
                  登録メール：{email}
                </p>

                {/* ── Basic Info ── */}
                <div style={{ marginBottom: "1.75rem" }}>
                  <h3 style={sectionTitleStyle}>基本情報</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                      <div>
                        <label style={labelStyle}>姓 <span style={{ color: "#a03020" }}>*</span></label>
                        <input
                          type="text"
                          name="lastName"
                          value={profile.lastName}
                          onChange={handleProfileChange}
                          onFocus={() => setFocusedField("lastName")}
                          onBlur={() => setFocusedField("")}
                          placeholder="山田"
                          required
                          style={focusedInputStyle("lastName")}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>名 <span style={{ color: "#a03020" }}>*</span></label>
                        <input
                          type="text"
                          name="firstName"
                          value={profile.firstName}
                          onChange={handleProfileChange}
                          onFocus={() => setFocusedField("firstName")}
                          onBlur={() => setFocusedField("")}
                          placeholder="太郎"
                          required
                          style={focusedInputStyle("firstName")}
                        />
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                      <div>
                        <label style={labelStyle}>姓（ふりがな） <span style={{ color: "#a03020" }}>*</span></label>
                        <input
                          type="text"
                          name="lastNameKana"
                          value={profile.lastNameKana}
                          onChange={handleProfileChange}
                          onFocus={() => setFocusedField("lastNameKana")}
                          onBlur={() => setFocusedField("")}
                          placeholder="やまだ"
                          required
                          style={focusedInputStyle("lastNameKana")}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>名（ふりがな） <span style={{ color: "#a03020" }}>*</span></label>
                        <input
                          type="text"
                          name="firstNameKana"
                          value={profile.firstNameKana}
                          onChange={handleProfileChange}
                          onFocus={() => setFocusedField("firstNameKana")}
                          onBlur={() => setFocusedField("")}
                          placeholder="たろう"
                          required
                          style={focusedInputStyle("firstNameKana")}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>
                        電話番号 <span style={{ color: "#a03020" }}>*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={profile.phone}
                        onChange={handleProfileChange}
                        onFocus={() => setFocusedField("phone")}
                        onBlur={() => setFocusedField("")}
                        placeholder="090-0000-0000"
                        required
                        style={focusedInputStyle("phone")}
                      />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "0.75rem" }}>
                      <div>
                        <label style={labelStyle}>郵便番号</label>
                        <input
                          type="text"
                          name="postalCode"
                          value={profile.postalCode}
                          onChange={handleProfileChange}
                          placeholder="000-0000"
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>
                          住所 <span style={{ color: "#a03020" }}>*</span>
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={profile.address}
                          onChange={handleProfileChange}
                          onFocus={() => setFocusedField("address")}
                          onBlur={() => setFocusedField("")}
                          placeholder="東京都渋谷区..."
                          required
                          style={focusedInputStyle("address")}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>
                        生年月日
                      </label>
                      <BirthDatePicker
                        value={profile.birthDate}
                        onChange={(val) => setProfile((prev) => ({ ...prev, birthDate: val }))}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                </div>

                {/* ── Password ── */}
                <div style={{ marginBottom: "1.75rem" }}>
                  <h3 style={sectionTitleStyle}>パスワード設定</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                      <label style={labelStyle}>
                        パスワード <span style={{ color: "#a03020" }}>*</span>
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={profile.password}
                        onChange={handleProfileChange}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField("")}
                        placeholder="8文字以上"
                        required
                        minLength={8}
                        style={focusedInputStyle("password")}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>
                        パスワード（確認） <span style={{ color: "#a03020" }}>*</span>
                      </label>
                      <input
                        type="password"
                        name="passwordConfirm"
                        value={profile.passwordConfirm}
                        onChange={handleProfileChange}
                        onFocus={() => setFocusedField("passwordConfirm")}
                        onBlur={() => setFocusedField("")}
                        placeholder="もう一度入力してください"
                        required
                        minLength={8}
                        style={focusedInputStyle("passwordConfirm")}
                      />
                      {profile.password &&
                        profile.passwordConfirm &&
                        profile.password !== profile.passwordConfirm && (
                          <p style={{ fontSize: "0.75rem", color: "#a03020", marginTop: "0.3rem" }}>
                            パスワードが一致しません
                          </p>
                        )}
                    </div>
                  </div>
                </div>

                {/* ── Pet & Family ── */}
                <div style={{ marginBottom: "1.75rem" }}>
                  <h3 style={sectionTitleStyle}>ペット・ご家族</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }} className="form-2col">
                      <div>
                        <label style={labelStyle}>ペットの有無</label>
                        <select
                          name="hasPet"
                          value={profile.hasPet}
                          onChange={handleProfileChange}
                          style={inputStyle}
                        >
                          <option value="no">なし</option>
                          <option value="small">小型犬1頭</option>
                          <option value="small2">小型犬2頭</option>
                          <option value="large">大型犬1頭</option>
                          <option value="large2">大型犬2頭</option>
                        </select>
                      </div>
                      {(profile.hasPet === "small" || profile.hasPet === "large") && (
                        <div>
                          <label style={labelStyle}>犬種</label>
                          <input
                            type="text"
                            name="petBreed"
                            value={profile.petBreed}
                            onChange={handleProfileChange}
                            placeholder="例：トイプードル"
                            style={inputStyle}
                          />
                        </div>
                      )}
                    </div>
                    {(profile.hasPet === "small2" || profile.hasPet === "large2") && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <div>
                          <label style={{ ...labelStyle, display: "flex", alignItems: "center" }}>
                            <span style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: "#5c2e12",
                              color: "#f0e8d0",
                              width: "18px",
                              height: "18px",
                              borderRadius: "50%",
                              fontSize: "0.65rem",
                              fontWeight: 700,
                              marginRight: "0.4rem",
                              flexShrink: 0,
                            }}>1</span>
                            1頭目 ─ 犬種
                          </label>
                          <input
                            type="text"
                            name="petBreed"
                            value={profile.petBreed}
                            onChange={handleProfileChange}
                            placeholder="例：トイプードル"
                            style={inputStyle}
                          />
                        </div>
                        <div>
                          <label style={{ ...labelStyle, display: "flex", alignItems: "center" }}>
                            <span style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: "#5c2e12",
                              color: "#f0e8d0",
                              width: "18px",
                              height: "18px",
                              borderRadius: "50%",
                              fontSize: "0.65rem",
                              fontWeight: 700,
                              marginRight: "0.4rem",
                              flexShrink: 0,
                            }}>2</span>
                            2頭目 ─ 犬種
                          </label>
                          <input
                            type="text"
                            name="petBreed2"
                            value={profile.petBreed2}
                            onChange={handleProfileChange}
                            placeholder="例：チワワ"
                            style={inputStyle}
                          />
                        </div>
                      </div>
                    )}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }} className="form-2col">
                      <div>
                        <label style={labelStyle}>利用頻度の高い宿泊形態</label>
                        <select
                          name="hasFamily"
                          value={profile.hasFamily}
                          onChange={handleProfileChange}
                          style={inputStyle}
                        >
                          <option value="individual">個人</option>
                          <option value="friends">友人</option>
                          <option value="couple">カップル</option>
                          <option value="married">ご夫婦</option>
                          <option value="family">ご家族（お子さんあり）</option>
                        </select>
                      </div>
                      {profile.hasFamily === "family" && (
                        <div>
                          <label style={labelStyle}>お子様の年齢など</label>
                          <input
                            type="text"
                            name="familyDetail"
                            value={profile.familyDetail}
                            onChange={handleProfileChange}
                            placeholder="例：小学生2人"
                            style={inputStyle}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Additional Info ── */}
                <div style={{ marginBottom: "1.75rem" }}>
                  <h3 style={sectionTitleStyle}>その他のご情報</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                      <label style={labelStyle}>宿泊の際に気になること</label>
                      <textarea
                        name="concerns"
                        value={profile.concerns}
                        onChange={handleProfileChange}
                        placeholder="アレルギー、虫が苦手、静かに過ごしたい等"
                        rows={3}
                        style={{
                          ...inputStyle,
                          resize: "vertical",
                          fontFamily: "'Noto Sans JP', sans-serif",
                        }}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>何でこのログハウスを知りましたか？</label>
                      <select
                        name="howFound"
                        value={profile.howFound}
                        onChange={handleProfileChange}
                        style={inputStyle}
                      >
                        <option value="">選択してください</option>
                        <option value="search">検索エンジン</option>
                        <option value="sns">SNS（Instagram・X等）</option>
                        <option value="friend">知人の紹介</option>
                        <option value="media">雑誌・テレビ</option>
                        <option value="other">その他</option>
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>エルボスケに期待すること</label>
                      <textarea
                        name="expectations"
                        value={profile.expectations}
                        onChange={handleProfileChange}
                        placeholder="自然体験、ペットとの時間、リモートワーク等"
                        rows={3}
                        style={{
                          ...inputStyle,
                          resize: "vertical",
                          fontFamily: "'Noto Sans JP', sans-serif",
                        }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={profile.password !== profile.passwordConfirm}
                  style={{
                    width: "100%",
                    backgroundColor:
                      profile.password === profile.passwordConfirm ? "#5c2e12" : "#c8b8a0",
                    color:
                      profile.password === profile.passwordConfirm ? "#f0e8d0" : "#a09080",
                    padding: "1rem",
                    borderRadius: "3px",
                    border: "none",
                    cursor:
                      profile.password === profile.passwordConfirm ? "pointer" : "not-allowed",
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    fontFamily: "'Noto Sans JP', sans-serif",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  入力内容を確認する
                  <FaChevronRight size={13} />
                </button>
              </div>
            </form>
          )}

          {/* ─── Step 4: Confirmation ─── */}
          {step === 4 && (
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
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  color: "#1e3c0e",
                  marginBottom: "2rem",
                  textAlign: "center",
                }}
              >
                登録内容のご確認
              </h2>

              {[
                { heading: "基本情報", items: [
                  { label: "お名前", value: `${profile.lastName} ${profile.firstName}` },
                  { label: "ふりがな", value: `${profile.lastNameKana} ${profile.firstNameKana}` },
                  { label: "メールアドレス", value: email },
                  { label: "電話番号", value: profile.phone },
                  { label: "住所", value: `${profile.postalCode ? `〒${profile.postalCode} ` : ""}${profile.address}` },
                  { label: "生年月日", value: profile.birthDate
                    ? profile.birthDate.replace(/^(\d{4})-(\d{1,2})-(\d{1,2})$/, (_, y, m, d) => `${y}年${parseInt(m)}月${parseInt(d)}日`)
                    : "未記入" },
                ]},
                { heading: "ペット・ご家族", items: [
                  { label: "ペット", value: (() => {
                    if (profile.hasPet === "no") return "なし";
                    if (profile.hasPet === "small2") {
                      const breeds = [profile.petBreed, profile.petBreed2].filter(Boolean);
                      return breeds.length > 0 ? `小型犬2頭（${breeds.join(" / ")}）` : "小型犬2頭";
                    }
                    return `${petLabel(profile.hasPet)}${profile.petBreed ? `（${profile.petBreed}）` : ""}`;
                  })() },
                  { label: "利用頻度の高い宿泊形態", value: (() => {
                    const familyLabels: Record<string, string> = {
                      individual: "個人",
                      friends: "友人",
                      couple: "カップル",
                      married: "ご夫婦",
                      family: "ご家族（お子さんあり）",
                    };
                    const label = familyLabels[profile.hasFamily] || profile.hasFamily;
                    return profile.hasFamily === "family" && profile.familyDetail
                      ? `${label}（${profile.familyDetail}）`
                      : label;
                  })() },
                ]},
                { heading: "その他", items: [
                  { label: "気になること", value: profile.concerns || "未記入" },
                  { label: "きっかけ", value: profile.howFound ? howFoundLabel(profile.howFound) : "未選択" },
                  { label: "期待すること", value: profile.expectations || "未記入" },
                ]},
              ].map((section) => (
                <div key={section.heading} style={{ marginBottom: "1.5rem" }}>
                  <h3 style={sectionTitleStyle}>{section.heading}</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                    {section.items.map((item) => (
                      <div
                        key={item.label}
                        style={{
                          display: "flex",
                          gap: "1rem",
                          fontSize: "0.85rem",
                          padding: "0.5rem 0",
                          borderBottom: "1px solid rgba(180,140,80,0.08)",
                        }}
                      >
                        <span style={{ color: "#8a7868", minWidth: "110px", flexShrink: 0 }}>
                          {item.label}
                        </span>
                        <span style={{ color: "#2c1e10", fontWeight: 500 }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "2rem" }}>
                <button
                  onClick={() => { setStep(3); window.scrollTo(0, 0); }}
                  style={{
                    flex: 1,
                    backgroundColor: "transparent",
                    color: "#5c2e12",
                    padding: "1rem",
                    borderRadius: "3px",
                    border: "1px solid #5c2e12",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    fontFamily: "'Noto Sans JP', sans-serif",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  <FaChevronLeft size={12} />
                  修正する
                </button>
                <button
                  onClick={handleConfirm}
                  style={{
                    flex: 2,
                    backgroundColor: "#5c2e12",
                    color: "#f0e8d0",
                    padding: "1rem",
                    borderRadius: "3px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    fontFamily: "'Noto Sans JP', sans-serif",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  <FaUserPlus size={14} />
                  この内容で登録する
                </button>
              </div>
            </div>
          )}

          {/* ─── Step 5: Complete ─── */}
          {step === 5 && (
            <div
              style={{
                backgroundColor: "#faf5e8",
                borderRadius: "4px",
                padding: "3rem 2.5rem",
                boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
                border: "1px solid rgba(180,140,80,0.15)",
                textAlign: "center",
              }}
            >
              <FaCheckCircle size={56} color="#1e3c0e" style={{ marginBottom: "1.5rem" }} />
              <h2
                style={{
                  fontFamily: "'Noto Serif JP', serif",
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  color: "#1e3c0e",
                  marginBottom: "1rem",
                }}
              >
                会員登録が完了しました
              </h2>
              <p style={{ fontSize: "0.9rem", color: "#5a4838", lineHeight: 1.9, marginBottom: "0.5rem" }}>
                <strong>{profile.lastName} {profile.firstName}</strong> 様、ようこそ！
              </p>
              <p style={{ fontSize: "0.85rem", color: "#8a7868", lineHeight: 1.9, marginBottom: "2rem" }}>
                ログイン状態でご予約に進めます。
              </p>
              <Link
                to="/reservation"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  backgroundColor: "#5c2e12",
                  color: "#f0e8d0",
                  padding: "1rem 2rem",
                  borderRadius: "3px",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  border: "1px solid rgba(212,176,112,0.2)",
                }}
              >
                ご予約へ進む
                <FaChevronRight size={13} />
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}