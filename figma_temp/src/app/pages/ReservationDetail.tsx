import { useState, useMemo } from "react";
import { Link, useSearchParams, useNavigate } from "react-router";
import {
  FaChevronRight,
  FaUser,
  FaCalendarAlt,
  FaPaw,
  FaConciergeBell,
  FaMountain,
  FaCommentDots,
  FaUsers,
  FaChevronLeft,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const WEEKDAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

const experienceList = [
  { id: "rice_plant", label: "田植え体験", season: "5月〜6月", price: "¥4,500/人" },
  { id: "rice_harvest", label: "稲刈り体験", season: "9月〜10月", price: "¥4,500/人" },
  { id: "firewood", label: "薪割り体験", season: "通年", price: "¥2,000/時間" },
  { id: "veggie", label: "夏野菜収穫体験", season: "7月〜8月", price: "¥1,500/カゴ" },
  { id: "bbq", label: "BBQグリルレンタル", season: "通年", price: "¥3,500/回" },
  { id: "starguide", label: "星空ガイド", season: "通年（晴天時）", price: "¥2,000/組", note: "ガイドなしは無料" },
];

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

interface DetailForm {
  guests: string;
  pets: string;
  petDetail: string;
  petDetail2: string;
  supportPlan: string;
  experiences: string[];
  message: string;
  agreement: boolean;
}

/** Format "2026-07-03" → "2026年7月3日（金）" */
function formatDateJP(dateStr: string): string {
  if (!dateStr) return "未定";
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const wd = WEEKDAY_NAMES[date.getDay()];
  return `${y}年${m}月${d}日（${wd}）`;
}

/** Calculate nights between two date strings */
function calcNights(ci: string, co: string): number {
  if (!ci || !co) return 0;
  const [y1, m1, d1] = ci.split("-").map(Number);
  const [y2, m2, d2] = co.split("-").map(Number);
  const a = new Date(y1, m1 - 1, d1);
  const b = new Date(y2, m2 - 1, d2);
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

/** Detect day-type label from checkin date */
function getDayTypeLabel(ci: string): string {
  if (!ci) return "";
  const [y, m, d] = ci.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const dow = date.getDay();
  // GW (Apr 29 - May 5), Obon (Aug 10-16), Year-end (Dec 28-31)
  if ((m === 4 && d >= 29) || (m === 5 && d <= 5)) return "特別日（GW）";
  if (m === 8 && d >= 10 && d <= 16) return "特別日（お盆）";
  if (m === 12 && d >= 28) return "特別日（年末）";
  // Fri(5) or Sat(6) → weekend rate
  if (dow === 5 || dow === 6) return "休前日（金・土）";
  return "平日（日〜木）";
}

export function ReservationDetail() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const checkin = searchParams.get("checkin") || "";
  const checkout = searchParams.get("checkout") || "";
  const [focusedField, setFocusedField] = useState("");

  const nights = useMemo(() => calcNights(checkin, checkout), [checkin, checkout]);
  const dayType = useMemo(() => getDayTypeLabel(checkin), [checkin]);

  const [form, setForm] = useState<DetailForm>({
    guests: "2",
    pets: "none",
    petDetail: user?.petBreed || "",
    petDetail2: "",
    supportPlan: "yes",
    experiences: [],
    message: "",
    agreement: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      if (name === "agreement") {
        setForm((prev) => ({ ...prev, agreement: checked }));
      } else {
        setForm((prev) => ({
          ...prev,
          experiences: checked
            ? [...prev.experiences, value]
            : prev.experiences.filter((x) => x !== value),
        }));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const focusedInputStyle = (field: string): React.CSSProperties => ({
    ...inputStyle,
    borderColor: focusedField === field ? "#1e3c0e" : "rgba(30,60,14,0.2)",
    boxShadow: focusedField === field ? "0 0 0 3px rgba(30,60,14,0.1)" : "none",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/reservation/confirm", {
      state: { form, checkin, checkout, nights, dayType },
    });
    window.scrollTo(0, 0);
  };

  const sectionDivider = (
    <div
      style={{
        height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(180,140,80,0.25), transparent)",
        margin: "0.5rem 0",
      }}
    />
  );

  const stepBadge = (num: number, label: string, icon: React.ReactNode) => (
    <h3
      style={{
        fontSize: "0.92rem",
        fontWeight: 700,
        color: "#1e3c0e",
        marginBottom: "1.25rem",
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
      }}
    >
      <span
        style={{
          backgroundColor: "#1e3c0e",
          color: "#f0e8d0",
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.72rem",
          flexShrink: 0,
        }}
      >
        {num}
      </span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
        {icon}
        {label}
      </span>
    </h3>
  );

  /* ======= Main form ======= */
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
          Reservation Detail
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
          予約詳細
        </h1>
        <p style={{ color: "rgba(240,232,208,0.7)", marginTop: "1rem", fontSize: "0.92rem" }}>
          宿泊の詳細をご入力ください
        </p>
      </div>

      <section style={{ backgroundColor: "#f2e8d0", padding: "4rem 1.5rem" }}>
        <div style={{ maxWidth: "920px", margin: "0 auto" }}>
          {/* Back to reservation link */}
          <button
            onClick={() => navigate("/reservation")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              color: "#7a4020",
              fontSize: "0.85rem",
              fontWeight: 700,
              fontFamily: "'Noto Sans JP', sans-serif",
              marginBottom: "1.25rem",
              padding: 0,
            }}
          >
            <FaChevronLeft size={11} />
            日程選択に戻る
          </button>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 300px",
              gap: "2rem",
              alignItems: "start",
            }}
            className="detail-grid"
          >
            {/* Main Form Column */}
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
                  予約詳細フォーム
                </h2>

                {/* Step 1: Guests */}
                <div style={{ marginBottom: "2rem" }}>
                  {stepBadge(1, "宿泊人数", <FaUsers size={14} color="#5c2e12" />)}
                  <div>
                    <label style={labelStyle}>
                      人数 <span style={{ color: "#a03020" }}>*</span>
                    </label>
                    <select
                      name="guests"
                      value={form.guests}
                      onChange={handleChange}
                      style={focusedInputStyle("guests")}
                      onFocus={() => setFocusedField("guests")}
                      onBlur={() => setFocusedField("")}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <option key={n} value={n}>
                          {n}名{n <= 5 ? "（推奨）" : `（追加料金 +¥${((n - 5) * 3000).toLocaleString()}）`}
                        </option>
                      ))}
                    </select>
                    <p style={{ fontSize: "0.72rem", color: "#8a7868", marginTop: "0.35rem" }}>
                      ※ 推奨1〜5名、最大10名まで。6名以上は1名追加につき¥3,000の追加料金が発生します
                    </p>
                  </div>
                </div>

                {sectionDivider}

                {/* Step 2: Pets */}
                <div style={{ marginBottom: "2rem", marginTop: "1.5rem" }}>
                  {stepBadge(2, "ペット同伴", <FaPaw size={14} color="#5c2e12" />)}
                  <div>
                    <label style={labelStyle}>ペット</label>
                    <select
                      name="pets"
                      value={form.pets}
                      onChange={handleChange}
                      style={inputStyle}
                    >
                      <option value="none">なし</option>
                      <option value="small1">小型犬1頭（+¥2,500）</option>
                      <option value="small2">小型犬2頭（+¥4,000）</option>
                      <option value="large1">大型犬1頭（+¥3,500）</option>
                      <option value="large2">大型犬2頭（+¥6,000）</option>
                    </select>
                  </div>

                  {/* Single dog: small1 or large1 */}
                  {(form.pets === "small1" || form.pets === "large1") && (
                    <div style={{ marginTop: "1rem" }}>
                      <label style={labelStyle}>犬種・名前</label>
                      <input
                        type="text"
                        name="petDetail"
                        value={form.petDetail}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("petDetail")}
                        onBlur={() => setFocusedField("")}
                        placeholder="例：トイプードル、ぽち"
                        style={focusedInputStyle("petDetail")}
                      />
                    </div>
                  )}

                  {/* Two dogs: small2 or large2 */}
                  {(form.pets === "small2" || form.pets === "large2") && (
                    <div
                      style={{
                        marginTop: "1rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.75rem",
                      }}
                    >
                      <div>
                        <label style={labelStyle}>
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
                          1頭目 ─ 犬種・名前
                        </label>
                        <input
                          type="text"
                          name="petDetail"
                          value={form.petDetail}
                          onChange={handleChange}
                          onFocus={() => setFocusedField("petDetail")}
                          onBlur={() => setFocusedField("")}
                          placeholder="例：トイプードル、ぽち"
                          style={focusedInputStyle("petDetail")}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>
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
                          2頭目 ─ 犬種・名前
                        </label>
                        <input
                          type="text"
                          name="petDetail2"
                          value={form.petDetail2}
                          onChange={handleChange}
                          onFocus={() => setFocusedField("petDetail2")}
                          onBlur={() => setFocusedField("")}
                          placeholder="例：チワワ、まる"
                          style={focusedInputStyle("petDetail2")}
                        />
                      </div>
                    </div>
                  )}

                  {form.pets !== "none" && (
                    <div
                      style={{
                        marginTop: "0.75rem",
                        backgroundColor: "rgba(196,122,48,0.06)",
                        border: "1px solid rgba(196,122,48,0.15)",
                        borderRadius: "3px",
                        padding: "0.75rem 1rem",
                      }}
                    >
                      <p style={{ fontSize: "0.75rem", color: "#7a4020", margin: 0, lineHeight: 1.7 }}>
                        ※ 小型犬2頭まで、または大型犬2頭まで。室内飼いに慣れたワンちゃんに限ります。
                        ケージ・トイレシートをご持参ください。
                      </p>
                    </div>
                  )}
                </div>

                {sectionDivider}

                {/* Step 3: Stay Support */}
                <div style={{ marginBottom: "2rem", marginTop: "1.5rem" }}>
                  {stepBadge(3, "滞在サポート（任意）", <FaConciergeBell size={14} color="#5c2e12" />)}
                  <div
                    style={{
                      backgroundColor: "#f2e8d0",
                      borderRadius: "3px",
                      padding: "1rem 1.25rem",
                      border: "1px solid rgba(180,140,80,0.15)",
                      marginBottom: "1rem",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.82rem",
                        color: "#5a4838",
                        lineHeight: 1.85,
                        margin: 0,
                      }}
                    >
                      送迎（最寄り駅⇔ログハウス）と食材買い出し代行が利用できるプランです。
                      <br />
                      {parseInt(form.guests) >= 5 ? (
                        <>
                          <span style={{ fontWeight: 700, color: "#5c2e12" }}>料金：¥13,000（¥8,000 + 送迎追加¥5,000）</span>
                          <br />
                          <span style={{ color: "#7a4020" }}>
                            ※ {form.guests}名のため追加車両手配費¥5,000が加算されます（人数不問・一律）
                          </span>
                        </>
                      ) : (
                        <span style={{ fontWeight: 700, color: "#5c2e12" }}>料金：¥8,000（1滞在あたり・任意）</span>
                      )}
                    </p>
                  </div>
                  <select
                    name="supportPlan"
                    value={form.supportPlan}
                    onChange={handleChange}
                    style={inputStyle}
                  >
                    <option value="yes">
                      {parseInt(form.guests) >= 5
                        ? `滞在サポートあり（+¥13,000：¥8,000 + 送迎追加¥5,000）`
                        : `滞在サポートあり（+¥8,000）`}
                    </option>
                    <option value="no">滞在サポートなし（送迎・買い出し不要）</option>
                  </select>
                </div>

                {sectionDivider}

                {/* Step 4: Experiences */}
                <div style={{ marginBottom: "2rem", marginTop: "1.5rem" }}>
                  {stepBadge(4, "体験オプション（任意・複数選択可）", <FaMountain size={14} color="#5c2e12" />)}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    {experienceList.map((exp) => {
                      const isSelected = form.experiences.includes(exp.label);
                      return (
                        <label
                          key={exp.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            padding: "0.85rem 1rem",
                            backgroundColor: isSelected
                              ? "rgba(30,60,14,0.07)"
                              : "#f2e8d0",
                            borderRadius: "3px",
                            border: `1px solid ${
                              isSelected
                                ? "rgba(30,60,14,0.25)"
                                : "rgba(180,140,80,0.15)"
                            }`,
                            cursor: "pointer",
                            transition: "all 0.2s",
                          }}
                        >
                          <input
                            type="checkbox"
                            name="experiences"
                            value={exp.label}
                            checked={isSelected}
                            onChange={handleChange}
                            style={{
                              width: "16px",
                              height: "16px",
                              accentColor: "#1e3c0e",
                              flexShrink: 0,
                            }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ display: "block", fontSize: "0.88rem", color: "#2c1e10", fontWeight: isSelected ? 700 : 400, lineHeight: 1.4 }}>
                              {exp.label}
                            </span>
                            <span
                              style={{
                                display: "block",
                                fontSize: "0.7rem",
                                color: "#8a7868",
                                marginTop: "0.2rem",
                              }}
                            >
                              {exp.season}
                            </span>
                            {"note" in exp && exp.note && (
                              <span
                                style={{
                                  display: "block",
                                  fontSize: "0.68rem",
                                  color: "#7a4020",
                                  marginTop: "0.15rem",
                                }}
                              >
                                ※ {exp.note}
                              </span>
                            )}
                          </div>
                          <span
                            style={{
                              fontSize: "0.78rem",
                              fontWeight: 700,
                              color: "#5c2e12",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {exp.price}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  <p style={{ fontSize: "0.72rem", color: "#8a7868", marginTop: "0.5rem" }}>
                    ※ 季節・天候により実施できない場合があります。詳細は予約確認メールにてご案内します
                  </p>
                </div>

                {sectionDivider}

                {/* Step 5: Message */}
                <div style={{ marginBottom: "2rem", marginTop: "1.5rem" }}>
                  {stepBadge(5, "ご要望", <FaCommentDots size={14} color="#5c2e12" />)}
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    onFocus={() => setFocusedField("message")}
                    onBlur={() => setFocusedField("")}
                    placeholder="アレルギー、到着時間の目安、特別なご要望など、お気軽にどうぞ"
                    rows={5}
                    style={{
                      ...focusedInputStyle("message"),
                      resize: "vertical",
                      fontFamily: "'Noto Sans JP', sans-serif",
                    }}
                  />
                </div>

                {sectionDivider}

                {/* Agreement */}
                <div style={{ marginBottom: "2rem", marginTop: "1.5rem" }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.75rem",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      color: "#5a4838",
                      lineHeight: 1.7,
                    }}
                  >
                    <input
                      type="checkbox"
                      name="agreement"
                      checked={form.agreement}
                      onChange={handleChange}
                      required
                      style={{
                        width: "16px",
                        height: "16px",
                        accentColor: "#1e3c0e",
                        flexShrink: 0,
                        marginTop: "2px",
                      }}
                    />
                    <span>
                      <Link
                        to="/faq"
                        style={{ color: "#1e3c0e", fontWeight: 700 }}
                      >
                        利用規約
                      </Link>
                      に同意します。お支払いは来場時現金払いのみとなります。
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!form.agreement}
                  style={{
                    width: "100%",
                    backgroundColor: form.agreement ? "#5c2e12" : "#c8b8a0",
                    color: form.agreement ? "#f0e8d0" : "#a09080",
                    padding: "1.1rem",
                    borderRadius: "3px",
                    border: "none",
                    cursor: form.agreement ? "pointer" : "not-allowed",
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
                  予約内容を確認する <FaChevronRight size={15} />
                </button>
              </div>
            </form>

            {/* ======= Sidebar ======= */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              {/* Stay Dates Card */}
              <div
                style={{
                  backgroundColor: "#1b2f0e",
                  borderRadius: "4px",
                  padding: "1.5rem",
                  color: "#f0e8d0",
                  border: "1px solid rgba(212,176,112,0.18)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    marginBottom: "1.25rem",
                  }}
                >
                  <FaCalendarAlt size={14} color="#d4b070" />
                  <h3
                    style={{
                      fontFamily: "'Noto Serif JP', serif",
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: "#d4b070",
                      margin: 0,
                    }}
                  >
                    宿泊日程
                  </h3>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.65rem",
                    fontSize: "0.85rem",
                  }}
                >
                  <div style={{ padding: "0.4rem 0", borderBottom: "1px solid rgba(240,232,208,0.1)" }}>
                    <span style={{ color: "rgba(240,232,208,0.6)", fontSize: "0.72rem" }}>チェックイン</span>
                    <div style={{ fontWeight: 700, color: "#f0e8d0", marginTop: "0.2rem" }}>
                      {formatDateJP(checkin)}
                    </div>
                  </div>
                  <div style={{ padding: "0.4rem 0", borderBottom: "1px solid rgba(240,232,208,0.1)" }}>
                    <span style={{ color: "rgba(240,232,208,0.6)", fontSize: "0.72rem" }}>チェックアウト</span>
                    <div style={{ fontWeight: 700, color: "#f0e8d0", marginTop: "0.2rem" }}>
                      {formatDateJP(checkout)}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.6rem 0",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          backgroundColor: "rgba(212,176,112,0.2)",
                          color: "#d4b070",
                          padding: "0.25rem 0.65rem",
                          borderRadius: "3px",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                        }}
                      >
                        {nights}泊{nights + 1}日
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        color: "rgba(240,232,208,0.6)",
                      }}
                    >
                      {dayType}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/reservation")}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "center",
                    background: "none",
                    border: "1px solid rgba(240,232,208,0.2)",
                    color: "rgba(240,232,208,0.7)",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    fontFamily: "'Noto Sans JP', sans-serif",
                    padding: "0.55rem",
                    borderRadius: "3px",
                    marginTop: "1rem",
                    cursor: "pointer",
                  }}
                >
                  ← 日程を変更する
                </button>
              </div>

              {/* User Info Card */}
              <div
                style={{
                  backgroundColor: "#faf5e8",
                  borderRadius: "4px",
                  padding: "1.5rem",
                  border: "1px solid rgba(180,140,80,0.18)",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    marginBottom: "1rem",
                  }}
                >
                  <FaUser size={14} color="#1e3c0e" />
                  <h3
                    style={{
                      fontFamily: "'Noto Serif JP', serif",
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      color: "#1e3c0e",
                      margin: 0,
                    }}
                  >
                    会員情報
                  </h3>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    fontSize: "0.82rem",
                    color: "#5a4838",
                  }}
                >
                  {[
                    { label: "お名前", value: user?.name },
                    { label: "メール", value: user?.email },
                    { label: "電話番号", value: user?.phone },
                    { label: "住所", value: user?.address },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        padding: "0.35rem 0",
                        borderBottom: "1px solid rgba(180,140,80,0.12)",
                      }}
                    >
                      <span style={{ fontSize: "0.7rem", color: "#8a7868" }}>
                        {item.label}
                      </span>
                      <span style={{ fontWeight: 500, color: "#2c1e10", marginTop: "0.1rem" }}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
                <p
                  style={{
                    fontSize: "0.68rem",
                    color: "#8a7868",
                    marginTop: "0.75rem",
                    lineHeight: 1.6,
                  }}
                >
                  ※ 会員登録時の情報を使用します。変更がある場合はご要望欄にご記入ください
                </p>
              </div>

              {/* Price Estimate Card */}
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
                    marginBottom: "1rem",
                  }}
                >
                  料金の目安
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    fontSize: "0.82rem",
                    color: "#5a4838",
                  }}
                >
                  {[
                    { label: "平日（1〜5名）", price: "¥28,000〜" },
                    { label: "休前日（1〜5名）", price: "¥34,000〜" },
                    { label: "特別日（1〜5名）", price: "¥41,000〜" },
                    { label: "6名以上（1名追加ごと）", price: "+¥3,000" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "0.4rem 0",
                        borderBottom: "1px solid rgba(180,140,80,0.12)",
                      }}
                    >
                      <span>{item.label}</span>
                      <span style={{ fontWeight: 700, color: "#1e3c0e" }}>
                        {item.price}
                      </span>
                    </div>
                  ))}
                  <p
                    style={{
                      fontSize: "0.72rem",
                      color: "#8a7868",
                      marginTop: "0.5rem",
                    }}
                  >
                    ※ 宿泊料+滞在サポート料{parseInt(form.guests) >= 5 ? "¥13,000（送迎追加含む）" : "¥8,000"}の合計
                  </p>
                </div>
                <Link
                  to="/pricing"
                  style={{
                    display: "block",
                    textAlign: "center",
                    color: "#7a4020",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    textDecoration: "none",
                    marginTop: "0.75rem",
                  }}
                >
                  料金計算機を使う →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .detail-grid {
            grid-template-columns: 1fr !important;
          }
          .pet-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}