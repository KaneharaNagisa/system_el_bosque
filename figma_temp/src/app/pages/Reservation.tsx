import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  FaSignInAlt,
  FaChevronRight,
  FaHome,
  FaUsers,
  FaCalendarAlt,
  FaPaw,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { DatePicker } from "../components/DatePicker";
import { AvailabilityCalendar } from "../components/AvailabilityCalendar";

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

export function Reservation() {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [focusedField, setFocusedField] = useState("");
  const [checkoutError, setCheckoutError] = useState("");

  // Max checkout = next Monday from checkin (max 3 nights)
  const checkoutMax = (() => {
    if (!checkin) return "2027-01-01";
    const [y, m, d] = checkin.split("-").map(Number);
    const ci = new Date(y, m - 1, d);
    // Find next Monday from checkin
    const dow = ci.getDay();
    // Fri(5)→+3, Sat(6)→+2, Sun(0)→+1
    let daysToMon = 1;
    if (dow === 5) daysToMon = 3;
    else if (dow === 6) daysToMon = 2;
    else if (dow === 0) daysToMon = 1;
    const maxDate = new Date(y, m - 1, d + daysToMon);
    return `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, "0")}-${String(maxDate.getDate()).padStart(2, "0")}`;
  })();

  // Min checkout = checkin + 1 day
  const checkoutMin = (() => {
    if (!checkin) return "2026-08-02";
    const [y, m, d] = checkin.split("-").map(Number);
    const minDate = new Date(y, m - 1, d + 1);
    return `${minDate.getFullYear()}-${String(minDate.getMonth() + 1).padStart(2, "0")}-${String(minDate.getDate()).padStart(2, "0")}`;
  })();

  const focusedInputStyle = (field: string): React.CSSProperties => ({
    ...inputStyle,
    borderColor: focusedField === field ? "#1e3c0e" : "rgba(30,60,14,0.2)",
    boxShadow: focusedField === field ? "0 0 0 3px rgba(30,60,14,0.1)" : "none",
  });

  const datesValid = checkin && checkout && checkout > checkin;

  const handleLoginReserve = () => {
    const detailParams = new URLSearchParams();
    if (checkin) detailParams.set("checkin", checkin);
    if (checkout) detailParams.set("checkout", checkout);
    const redirectPath = `/reservation/detail?${detailParams.toString()}`;
    const loginParams = new URLSearchParams();
    loginParams.set("redirect", redirectPath);
    navigate(`/login?${loginParams.toString()}`);
  };

  const handleDetailReserve = () => {
    const params = new URLSearchParams();
    if (checkin) params.set("checkin", checkin);
    if (checkout) params.set("checkout", checkout);
    navigate(`/reservation/detail?${params.toString()}`);
  };

  const infoItems = [
    { label: "一棟貸し切り", icon: <FaHome size={13} color="#d4b070" /> },
    { label: "最大10名様", icon: <FaUsers size={13} color="#d4b070" /> },
    { label: "営業期間：3月〜12月", icon: <FaCalendarAlt size={13} color="#d4b070" /> },
    { label: "ペットOK", icon: <FaPaw size={13} color="#d4b070" /> },
  ];

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
          Reservation
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
          ご予約
        </h1>
        <p
          style={{
            color: "rgba(240,232,208,0.7)",
            marginTop: "1rem",
            fontSize: "0.92rem",
          }}
        >
          ご希望の宿泊日程をお選びください
        </p>
      </div>

      {/* Quick info strip */}
      <div style={{ backgroundColor: "#1b2f0e", padding: "0.875rem 1.5rem" }}>
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            gap: "1.5rem",
            justifyContent: "center",
          }}
        >
          {infoItems.map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                color: "rgba(240,232,208,0.8)",
                fontSize: "0.82rem",
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <section style={{ backgroundColor: "#f2e8d0", padding: "4rem 1.5rem" }}>
        <div style={{ maxWidth: "580px", margin: "0 auto" }}>
          {/* Logged-in user banner */}
          {isLoggedIn && user && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#1b2f0e",
                borderRadius: "4px",
                padding: "1rem 1.5rem",
                marginBottom: "1.5rem",
                border: "1px solid rgba(212,176,112,0.18)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                }}
              >
                <FaUser size={14} color="#d4b070" />
                <span
                  style={{
                    fontSize: "0.88rem",
                    color: "#f0e8d0",
                    fontWeight: 500,
                  }}
                >
                  {user.lastName} {user.firstName} 様でログイン中
                </span>
              </div>
              <button
                onClick={logout}
                style={{
                  background: "none",
                  border: "1px solid rgba(240,232,208,0.25)",
                  color: "rgba(240,232,208,0.7)",
                  padding: "0.35rem 0.75rem",
                  borderRadius: "3px",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  fontFamily: "'Noto Sans JP', sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                <FaSignOutAlt size={11} />
                ログアウト
              </button>
            </div>
          )}

          {/* Date Selection Card */}
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
                marginBottom: "0.75rem",
                paddingBottom: "1rem",
                borderBottom: "2px solid rgba(180,140,80,0.2)",
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
              }}
            >
              <FaCalendarAlt size={18} color="#7a4020" />
              宿泊日程の選択
            </h2>
            <p
              style={{
                fontSize: "0.85rem",
                color: "#8a7868",
                lineHeight: 1.8,
                marginBottom: "1.75rem",
              }}
            >
              まずチェックイン・チェックアウトの日程をお選びください。
              <br />
              営業期間は毎年3月〜12月です。
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                marginBottom: "1.5rem",
              }}
              className="date-grid"
            >
              <div>
                <label style={labelStyle}>
                  チェックイン <span style={{ color: "#a03020" }}>*</span>
                </label>
                <DatePicker
                  value={checkin}
                  onChange={(date) => {
                    setCheckin(date);
                    setCheckout("");
                    setCheckoutError("");
                  }}
                  min="2026-08-01"
                  max="2026-12-31"
                  placeholder="年 / 月 / 日"
                  isFocused={focusedField === "checkin"}
                  onFocusChange={(f) => setFocusedField(f ? "checkin" : "")}
                  disabledDaysOfWeek={[1, 2, 3, 4]}
                />
              </div>
              <div>
                <label style={labelStyle}>
                  チェックアウト <span style={{ color: "#a03020" }}>*</span>
                </label>
                <DatePicker
                  value={checkout}
                  onChange={(date) => {
                    setCheckoutError("");
                    setCheckout(date);
                  }}
                  min={checkoutMin}
                  max={checkoutMax}
                  placeholder="年 / 月 / 日"
                  isFocused={focusedField === "checkout"}
                  onFocusChange={(f) => {
                    if (f && !checkin) {
                      setCheckoutError("※ 先にチェックイン日を選択してください");
                      return;
                    }
                    setFocusedField(f ? "checkout" : "");
                  }}
                  disabled={!checkin}
                  disabledDaysOfWeek={[2, 3, 4, 5]}
                />
                {checkoutError && (
                  <p
                    style={{
                      fontSize: "0.78rem",
                      color: "#a03020",
                      marginTop: "0.35rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                  >
                    {checkoutError}
                  </p>
                )}
              </div>
            </div>

            {checkout && checkin && checkout <= checkin && (
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "#a03020",
                  marginBottom: "1rem",
                }}
              >
                ※ チェックアウトはチェックインより後の日付をお選びください
              </p>
            )}

            {/* Availability Calendar */}
            <AvailabilityCalendar
              checkin={checkin}
              checkout={checkout}
              onSelectDate={(date) => {
                if (!checkin || (checkin && checkout)) {
                  setCheckin(date);
                  setCheckout("");
                } else if (date > checkin) {
                  setCheckout(date);
                } else {
                  setCheckin(date);
                  setCheckout("");
                }
              }}
            />

            {/* CTA Button */}
            {isLoggedIn ? (
              <button
                onClick={handleDetailReserve}
                disabled={!datesValid}
                style={{
                  width: "100%",
                  backgroundColor: datesValid ? "#5c2e12" : "#c8b8a0",
                  color: datesValid ? "#f0e8d0" : "#a09080",
                  padding: "1.1rem",
                  borderRadius: "3px",
                  border: "none",
                  cursor: datesValid ? "pointer" : "not-allowed",
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
                詳細予約へ進む
                <FaChevronRight size={14} />
              </button>
            ) : (
              <button
                onClick={handleLoginReserve}
                disabled={!datesValid}
                style={{
                  width: "100%",
                  backgroundColor: datesValid ? "#5c2e12" : "#c8b8a0",
                  color: datesValid ? "#f0e8d0" : "#a09080",
                  padding: "1.1rem",
                  borderRadius: "3px",
                  border: "none",
                  cursor: datesValid ? "pointer" : "not-allowed",
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
                <FaSignInAlt size={16} />
                ログインして予約
              </button>
            )}

            {!isLoggedIn && (
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "#8a7868",
                  textAlign: "center",
                  marginTop: "0.75rem",
                  lineHeight: 1.7,
                }}
              >
                ご予約には会員ログインが必要です。
                <br />
                会員でない方は
                <Link
                  to="/register"
                  style={{
                    color: "#7a4020",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  こちらから無料登録
                </Link>
                できます。
              </p>
            )}
          </div>

          {/* Sidebar-like info cards below */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              marginTop: "1.5rem",
            }}
            className="info-cards-grid"
          >
            {/* Price Summary */}
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
                  { label: "保証料（返金制）", price: "¥10,000" },
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
                    lineHeight: 1.7,
                  }}
                >
                  ※ 宿泊料+滞在サポート料¥8,000の合計（最大10名）<br />
                  ※ 保証料はご滞在後にトラブルなければ全額返金
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

            {/* Flow */}
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
                ご予約の流れ
              </h3>
              {[
                "会員登録・ログイン",
                "宿泊日程の選択",
                "予約詳細の入力",
                "メールにて確認・案内",
                "料金のご入金",
                "ご予約確定",
              ].map((step, idx) => (
                <div
                  key={step}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    marginBottom: "0.6rem",
                  }}
                >
                  <span
                    style={{
                      width: "22px",
                      height: "22px",
                      backgroundColor: "#1e3c0e",
                      color: "#f0e8d0",
                      borderRadius: "50%",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}
                  </span>
                  <span style={{ fontSize: "0.82rem", color: "#5a4838" }}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact link */}
          <div
            style={{
              marginTop: "1.5rem",
              backgroundColor: "#1b2f0e",
              borderRadius: "4px",
              padding: "1.5rem",
              textAlign: "center",
              border: "1px solid rgba(212,176,112,0.18)",
            }}
          >
            <p
              style={{
                fontSize: "0.85rem",
                color: "rgba(240,232,208,0.75)",
                lineHeight: 1.8,
                marginBottom: "0.75rem",
              }}
            >
              ご質問やご相談はお問い合わせフォームからお気軽にどうぞ。
            </p>
            <Link
              to="/contact"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                backgroundColor: "rgba(240,232,208,0.12)",
                color: "#f0e8d0",
                padding: "0.65rem 1.25rem",
                borderRadius: "3px",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "0.82rem",
                border: "1px solid rgba(240,232,208,0.2)",
              }}
            >
              お問い合わせフォーム
              <FaChevronRight size={11} />
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .date-grid {
            grid-template-columns: 1fr !important;
          }
          .info-cards-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}