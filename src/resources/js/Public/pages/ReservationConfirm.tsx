import { router, usePage } from "@inertiajs/react";
import { useLocation, useNavigate, Link } from "../router";
import {
    FaChevronLeft,
    FaChevronRight,
    FaCalendarAlt,
    FaUser,
    FaPaw,
    FaConciergeBell,
    FaMountain,
    FaCommentDots,
    FaUsers,
    FaCheckCircle,
    FaShieldAlt,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const WEEKDAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

function formatDateJP(dateStr: string): string {
    if (!dateStr) return "未定";
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return `${y}年${m}月${d}日（${WEEKDAY_NAMES[date.getDay()]}）`;
}

function getBaseRate(dayType: string): number {
    if (dayType.startsWith("特別日")) return 33000;
    if (dayType.startsWith("休前日")) return 26000;
    return 20000;
}

const PET_FEES: Record<string, number> = {
    none: 0,
    small1: 2500,
    small2: 4000,
    large1: 3500,
    large2: 6000,
};
const PET_LABELS: Record<string, string> = {
    none: "なし",
    small1: "小型犬1頭",
    small2: "小型犬2頭",
    large1: "大型犬1頭",
    large2: "大型犬2頭",
};

const dividerStyle: React.CSSProperties = {
    height: "1px",
    background:
        "linear-gradient(90deg, transparent, rgba(180,140,80,0.25), transparent)",
    margin: "1.25rem 0",
};

export function ReservationConfirm() {
    const { experiences = [] } = usePage().props as unknown as {
        experiences?: Array<{
            name: string;
            price: number;
            pricingType?: "per_person" | "per_group";
        }>;
    };
    const experienceRates = Object.fromEntries(
        experiences.map((experience) => [
            experience.name,
            {
                perPerson: experience.pricingType === "per_person",
                amount: Number(experience.price),
            },
        ]),
    ) as Record<string, { perPerson: boolean; amount: number }>;
    const { user } = useAuth();
    const navigate = useNavigate();
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
                agreement: boolean;
            };
            checkin: string;
            checkout: string;
            nights: number;
            dayType: string;
        } | null;
    };

    if (!state) {
        return (
            <div
                style={{
                    padding: "8rem 1.5rem",
                    textAlign: "center",
                    backgroundColor: "#f2e8d0",
                    minHeight: "60vh",
                }}
            >
                <p style={{ color: "#5a4838", marginBottom: "1.5rem" }}>
                    予約情報が見つかりません。日程選択からやり直してください。
                </p>
                <Link
                    to="/reservation"
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
                    予約ページへ
                </Link>
            </div>
        );
    }

    const { form, checkin, checkout, nights, dayType } = state;
    const guestsNum = parseInt(form.guests, 10);

    /* ── 料金計算 ── */
    const baseRate = getBaseRate(dayType);
    const baseTotal = baseRate * nights;
    const guestExtra = guestsNum > 5 ? (guestsNum - 5) * 3000 * nights : 0;
    const petPerNight = PET_FEES[form.pets] || 0;
    const petTotal = petPerNight * nights;
    const supportFee = form.supportPlan === "yes" ? 8000 : 0;
    const transferSurcharge =
        form.supportPlan === "yes" && guestsNum >= 5 ? 5000 : 0;
    const expTotal = form.experiences.reduce((acc, label) => {
        const info = experienceRates[label];
        if (!info) return acc;
        return acc + (info.perPerson ? info.amount * guestsNum : info.amount);
    }, 0);
    const deposit = 10000;
    const grandTotal =
        baseTotal +
        guestExtra +
        petTotal +
        supportFee +
        transferSurcharge +
        expTotal +
        deposit;

    const petLabel = (() => {
        if (form.pets === "none") return "なし";
        if (form.pets === "small2" || form.pets === "large2") {
            const breeds = [form.petDetail, form.petDetail2]
                .filter(Boolean)
                .join(" / ");
            return `${PET_LABELS[form.pets]}${breeds ? `（${breeds}）` : ""}`;
        }
        return `${PET_LABELS[form.pets]}${form.petDetail ? `（${form.petDetail}）` : ""}`;
    })();

    const priceRows: { label: string; amount: number; note?: string }[] = [
        {
            label: `基本宿泊料（${dayType}）`,
            amount: baseTotal,
            note: `¥${baseRate.toLocaleString()} × ${nights}泊`,
        },
        ...(guestExtra > 0
            ? [
                  {
                      label: `人数追加料金（${guestsNum - 5}名分）`,
                      amount: guestExtra,
                      note: `¥${((guestsNum - 5) * 3000).toLocaleString()} × ${nights}泊`,
                  },
              ]
            : []),
        ...(petTotal > 0
            ? [
                  {
                      label: `ペット料金（${PET_LABELS[form.pets]}）`,
                      amount: petTotal,
                      note: `¥${petPerNight.toLocaleString()} × ${nights}泊`,
                  },
              ]
            : []),
        ...(supportFee > 0
            ? [{ label: "滞在サポート料", amount: supportFee }]
            : []),
        ...(transferSurcharge > 0
            ? [
                  {
                      label: "送迎追加（5名以上・一律）",
                      amount: transferSurcharge,
                      note: "追加車両手配費",
                  },
              ]
            : []),
        ...(expTotal > 0
            ? [{ label: "体験オプション", amount: expTotal }]
            : []),
        { label: "保証料（ご滞在後トラブルなければ返金）", amount: deposit },
    ];

    const handleConfirm = () => {
        router.post(
            "/reservations",
            {
                ...form,
                checkin,
                checkout,
                grandTotal,
                breakdown: Object.fromEntries(
                    priceRows.map((row) => [row.label, row.amount]),
                ),
            },
            {
                preserveScroll: true,
                onSuccess: (page) => {
                    const bookingRef = String(
                        page.props.flash?.reservationCode ?? "",
                    );
                    navigate("/reservation/complete", {
                        state: {
                            form,
                            checkin,
                            checkout,
                            nights,
                            dayType,
                            grandTotal,
                            bookingRef,
                        },
                    });
                    window.scrollTo(0, 0);
                },
            },
        );
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
                    Reservation Confirm
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
                    予約内容の確認
                </h1>
                <p
                    style={{
                        color: "rgba(240,232,208,0.7)",
                        marginTop: "1rem",
                        fontSize: "0.92rem",
                    }}
                >
                    以下の内容をご確認の上、予約を確定してください
                </p>
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
                        gap: "0",
                    }}
                >
                    {[
                        { label: "詳細入力", done: true },
                        { label: "内容確認", done: false, active: true },
                        { label: "予約完了", done: false },
                    ].map((step, i) => (
                        <div
                            key={step.label}
                            style={{ display: "flex", alignItems: "center" }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.4rem",
                                }}
                            >
                                <div
                                    style={{
                                        width: "24px",
                                        height: "24px",
                                        borderRadius: "50%",
                                        backgroundColor: step.done
                                            ? "#d4b070"
                                            : step.active
                                              ? "#f0e8d0"
                                              : "rgba(240,232,208,0.2)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    {step.done ? (
                                        <FaCheckCircle
                                            size={14}
                                            color="#1b2f0e"
                                        />
                                    ) : (
                                        <span
                                            style={{
                                                fontSize: "0.65rem",
                                                fontWeight: 700,
                                                color: step.active
                                                    ? "#1b2f0e"
                                                    : "rgba(240,232,208,0.4)",
                                            }}
                                        >
                                            {i + 1}
                                        </span>
                                    )}
                                </div>
                                <span
                                    style={{
                                        fontSize: "0.75rem",
                                        fontWeight: 700,
                                        color: step.done
                                            ? "#d4b070"
                                            : step.active
                                              ? "#f0e8d0"
                                              : "rgba(240,232,208,0.4)",
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
                                        backgroundColor:
                                            i === 0
                                                ? "#d4b070"
                                                : "rgba(240,232,208,0.15)",
                                        margin: "0 0.5rem",
                                    }}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <section
                style={{ backgroundColor: "#f2e8d0", padding: "4rem 1.5rem" }}
            >
                <div style={{ maxWidth: "920px", margin: "0 auto" }}>
                    {/* Back button */}
                    <button
                        onClick={() => navigate(-1)}
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
                        詳細入力に戻る
                    </button>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 320px",
                            gap: "2rem",
                            alignItems: "start",
                        }}
                        className="confirm-grid"
                    >
                        {/* Left: Booking Summary */}
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
                                }}
                            >
                                ご予約内容
                            </h2>

                            {/* 宿泊日程 */}
                            <Section
                                icon={
                                    <FaCalendarAlt size={14} color="#5c2e12" />
                                }
                                title="宿泊日程"
                            >
                                <Row
                                    label="チェックイン"
                                    value={formatDateJP(checkin)}
                                />
                                <Row
                                    label="チェックアウト"
                                    value={formatDateJP(checkout)}
                                />
                                <Row
                                    label="泊数・曜日区分"
                                    value={`${nights}泊 ／ ${dayType}`}
                                />
                            </Section>

                            <div style={dividerStyle} />

                            {/* 会員情報 */}
                            <Section
                                icon={<FaUser size={14} color="#5c2e12" />}
                                title="お客様情報"
                            >
                                <Row label="お名前" value={user?.name || ""} />
                                <Row label="メール" value={user?.email || ""} />
                                <Row
                                    label="電話番号"
                                    value={user?.phone || ""}
                                />
                                {user?.address && (
                                    <Row label="住所" value={user.address} />
                                )}
                            </Section>

                            <div style={dividerStyle} />

                            {/* 宿泊人数 */}
                            <Section
                                icon={<FaUsers size={14} color="#5c2e12" />}
                                title="宿泊人数"
                            >
                                <Row label="人数" value={`${guestsNum}名`} />
                            </Section>

                            <div style={dividerStyle} />

                            {/* ペット */}
                            <Section
                                icon={<FaPaw size={14} color="#5c2e12" />}
                                title="ペット同伴"
                            >
                                <Row label="ペット" value={petLabel} />
                            </Section>

                            <div style={dividerStyle} />

                            {/* 滞在サポート */}
                            <Section
                                icon={
                                    <FaConciergeBell
                                        size={14}
                                        color="#5c2e12"
                                    />
                                }
                                title="滞在サポート"
                            >
                                <Row
                                    label="プラン"
                                    value={
                                        form.supportPlan === "yes"
                                            ? guestsNum >= 5
                                                ? "あり（¥13,000：¥8,000 + 送迎追加¥5,000）"
                                                : "あり（¥8,000）"
                                            : "なし"
                                    }
                                />
                            </Section>

                            {/* 体験オプション */}
                            {form.experiences.length > 0 && (
                                <>
                                    <div style={dividerStyle} />
                                    <Section
                                        icon={
                                            <FaMountain
                                                size={14}
                                                color="#5c2e12"
                                            />
                                        }
                                        title="体験オプション"
                                    >
                                        {form.experiences.map((exp) => (
                                            <Row
                                                key={exp}
                                                label={exp}
                                                value={(() => {
                                                    const info = EXP_MAP[exp];
                                                    if (!info) return "";
                                                    if (info.perPerson)
                                                        return `¥${(info.amount * guestsNum).toLocaleString()}（¥${info.amount.toLocaleString()} × ${guestsNum}名）`;
                                                    return `¥${info.amount.toLocaleString()}`;
                                                })()}
                                            />
                                        ))}
                                    </Section>
                                </>
                            )}

                            {/* ご要望 */}
                            {form.message && (
                                <>
                                    <div style={dividerStyle} />
                                    <Section
                                        icon={
                                            <FaCommentDots
                                                size={14}
                                                color="#5c2e12"
                                            />
                                        }
                                        title="ご要望"
                                    >
                                        <p
                                            style={{
                                                fontSize: "0.88rem",
                                                color: "#2c1e10",
                                                lineHeight: 1.8,
                                                backgroundColor: "#f2e8d0",
                                                borderRadius: "3px",
                                                padding: "0.75rem 1rem",
                                                border: "1px solid rgba(180,140,80,0.15)",
                                            }}
                                        >
                                            {form.message}
                                        </p>
                                    </Section>
                                </>
                            )}
                        </div>

                        {/* Right: Payment breakdown */}
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "1.25rem",
                            }}
                        >
                            {/* Payment card */}
                            <div
                                style={{
                                    backgroundColor: "#1b2f0e",
                                    borderRadius: "4px",
                                    padding: "1.75rem",
                                    border: "1px solid rgba(212,176,112,0.18)",
                                    color: "#f0e8d0",
                                }}
                            >
                                <h3
                                    style={{
                                        fontFamily: "'Noto Serif JP', serif",
                                        fontSize: "1rem",
                                        fontWeight: 700,
                                        color: "#d4b070",
                                        marginBottom: "1.25rem",
                                        paddingBottom: "0.75rem",
                                        borderBottom:
                                            "1px solid rgba(212,176,112,0.2)",
                                    }}
                                >
                                    お支払い金額
                                </h3>

                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "0.6rem",
                                        marginBottom: "1.25rem",
                                    }}
                                >
                                    {priceRows.map((row) => (
                                        <div key={row.label}>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems: "flex-start",
                                                    gap: "0.5rem",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontSize: "0.8rem",
                                                        color: "rgba(240,232,208,0.75)",
                                                        flex: 1,
                                                    }}
                                                >
                                                    {row.label}
                                                </span>
                                                <span
                                                    style={{
                                                        fontSize: "0.88rem",
                                                        fontWeight: 700,
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    ¥
                                                    {row.amount.toLocaleString()}
                                                </span>
                                            </div>
                                            {row.note && (
                                                <span
                                                    style={{
                                                        fontSize: "0.68rem",
                                                        color: "rgba(240,232,208,0.45)",
                                                    }}
                                                >
                                                    {row.note}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div
                                    style={{
                                        borderTop:
                                            "1px solid rgba(212,176,112,0.3)",
                                        paddingTop: "1rem",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <span
                                        style={{
                                            color: "#d4b070",
                                            fontWeight: 700,
                                            fontSize: "0.9rem",
                                        }}
                                    >
                                        合計（税込）
                                    </span>
                                    <span
                                        style={{
                                            fontFamily:
                                                "'Noto Serif JP', serif",
                                            fontSize: "1.75rem",
                                            fontWeight: 700,
                                            color: "#d4b070",
                                        }}
                                    >
                                        ¥{grandTotal.toLocaleString()}
                                    </span>
                                </div>

                                <div
                                    style={{
                                        marginTop: "0.75rem",
                                        backgroundColor:
                                            "rgba(212,176,112,0.08)",
                                        borderRadius: "3px",
                                        padding: "0.6rem 0.75rem",
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: "0.4rem",
                                    }}
                                >
                                    <FaShieldAlt
                                        size={11}
                                        color="#d4b070"
                                        style={{
                                            marginTop: "2px",
                                            flexShrink: 0,
                                        }}
                                    />
                                    <p
                                        style={{
                                            fontSize: "0.68rem",
                                            color: "rgba(240,232,208,0.55)",
                                            margin: 0,
                                            lineHeight: 1.6,
                                        }}
                                    >
                                        保証料¥10,000はご滞在後にトラブルがなければ全額返金されます
                                    </p>
                                </div>
                            </div>

                            {/* Confirm button */}
                            <button
                                onClick={handleConfirm}
                                style={{
                                    width: "100%",
                                    backgroundColor: "#5c2e12",
                                    color: "#f0e8d0",
                                    padding: "1.1rem",
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
                                    boxShadow: "0 4px 16px rgba(92,46,18,0.3)",
                                    transition: "background-color 0.2s",
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.backgroundColor =
                                        "#7a3c18")
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.backgroundColor =
                                        "#5c2e12")
                                }
                            >
                                予約を確定する <FaChevronRight size={14} />
                            </button>
                            <p
                                style={{
                                    fontSize: "0.72rem",
                                    color: "#8a7868",
                                    textAlign: "center",
                                    lineHeight: 1.7,
                                }}
                            >
                                確定後、2〜3営業日以内にメールにてご連絡いたします
                            </p>

                            {/* Policy reminder */}
                            <div
                                style={{
                                    backgroundColor: "#faf5e8",
                                    borderRadius: "4px",
                                    padding: "1.25rem",
                                    border: "1px solid rgba(180,140,80,0.18)",
                                    fontSize: "0.75rem",
                                    color: "#8a7868",
                                    lineHeight: 1.8,
                                }}
                            >
                                <p style={{ margin: 0 }}>
                                    ご予約の確定をもって
                                    <Link
                                        to="/faq"
                                        style={{
                                            color: "#5c2e12",
                                            fontWeight: 700,
                                        }}
                                    >
                                        利用規約
                                    </Link>
                                    に同意したものとみなします。
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
        @media (max-width: 768px) {
          .confirm-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
        </div>
    );
}

function Section({
    icon,
    title,
    children,
}: {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div style={{ marginBottom: "0.25rem" }}>
            <h3
                style={{
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: "#1e3c0e",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    marginBottom: "0.75rem",
                }}
            >
                {icon}
                {title}
            </h3>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.4rem",
                }}
            >
                {children}
            </div>
        </div>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                padding: "0.4rem 0",
                borderBottom: "1px solid rgba(180,140,80,0.1)",
                gap: "1rem",
            }}
        >
            <span
                style={{ fontSize: "0.78rem", color: "#8a7868", flexShrink: 0 }}
            >
                {label}
            </span>
            <span
                style={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#2c1e10",
                    textAlign: "right",
                }}
            >
                {value}
            </span>
        </div>
    );
}
