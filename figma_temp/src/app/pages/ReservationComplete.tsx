import { useLocation, Link } from "react-router";
import {
  FaCheckCircle,
  FaCalendarAlt,
  FaUsers,
  FaPaw,
  FaConciergeBell,
  FaMountain,
  FaHome,
  FaUser,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const WEEKDAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

function formatDateJP(dateStr: string): string {
  if (!dateStr) return "未定";
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return `${y}年${m}月${d}日（${WEEKDAY_NAMES[date.getDay()]}）`;
}

const PET_LABELS: Record<string, string> = {
  none: "なし", small1: "小型犬1頭", small2: "小型犬2頭",
  large1: "大型犬1頭", large2: "大型犬2頭",
};

export function ReservationComplete() {
  const { user } = useAuth();
  const { state } = useLocation() as {
    state: {
      form: {
        guests: string;
        pets: string;
        petDetail: string;
        petDetail2: string;
        supportPlan: string;
        experiences: string[];
        message: string;
      };
      checkin: string;
      checkout: string;
      nights: number;
      dayType: string;
      grandTotal: number;
      bookingRef: string;
    } | null;
  };

  if (!state) {
    return (
      <div style={{ padding: "8rem 1.5rem", textAlign: "center", backgroundColor: "#f2e8d0", minHeight: "60vh" }}>
        <p style={{ color: "#5a4838", marginBottom: "1.5rem" }}>
          予約情報が見つかりません。
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
          }}
        >
          トップページへ
        </Link>
      </div>
    );
  }

  const { form, checkin, checkout, nights, dayType, grandTotal, bookingRef } = state;
  const guestsNum = parseInt(form.guests, 10);

  const petLabel = (() => {
    if (form.pets === "none") return "なし";
    if (form.pets === "small2" || form.pets === "large2") {
      const breeds = [form.petDetail, form.petDetail2].filter(Boolean).join(" / ");
      return `${PET_LABELS[form.pets]}${breeds ? `（${breeds}）` : ""}`;
    }
    return `${PET_LABELS[form.pets]}${form.petDetail ? `（${form.petDetail}）` : ""}`;
  })();

  const summaryItems = [
    { icon: <FaCalendarAlt size={13} color="#1e3c0e" />, label: "チェックイン", value: formatDateJP(checkin) },
    { icon: <FaCalendarAlt size={13} color="#1e3c0e" />, label: "チェックアウト", value: formatDateJP(checkout) },
    { icon: <FaCalendarAlt size={13} color="#1e3c0e" />, label: "泊数・曜日区分", value: `${nights}泊 ／ ${dayType}` },
    { icon: <FaUsers size={13} color="#1e3c0e" />, label: "宿泊人数", value: `${guestsNum}名` },
    ...(form.pets !== "none"
      ? [{ icon: <FaPaw size={13} color="#1e3c0e" />, label: "ペット", value: petLabel }]
      : []),
    {
      icon: <FaConciergeBell size={13} color="#1e3c0e" />,
      label: "滞在サポート",
      value: form.supportPlan === "yes" ? "あり（¥8,000）" : "なし",
    },
    ...(form.experiences.length > 0
      ? [{ icon: <FaMountain size={13} color="#1e3c0e" />, label: "体験オプション", value: form.experiences.join("、") }]
      : []),
  ];

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
          Reservation Complete
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
          ご予約受付完了
        </h1>
      </div>

      {/* Progress */}
      <div style={{ backgroundColor: "#1b2f0e", padding: "1rem 1.5rem" }}>
        <div
          style={{
            maxWidth: "920px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {[
            { label: "詳細入力", done: true },
            { label: "内容確認", done: true },
            { label: "予約完了", done: false, active: true },
          ].map((step, i) => (
            <div key={step.label} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    backgroundColor: step.done ? "#d4b070" : step.active ? "#f0e8d0" : "rgba(240,232,208,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {step.done
                    ? <FaCheckCircle size={14} color="#1b2f0e" />
                    : <span style={{ fontSize: "0.65rem", fontWeight: 700, color: step.active ? "#1b2f0e" : "rgba(240,232,208,0.4)" }}>{i + 1}</span>
                  }
                </div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: step.done ? "#d4b070" : step.active ? "#f0e8d0" : "rgba(240,232,208,0.4)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {step.label}
                </span>
              </div>
              {i < 2 && (
                <div
                  style={{
                    width: "clamp(2rem, 5vw, 4rem)",
                    height: "1px",
                    backgroundColor: "#d4b070",
                    margin: "0 0.5rem",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 480px) {
          .complete-card {
            padding: 2rem 1.1rem !important;
          }
          .complete-summary-row {
            flex-direction: column;
            gap: 0.2rem !important;
            padding: 0.55rem 0 !important;
          }
          .complete-summary-row span:last-child {
            text-align: left !important;
            padding-left: 1.4rem;
          }
        }
      `}</style>
      <section style={{ backgroundColor: "#f2e8d0", padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: "680px", margin: "0 auto" }}>
          {/* Complete card */}
          <div
            className="complete-card"
            style={{
              backgroundColor: "#faf5e8",
              borderRadius: "4px",
              padding: "3rem 2.5rem",
              boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
              border: "1px solid rgba(180,140,80,0.15)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                backgroundColor: "rgba(30,60,14,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
              }}
            >
              <FaCheckCircle size={40} color="#1e3c0e" />
            </div>

            <h2
              style={{
                fontFamily: "'Noto Serif JP', serif",
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#1e3c0e",
                marginBottom: "0.75rem",
              }}
            >
              ご予約ありがとうございます
            </h2>
            <p style={{ color: "#5a4838", fontSize: "0.92rem", lineHeight: 1.9, marginBottom: "0.5rem" }}>
              <strong style={{ color: "#1e3c0e" }}>{user?.name}</strong> 様のご予約を承りました。
            </p>
            <p style={{ color: "#5a4838", fontSize: "0.88rem", lineHeight: 1.9, marginBottom: "2rem" }}>
              2〜3営業日以内に <strong>{user?.email}</strong> 宛にご連絡いたします。
            </p>

            {/* Booking reference */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.6rem",
                backgroundColor: "#1b2f0e",
                color: "#d4b070",
                padding: "0.5rem 1.25rem",
                borderRadius: "3px",
                fontSize: "0.85rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                marginBottom: "2rem",
              }}
            >
              予約番号：{bookingRef}
            </div>

            {/* Summary box */}
            <div
              style={{
                backgroundColor: "#f2e8d0",
                borderRadius: "3px",
                padding: "1.5rem 1.75rem",
                marginBottom: "2rem",
                textAlign: "left",
                border: "1px solid rgba(180,140,80,0.2)",
              }}
            >
              <h4
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "#1e3c0e",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <FaCalendarAlt size={13} color="#1e3c0e" />
                ご予約内容
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                {summaryItems.map((item) => (
                  <div
                    key={item.label}
                    className="complete-summary-row"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      padding: "0.45rem 0",
                      borderBottom: "1px solid rgba(180,140,80,0.12)",
                      gap: "0.75rem",
                    }}
                  >
                    <span style={{ fontSize: "0.78rem", color: "#8a7868", display: "flex", alignItems: "center", gap: "0.35rem", flexShrink: 0, whiteSpace: "nowrap" }}>
                      {item.icon}
                      {item.label}
                    </span>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#2c1e10", textAlign: "right", wordBreak: "keep-all", overflowWrap: "anywhere" }}>
                      {item.value}
                    </span>
                  </div>
                ))}

                {/* Total */}
                <div
                  className="complete-total-row"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: "1rem",
                    marginTop: "0.25rem",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e3c0e", whiteSpace: "nowrap" }}>
                    お支払い合計（税込）
                  </span>
                  <span
                    style={{
                      fontFamily: "'Noto Serif JP', serif",
                      fontSize: "1.4rem",
                      fontWeight: 700,
                      color: "#5c2e12",
                      whiteSpace: "nowrap",
                    }}
                  >
                    ¥{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Notice */}
            <div
              style={{
                backgroundColor: "rgba(196,122,48,0.07)",
                border: "1px solid rgba(196,122,48,0.18)",
                borderRadius: "3px",
                padding: "1rem 1.25rem",
                marginBottom: "2rem",
                textAlign: "left",
              }}
            >
              <p style={{ fontSize: "0.78rem", color: "#7a4020", lineHeight: 1.9, margin: 0 }}>
                ・ご予約内容の詳細は確認メールにてご案内いたします<br />
                ・保証料（¥10,000）はご滞在後にトラブルがなければ全額返金されます<br />
                ・お支払いはすべて来場時（当日）現金払いとなります
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                to="/"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  backgroundColor: "#1e3c0e",
                  color: "#f0e8d0",
                  padding: "0.875rem 1.75rem",
                  borderRadius: "3px",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                }}
              >
                <FaHome size={13} />
                トップページへ
              </Link>
              <Link
                to="/mypage"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  backgroundColor: "transparent",
                  color: "#5c2e12",
                  padding: "0.875rem 1.75rem",
                  borderRadius: "3px",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  border: "1px solid rgba(92,46,18,0.35)",
                }}
              >
                <FaUser size={12} />
                マイページへ
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
