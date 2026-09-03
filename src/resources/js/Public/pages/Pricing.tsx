import { useState } from "react";
import { usePage } from "@inertiajs/react";
import { Link } from "../router";
import {
    FaChevronRight,
    FaInfoCircle,
    FaDog,
    FaLeaf,
    FaRegCalendarAlt,
    FaTimesCircle,
    FaCheckCircle,
    FaHeart,
    FaPaw,
    FaFire,
} from "react-icons/fa";
import { defaultPricingSetting, type PricingSetting } from "../pricing";

/* ── 共通セクション見出し ── */
const SectionHeading = ({
    en,
    ja,
    note,
    dark = false,
}: {
    en: string;
    ja: string;
    note?: string;
    dark?: boolean;
}) => (
    <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <p
            style={{
                color: dark ? "#d4b070" : "#7a4020",
                fontSize: "0.72rem",
                letterSpacing: "0.25em",
                fontWeight: 700,
                textTransform: "uppercase",
                marginBottom: "0.5rem",
            }}
        >
            {en}
        </p>
        <h2
            style={{
                fontFamily: "'Noto Serif JP', serif",
                fontSize: "clamp(1.4rem, 3vw, 1.9rem)",
                fontWeight: 700,
                color: dark ? "#f0e8d0" : "#1e3c0e",
            }}
        >
            {ja}
        </h2>
        {note && (
            <p
                style={{
                    color: dark ? "rgba(240,232,208,0.6)" : "#7a6858",
                    marginTop: "0.75rem",
                    fontSize: "0.85rem",
                }}
            >
                {note}
            </p>
        )}
    </div>
);

const petOptions = [
    { label: "なし", value: 0 },
    { label: "小型犬1頭 (+¥2,500)", value: 2500 },
    { label: "小型犬2頭 (+¥4,000)", value: 4000 },
    { label: "大型犬1頭 (+¥3,500)", value: 3500 },
    { label: "大型犬2頭 (+¥6,000)", value: 6000 },
];

export function Pricing() {
    const { experiences = [], pricingSetting } = usePage().props as unknown as {
        experiences?: Array<{
            id: number;
            name: string;
            description: string;
            price: number;
            priceNote?: string;
            pricingType?: "per_person" | "per_group";
            season?: string;
            seasonTag?: string;
            period?: string;
            periodStart?: string;
            periodEnd?: string;
            requiresReservation: boolean;
            notes?: string;
        }>;
        pricingSetting?: PricingSetting;
    };
    const rates = pricingSetting ?? defaultPricingSetting;
    const experienceOptions = experiences.map((experience) => ({
        id: experience.id,
        name: experience.name,
        description: experience.description,
        label: `${experience.name}（${experience.priceNote || `¥${Number(experience.price).toLocaleString()}`}）`,
        price:
            experience.priceNote ||
            `¥${Number(experience.price).toLocaleString()}`,
        perPerson:
            experience.pricingType === "per_person"
                ? Number(experience.price)
                : 0,
        flat:
            experience.pricingType === "per_person"
                ? 0
                : Number(experience.price),
        season:
            experience.period ||
            (experience.periodStart && experience.periodEnd
                ? `${experience.periodStart}〜${experience.periodEnd}`
                : experience.season || experience.seasonTag || "通年"),
        note:
            experience.notes ||
            (experience.requiresReservation ? "要事前予約" : "予約不要"),
    }));
    const [dayType, setDayType] = useState("weekday");
    const [guests, setGuests] = useState(2);
    const [nights, setNights] = useState(1);
    const [petFee, setPetFee] = useState(0);
    const [selectedExperiences, setSelectedExperiences] = useState<number[]>(
        [],
    );
    const [supportEnabled, setSupportEnabled] = useState(false);

    const periodIndex = Number(dayType.replace("period-", ""));
    const base =
        dayType === "weekday"
            ? rates.weekdayRate
            : dayType === "weekend"
              ? rates.holidayRate
              : (rates.periodRates[periodIndex]?.rate ?? rates.baseRate);
    const guestExtra =
        guests > 5 ? (guests - 5) * rates.additionalGuestRate * nights : 0;
    const accommodationFee = base * nights;
    const petTotal = petFee * nights;
    const supportFee = supportEnabled ? 8000 : 0;
    const transferSurcharge = supportEnabled && guests >= 5 ? 5000 : 0;

    const experienceFee = selectedExperiences.reduce((acc, idx) => {
        const exp = experienceOptions[idx];
        if (exp.perPerson > 0) return acc + exp.perPerson * guests;
        return acc + (exp.flat || 0);
    }, 0);

    const total =
        accommodationFee +
        guestExtra +
        supportFee +
        transferSurcharge +
        petTotal +
        experienceFee +
        10000;

    const toggleExperience = (idx: number) => {
        setSelectedExperiences((prev) =>
            prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
        );
    };

    const selectStyle: React.CSSProperties = {
        width: "100%",
        padding: "0.75rem 1rem",
        backgroundColor: "rgba(242,232,208,0.08)",
        border: "1px solid rgba(212,176,112,0.3)",
        borderRadius: "3px",
        color: "#f0e8d0",
        fontSize: "0.9rem",
        appearance: "none",
        cursor: "pointer",
    };

    /* ── 料金例データ ── */
    const priceExamples = [
        {
            icon: <FaHeart size={18} color="#b85c5c" />,
            title: "夫婦・カップルで平日のんびり滞在",
            desc: "2名・平日・滞在サポートあり（送迎・買い出し代行付き）",
            rows: [
                {
                    label: "基本宿泊料（1〜5名・平日）",
                    value: rates.weekdayRate,
                },
                { label: "滞在サポート料", value: 8000 },
                { label: "保証料（返金制）", value: 10000 },
            ],
            total: rates.weekdayRate + 18000,
        },
        {
            icon: <FaPaw size={18} color="#8a5c30" />,
            title: "愛犬連れ5名・休日グループ旅行",
            desc: "5名・休日・小型犬1頭・滞在サポートあり",
            rows: [
                {
                    label: "基本宿泊料（1〜5名・休日）",
                    value: rates.holidayRate,
                },
                { label: "ペット料金（小型犬1頭）", value: 2500 },
                { label: "滞在サポート料", value: 8000 },
                { label: "保証料（返金制）", value: 10000 },
            ],
            total: rates.holidayRate + 20500,
        },
        {
            icon: <FaFire size={18} color="#c47a30" />,
            title: "8名グループで特別日・BBQ満喫プラン",
            desc: "8名・特別日（GW等）・BBQグリルレンタルあり・滞在サポートあり",
            rows: [
                {
                    label: "基本宿泊料（1〜5名・期間料金）",
                    value: rates.periodRates[0]?.rate ?? rates.baseRate,
                },
                {
                    label: "人数追加料金（6〜8名・3名分）",
                    value: rates.additionalGuestRate * 3,
                },
                { label: "BBQグリルレンタル", value: 3500 },
                { label: "滞在サポート料", value: 8000 },
                { label: "保証料（返金制）", value: 10000 },
            ],
            total:
                (rates.periodRates[0]?.rate ?? rates.baseRate) +
                rates.additionalGuestRate * 3 +
                21500,
        },
    ];

    /* ── キャンセルポリシーデータ ── */
    const cancelPolicies = [
        { timing: "8日前以前", rate: "無料", rateNum: 0, free: true },
        {
            timing: "7日前〜4日前",
            rate: "宿泊料の 50%",
            rateNum: 50,
            free: false,
        },
        {
            timing: "3日前〜2日前",
            rate: "宿泊料の 80%",
            rateNum: 80,
            free: false,
        },
        {
            timing: "前日・当日・無連絡",
            rate: "宿泊料の 100%",
            rateNum: 100,
            free: false,
        },
    ];

    return (
        <div>
            {/* ── ページヘッダー ── */}
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
                    Pricing
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
                    料金案内
                </h1>
                <p
                    style={{
                        color: "rgba(240,232,208,0.65)",
                        marginTop: "0.85rem",
                        fontSize: "0.88rem",
                    }}
                >
                    基本宿泊料＋オプションをシミュレーション
                </p>
            </div>

            {/* ── 基本宿泊料 ── */}
            <section
                style={{ backgroundColor: "#f2e8d0", padding: "5rem 1.5rem" }}
            >
                <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
                    <SectionHeading
                        en="Basic Rate"
                        ja="基本宿泊料（1棟貸切）"
                        note="※ すべての料金は1泊あたり・税込の料金です"
                    />

                    {/* Desktop: table / Mobile: cards */}
                    <div className="rate-table-wrap">
                        {/* Header row — hidden on mobile */}
                        <div className="rate-header-row">
                            <span style={{ flex: 2 }}>曜日区分</span>
                            <span style={{ flex: 1, textAlign: "center" }}>
                                1〜5名（基本）
                            </span>
                            <span style={{ flex: 1, textAlign: "center" }}>
                                6名以上（1名・1泊につき）
                            </span>
                        </div>
                        {[
                            {
                                label: "平日",
                                sub: "月〜木（祝日を除く）",
                                base: `¥${rates.weekdayRate.toLocaleString()}`,
                                highlight: false,
                            },
                            {
                                label: "休日",
                                sub: "金〜日・祝日",
                                base: `¥${rates.holidayRate.toLocaleString()}`,
                                highlight: true,
                            },
                            {
                                label: "特別日",
                                sub: "GW・お盆・年末年始等",
                                base: `¥${(rates.periodRates[0]?.rate ?? rates.baseRate).toLocaleString()}`,
                                highlight: false,
                            },
                        ].map((row) => (
                            <div
                                key={row.label}
                                className="rate-data-row"
                                style={{
                                    backgroundColor: row.highlight
                                        ? "rgba(27,47,14,0.05)"
                                        : "transparent",
                                }}
                            >
                                {/* 曜日区分 */}
                                <div className="rate-cell-label">
                                    <span className="rate-day-main">
                                        {row.label}
                                    </span>
                                    <span className="rate-day-sub">
                                        （{row.sub}）
                                    </span>
                                </div>
                                {/* 基本料金 */}
                                <div className="rate-cell-base">
                                    <span className="rate-cell-mobile-label">
                                        1〜5名（基本）
                                    </span>
                                    <span className="rate-base-value">
                                        {row.base}
                                    </span>
                                </div>
                                {/* 6名以上追加 */}
                                <div className="rate-cell-extra">
                                    <span className="rate-cell-mobile-label">
                                        6名以上（1名・1泊につき）
                                    </span>
                                    <span className="rate-extra-value">
                                        +¥
                                        {rates.additionalGuestRate.toLocaleString()}{" "}
                                        / 人・泊
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p
                        style={{
                            fontSize: "0.78rem",
                            color: "#8a7868",
                            marginTop: "0.75rem",
                            lineHeight: 1.7,
                        }}
                    >
                        ※
                        1〜5名は人数にかかわらず同一料金。6人目から1名・1泊につき¥
                        {rates.additionalGuestRate.toLocaleString()}
                        （曜日問わず一律）。最大10名まで宿泊可能です。
                    </p>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "1rem",
                            marginTop: "1.5rem",
                            padding: "1rem 0",
                            borderTop: "1px solid rgba(180,140,80,0.3)",
                            borderBottom: "1px solid rgba(180,140,80,0.3)",
                            flexWrap: "wrap",
                        }}
                    >
                        <div>
                            <strong style={{ color: "#1e3c0e" }}>
                                保証料（返金制）
                            </strong>
                            <p
                                style={{
                                    color: "#7a6858",
                                    fontSize: "0.78rem",
                                    marginTop: "0.25rem",
                                }}
                            >
                                ご滞在後にトラブルがなければ全額返金します
                            </p>
                        </div>
                        <strong
                            style={{ color: "#1e3c0e", fontSize: "1.1rem" }}
                        >
                            ¥10,000 / 1滞在
                        </strong>
                    </div>

                    {/* 滞在サポート料（任意） */}
                    <div
                        style={{
                            marginTop: "2rem",
                            backgroundColor: "#faf5e8",
                            borderRadius: "4px",
                            padding: "2rem",
                            border: "1px solid rgba(180,140,80,0.3)",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "1rem",
                            }}
                        >
                            <div
                                style={{
                                    backgroundColor: "#e8dfc0",
                                    color: "#5c2e12",
                                    padding: "0.25rem 0.75rem",
                                    borderRadius: "2px",
                                    fontSize: "0.72rem",
                                    fontWeight: 700,
                                    whiteSpace: "nowrap",
                                    flexShrink: 0,
                                    letterSpacing: "0.05em",
                                    border: "1px solid rgba(92,46,18,0.25)",
                                }}
                            >
                                任意
                            </div>
                            <div>
                                <h3
                                    style={{
                                        fontFamily: "'Noto Serif JP', serif",
                                        fontSize: "1.1rem",
                                        fontWeight: 700,
                                        color: "#1e3c0e",
                                        marginBottom: "0.5rem",
                                    }}
                                >
                                    滞在サポート料：¥8,000 / 滞在
                                </h3>
                                <p
                                    style={{
                                        fontSize: "0.875rem",
                                        color: "#5a4838",
                                        lineHeight: 1.9,
                                    }}
                                >
                                    買い出しサポート（飯田市スーパーでの代行購入）・送迎（1〜4名）・各種コンシェルジュサービスを含みます。
                                    <br />
                                    <strong style={{ color: "#7a4020" }}>
                                        5名以上の送迎追加：
                                    </strong>
                                    +¥5,000（人数に関係なく一律・追加車両手配費）
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── ペット料金 ── */}
            <section
                style={{ backgroundColor: "#faf5e8", padding: "4rem 1.5rem" }}
            >
                <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            marginBottom: "1.5rem",
                        }}
                    >
                        <div
                            style={{
                                width: "32px",
                                height: "32px",
                                backgroundColor: "#1e3c0e",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
                            <FaDog size={15} color="#d4b070" />
                        </div>
                        <h2
                            style={{
                                fontFamily: "'Noto Serif JP', serif",
                                fontSize: "clamp(1.2rem, 2.5vw, 1.5rem)",
                                fontWeight: 700,
                                color: "#1e3c0e",
                            }}
                        >
                            ペット料金
                        </h2>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                backgroundColor: "#f2e8d0",
                                borderRadius: "4px",
                                overflow: "hidden",
                                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                                maxWidth: "560px",
                            }}
                        >
                            <thead>
                                <tr style={{ backgroundColor: "#1b2f0e" }}>
                                    <th
                                        style={{
                                            padding: "1rem 1.5rem",
                                            textAlign: "left",
                                            color: "#d4b070",
                                            fontSize: "0.82rem",
                                            fontWeight: 700,
                                        }}
                                    >
                                        ペット種別
                                    </th>
                                    <th
                                        style={{
                                            padding: "1rem 1.5rem",
                                            textAlign: "center",
                                            color: "#d4b070",
                                            fontSize: "0.82rem",
                                            fontWeight: 700,
                                        }}
                                    >
                                        料金（1泊）
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { label: "小型犬　1頭目", price: "¥2,500" },
                                    { label: "小型犬　2頭目", price: "¥1,500" },
                                    { label: "大型犬　1頭目", price: "¥3,500" },
                                    { label: "大型犬　2頭目", price: "¥2,500" },
                                ].map((row, i) => (
                                    <tr
                                        key={row.label}
                                        style={{
                                            borderBottom:
                                                i < 3
                                                    ? "1px solid rgba(180,140,80,0.18)"
                                                    : "none",
                                        }}
                                    >
                                        <td
                                            style={{
                                                padding: "1rem 1.5rem",
                                                fontSize: "0.9rem",
                                                color: "#2c1e10",
                                            }}
                                        >
                                            {row.label}
                                        </td>
                                        <td
                                            style={{
                                                padding: "1rem 1.5rem",
                                                textAlign: "center",
                                                fontSize: "1rem",
                                                color: "#1e3c0e",
                                                fontWeight: 700,
                                            }}
                                        >
                                            {row.price}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p
                        style={{
                            fontSize: "0.8rem",
                            color: "#8a7868",
                            marginTop: "0.85rem",
                            lineHeight: 1.7,
                        }}
                    >
                        ※
                        小型犬2頭または大型犬2頭まで。ペットは就寝時ケージが必要です。
                    </p>
                </div>
            </section>

            {/* ── 体験オプション料金 ── */}
            <section
                style={{ backgroundColor: "#f2e8d0", padding: "4rem 1.5rem" }}
            >
                <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            marginBottom: "1.5rem",
                        }}
                    >
                        <div
                            style={{
                                width: "32px",
                                height: "32px",
                                backgroundColor: "#1e3c0e",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
                            <FaLeaf size={14} color="#d4b070" />
                        </div>
                        <h2
                            style={{
                                fontFamily: "'Noto Serif JP', serif",
                                fontSize: "clamp(1.2rem, 2.5vw, 1.5rem)",
                                fontWeight: 700,
                                color: "#1e3c0e",
                            }}
                        >
                            体験オプション料金
                        </h2>
                    </div>

                    <div
                        style={{
                            overflowX: "auto",
                            WebkitOverflowScrolling: "touch",
                        }}
                    >
                        <table
                            style={{
                                width: "100%",
                                minWidth: "560px",
                                borderCollapse: "collapse",
                                backgroundColor: "#faf5e8",
                                borderRadius: "4px",
                                overflow: "hidden",
                                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                            }}
                        >
                            <thead>
                                <tr style={{ backgroundColor: "#1b2f0e" }}>
                                    {["体験名", "料金", "時期", "備考"].map(
                                        (h, i) => (
                                            <th
                                                key={h}
                                                style={{
                                                    padding: "1rem 1.5rem",
                                                    textAlign:
                                                        i === 0
                                                            ? "left"
                                                            : "center",
                                                    color: "#d4b070",
                                                    fontSize: "0.82rem",
                                                    fontWeight: 700,
                                                    letterSpacing: "0.04em",
                                                }}
                                            >
                                                {h}
                                            </th>
                                        ),
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {experienceOptions.map((row, i) => (
                                    <tr
                                        key={row.id}
                                        style={{
                                            borderBottom:
                                                i < experienceOptions.length - 1
                                                    ? "1px solid rgba(180,140,80,0.15)"
                                                    : "none",
                                            backgroundColor:
                                                i % 2 === 0
                                                    ? "transparent"
                                                    : "rgba(27,47,14,0.03)",
                                        }}
                                    >
                                        <td
                                            style={{ padding: "1.1rem 1.5rem" }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: "0.9rem",
                                                    color: "#2c1e10",
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {row.name}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: "0.75rem",
                                                    color: "#7a6858",
                                                    marginTop: "0.15rem",
                                                }}
                                            >
                                                {row.description}
                                            </div>
                                        </td>
                                        <td
                                            style={{
                                                padding: "1.1rem 1.5rem",
                                                textAlign: "center",
                                                fontSize: "0.95rem",
                                                color: "#1e3c0e",
                                                fontWeight: 700,
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {row.price}
                                        </td>
                                        <td
                                            style={{
                                                padding: "1.1rem 1.5rem",
                                                textAlign: "center",
                                                fontSize: "0.82rem",
                                                color: "#5a4838",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {row.season}
                                        </td>
                                        <td
                                            style={{
                                                padding: "1.1rem 1.5rem",
                                                textAlign: "center",
                                                fontSize: "0.78rem",
                                                color: "#7a4020",
                                                fontWeight: 600,
                                            }}
                                        >
                                            {row.note}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p
                        style={{
                            fontSize: "0.8rem",
                            color: "#8a7868",
                            marginTop: "0.85rem",
                            lineHeight: 1.7,
                        }}
                    >
                        ※
                        BBQ食材は買い出しサポートにてお客様が飯田市内スーパーで自由にお選びいただけます（食材セットの提供はありません）
                    </p>
                </div>
            </section>

            {/* ── 料金かんたん計算機 ── */}
            <section
                style={{ backgroundColor: "#1b2f0e", padding: "5rem 1.5rem" }}
            >
                <div style={{ maxWidth: "820px", margin: "0 auto" }}>
                    <SectionHeading
                        en="Calculator"
                        ja="料金かんたん計算機"
                        dark
                    />

                    <div
                        style={{
                            backgroundColor: "rgba(242,232,208,0.06)",
                            borderRadius: "4px",
                            padding: "2.5rem",
                            border: "1px solid rgba(212,176,112,0.18)",
                        }}
                        className="pricing-calculator"
                    >
                        {/* 曜日 + 人数 + 宿泊数 */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fit, minmax(250px, 1fr))",
                                gap: "1.5rem",
                                marginBottom: "1.5rem",
                            }}
                        >
                            <div>
                                <label
                                    style={{
                                        color: "#d4b070",
                                        fontSize: "0.78rem",
                                        fontWeight: 700,
                                        display: "block",
                                        marginBottom: "0.5rem",
                                        letterSpacing: "0.08em",
                                    }}
                                >
                                    曜日区分
                                </label>
                                <select
                                    value={dayType}
                                    onChange={(e) => setDayType(e.target.value)}
                                    style={selectStyle}
                                >
                                    <option
                                        value="weekday"
                                        style={{ backgroundColor: "#1b2f0e" }}
                                    >
                                        平日（月〜木・祝日を除く）¥
                                        {rates.weekdayRate.toLocaleString()}
                                    </option>
                                    <option
                                        value="weekend"
                                        style={{ backgroundColor: "#1b2f0e" }}
                                    >
                                        休日（金〜日・祝日）¥
                                        {rates.holidayRate.toLocaleString()}
                                    </option>
                                    <option
                                        value="period-0"
                                        style={{ backgroundColor: "#1b2f0e" }}
                                    >
                                        特別日（GW・お盆・年末年始等）¥
                                        {(
                                            rates.periodRates[0]?.rate ??
                                            rates.baseRate
                                        ).toLocaleString()}
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label
                                    style={{
                                        color: "#d4b070",
                                        fontSize: "0.78rem",
                                        fontWeight: 700,
                                        display: "block",
                                        marginBottom: "0.5rem",
                                        letterSpacing: "0.08em",
                                    }}
                                >
                                    人数
                                </label>
                                <select
                                    value={guests}
                                    onChange={(e) =>
                                        setGuests(Number(e.target.value))
                                    }
                                    style={selectStyle}
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
                                        (n) => (
                                            <option
                                                key={n}
                                                value={n}
                                                style={{
                                                    backgroundColor: "#1b2f0e",
                                                }}
                                            >
                                                {n}名
                                                {n <= 5
                                                    ? ""
                                                    : `（+¥${((n - 5) * rates.additionalGuestRate).toLocaleString()}/泊）`}
                                            </option>
                                        ),
                                    )}
                                </select>
                            </div>

                            <div>
                                <label
                                    style={{
                                        color: "#d4b070",
                                        fontSize: "0.78rem",
                                        fontWeight: 700,
                                        display: "block",
                                        marginBottom: "0.5rem",
                                        letterSpacing: "0.08em",
                                    }}
                                >
                                    宿泊数
                                </label>
                                <select
                                    value={nights}
                                    onChange={(e) =>
                                        setNights(Number(e.target.value))
                                    }
                                    style={selectStyle}
                                >
                                    {[1, 2, 3, 4].map((night) => (
                                        <option
                                            key={night}
                                            value={night}
                                            style={{
                                                backgroundColor: "#1b2f0e",
                                            }}
                                        >
                                            {night}泊{night + 1}日
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* ペット */}
                        <div style={{ marginBottom: "1.5rem" }}>
                            <label
                                style={{
                                    color: "#d4b070",
                                    fontSize: "0.78rem",
                                    fontWeight: 700,
                                    display: "block",
                                    marginBottom: "0.5rem",
                                    letterSpacing: "0.08em",
                                }}
                            >
                                ペット
                            </label>
                            <select
                                value={petFee}
                                onChange={(e) =>
                                    setPetFee(Number(e.target.value))
                                }
                                style={selectStyle}
                            >
                                {petOptions.map((opt) => (
                                    <option
                                        key={opt.label}
                                        value={opt.value}
                                        style={{ backgroundColor: "#1b2f0e" }}
                                    >
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 滞在サポート料 */}
                        <div style={{ marginBottom: "1.5rem" }}>
                            <label
                                style={{
                                    color: "#d4b070",
                                    fontSize: "0.78rem",
                                    fontWeight: 700,
                                    display: "block",
                                    marginBottom: "0.5rem",
                                    letterSpacing: "0.08em",
                                }}
                            >
                                滞在サポート料
                            </label>
                            <button
                                onClick={() =>
                                    setSupportEnabled(!supportEnabled)
                                }
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.6rem",
                                    padding: "0.75rem 1.25rem",
                                    borderRadius: "3px",
                                    border: supportEnabled
                                        ? "1px solid rgba(212,176,112,0.6)"
                                        : "1px solid rgba(212,176,112,0.2)",
                                    backgroundColor: supportEnabled
                                        ? "rgba(212,176,112,0.15)"
                                        : "rgba(242,232,208,0.05)",
                                    color: supportEnabled
                                        ? "#d4b070"
                                        : "rgba(240,232,208,0.6)",
                                    fontSize: "0.88rem",
                                    fontWeight: supportEnabled ? 700 : 400,
                                    cursor: "pointer",
                                    transition: "all 0.18s",
                                }}
                            >
                                <div
                                    style={{
                                        width: "18px",
                                        height: "18px",
                                        borderRadius: "3px",
                                        border: supportEnabled
                                            ? "none"
                                            : "1.5px solid rgba(212,176,112,0.5)",
                                        backgroundColor: supportEnabled
                                            ? "#d4b070"
                                            : "transparent",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                        transition: "all 0.18s",
                                    }}
                                >
                                    {supportEnabled && (
                                        <svg
                                            viewBox="0 0 12 12"
                                            width="12"
                                            height="12"
                                        >
                                            <path
                                                d="M2 6l3 3 5-5"
                                                stroke="#1b2f0e"
                                                strokeWidth="2"
                                                fill="none"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                    )}
                                </div>
                                {guests >= 5
                                    ? `滞在サポート料を追加する（+¥13,000：¥8,000 + 送迎追加¥5,000）`
                                    : `滞在サポート料を追加する（+¥8,000）`}
                            </button>
                            {guests >= 5 && (
                                <p
                                    style={{
                                        fontSize: "0.72rem",
                                        color: "rgba(240,232,208,0.5)",
                                        marginTop: "0.4rem",
                                    }}
                                >
                                    ※
                                    5名以上のため送迎追加費¥5,000が含まれます（¥8,000
                                    + ¥5,000）
                                </p>
                            )}
                        </div>

                        {/* 体験オプション */}
                        <div style={{ marginBottom: "2rem" }}>
                            <label
                                style={{
                                    color: "#d4b070",
                                    fontSize: "0.78rem",
                                    fontWeight: 700,
                                    display: "block",
                                    marginBottom: "0.75rem",
                                    letterSpacing: "0.08em",
                                }}
                            >
                                体験オプション（複数選択可）
                            </label>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "repeat(auto-fit, minmax(200px, 1fr))",
                                    gap: "0.4rem",
                                }}
                            >
                                {experienceOptions.map((exp, idx) => (
                                    <button
                                        key={exp.id}
                                        onClick={() => toggleExperience(idx)}
                                        style={{
                                            padding: "0.7rem 1rem",
                                            borderRadius: "3px",
                                            border: selectedExperiences.includes(
                                                idx,
                                            )
                                                ? "1px solid rgba(212,176,112,0.6)"
                                                : "1px solid rgba(212,176,112,0.2)",
                                            backgroundColor:
                                                selectedExperiences.includes(
                                                    idx,
                                                )
                                                    ? "rgba(212,176,112,0.18)"
                                                    : "rgba(242,232,208,0.05)",
                                            color: selectedExperiences.includes(
                                                idx,
                                            )
                                                ? "#d4b070"
                                                : "rgba(240,232,208,0.75)",
                                            fontSize: "0.8rem",
                                            fontWeight:
                                                selectedExperiences.includes(
                                                    idx,
                                                )
                                                    ? 700
                                                    : 400,
                                            cursor: "pointer",
                                            textAlign: "left",
                                            transition: "all 0.18s",
                                        }}
                                    >
                                        {exp.label}
                                    </button>
                                ))}
                            </div>
                            {selectedExperiences.some(
                                (idx) => experienceOptions[idx].perPerson > 0,
                            ) && (
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.4rem",
                                        color: "rgba(240,232,208,0.55)",
                                        fontSize: "0.75rem",
                                        marginTop: "0.5rem",
                                    }}
                                >
                                    <FaInfoCircle size={12} />
                                    1人あたり料金の体験は、選択した人数分で計算されます
                                </div>
                            )}
                        </div>

                        {/* Result */}
                        <div
                            style={{
                                backgroundColor: "rgba(212,176,112,0.08)",
                                border: "1px solid rgba(212,176,112,0.3)",
                                borderRadius: "4px",
                                padding: "1.5rem",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "0.5rem",
                                    marginBottom: "1rem",
                                }}
                            >
                                {[
                                    {
                                        label: `基本宿泊料（1〜5名・${nights}泊）`,
                                        value: accommodationFee,
                                    },
                                    ...(guestExtra > 0
                                        ? [
                                              {
                                                  label: `追加人数料金（${guests - 5}名 × ${nights}泊）`,
                                                  value: guestExtra,
                                              },
                                          ]
                                        : []),
                                    ...(supportEnabled
                                        ? [
                                              {
                                                  label: "滞在サポート料",
                                                  value: 8000,
                                              },
                                          ]
                                        : []),
                                    ...(transferSurcharge > 0
                                        ? [
                                              {
                                                  label: "送迎追加（5名以上・一律）",
                                                  value: transferSurcharge,
                                              },
                                          ]
                                        : []),
                                    ...(petFee > 0
                                        ? [
                                              {
                                                  label: `ペット料金（${nights}泊）`,
                                                  value: petTotal,
                                              },
                                          ]
                                        : []),
                                    ...(experienceFee > 0
                                        ? [
                                              {
                                                  label: "体験オプション",
                                                  value: experienceFee,
                                              },
                                          ]
                                        : []),
                                    { label: "保証料（返金制）", value: 10000 },
                                ].map((row) => (
                                    <div
                                        key={row.label}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            fontSize: "0.85rem",
                                            color: "rgba(240,232,208,0.7)",
                                        }}
                                    >
                                        <span>{row.label}</span>
                                        <span>
                                            ¥{row.value.toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                                <div
                                    style={{
                                        borderTop:
                                            "1px solid rgba(212,176,112,0.25)",
                                        paddingTop: "0.75rem",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginTop: "0.25rem",
                                    }}
                                >
                                    <span
                                        style={{
                                            color: "#d4b070",
                                            fontWeight: 700,
                                            fontSize: "1rem",
                                        }}
                                    >
                                        合計
                                    </span>
                                    <span
                                        style={{
                                            color: "#d4b070",
                                            fontWeight: 700,
                                            fontSize: "1.75rem",
                                        }}
                                    >
                                        ¥{total.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            <Link
                                to="/reservation"
                                style={{
                                    display: "block",
                                    backgroundColor: "#5c2e12",
                                    color: "#f0e8d0",
                                    padding: "0.875rem",
                                    borderRadius: "3px",
                                    textDecoration: "none",
                                    fontWeight: 700,
                                    textAlign: "center",
                                    fontSize: "0.95rem",
                                    border: "1px solid rgba(212,176,112,0.2)",
                                }}
                            >
                                この内容で予約する
                            </Link>
                            <p
                                style={{
                                    fontSize: "0.7rem",
                                    color: "rgba(240,232,208,0.4)",
                                    textAlign: "center",
                                    marginTop: "0.5rem",
                                    lineHeight: 1.7,
                                }}
                            >
                                ※
                                あくまで目安です。最終料金は予約確認時にご案内します
                                <br />※
                                保証料¥10,000はご滞在後にトラブルがなければ全額返金されます
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 料金例 ── */}
            <section
                style={{ backgroundColor: "#faf5e8", padding: "5rem 1.5rem" }}
            >
                <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
                    <SectionHeading en="Price Examples" ja="料金例" />
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(300px, 1fr))",
                            gap: "1.5rem",
                        }}
                    >
                        {priceExamples.map((ex, i) => (
                            <div
                                key={i}
                                style={{
                                    backgroundColor: "#f2e8d0",
                                    border: "1px solid rgba(180,140,80,0.2)",
                                    borderTop: "3px solid #1e3c0e",
                                    borderRadius: "6px",
                                    padding: "1.75rem",
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                <div style={{ marginBottom: "1rem" }}>
                                    <div
                                        style={{
                                            width: "36px",
                                            height: "36px",
                                            backgroundColor: "#faf5e8",
                                            border: "1px solid rgba(180,140,80,0.25)",
                                            borderRadius: "50%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            marginBottom: "0.75rem",
                                        }}
                                    >
                                        {ex.icon}
                                    </div>
                                    <h3
                                        style={{
                                            fontFamily:
                                                "'Noto Serif JP', serif",
                                            fontSize: "0.97rem",
                                            fontWeight: 700,
                                            color: "#1e3c0e",
                                            marginBottom: "0.35rem",
                                            lineHeight: 1.5,
                                        }}
                                    >
                                        {ex.title}
                                    </h3>
                                    <p
                                        style={{
                                            fontSize: "0.78rem",
                                            color: "#7a6858",
                                            lineHeight: 1.6,
                                        }}
                                    >
                                        {ex.desc}
                                    </p>
                                </div>

                                <div
                                    style={{
                                        backgroundColor: "#faf5e8",
                                        borderRadius: "4px",
                                        padding: "1rem",
                                        border: "1px solid rgba(180,140,80,0.15)",
                                        flexGrow: 1,
                                        marginBottom: "1rem",
                                    }}
                                >
                                    {ex.rows.map((row, j) => (
                                        <div
                                            key={j}
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                padding: "0.4rem 0",
                                                borderBottom:
                                                    j < ex.rows.length - 1
                                                        ? "1px solid rgba(180,140,80,0.1)"
                                                        : "none",
                                                fontSize: "0.82rem",
                                                color: "#5a4838",
                                            }}
                                        >
                                            <span>{row.label}</span>
                                            <span
                                                style={{
                                                    fontWeight: 600,
                                                    color: "#2c1e10",
                                                }}
                                            >
                                                ¥{row.value.toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        borderTop:
                                            "2px solid rgba(196,122,48,0.35)",
                                        paddingTop: "0.85rem",
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: "0.82rem",
                                            color: "#5a4838",
                                            fontWeight: 600,
                                        }}
                                    >
                                        合計（税込）
                                    </span>
                                    <span
                                        style={{
                                            fontFamily:
                                                "'Noto Serif JP', serif",
                                            fontSize: "1.35rem",
                                            fontWeight: 700,
                                            color: "#c47a30",
                                        }}
                                    >
                                        ¥{ex.total.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <p
                        style={{
                            textAlign: "center",
                            fontSize: "0.78rem",
                            color: "#8a7868",
                            marginTop: "1.5rem",
                        }}
                    >
                        ※
                        上記はあくまでも料金例です。実際の料金は滞在内容・日程によって異なります。保証料¥10,000はご滞在後にトラブルがなければ全額返金されます。
                    </p>
                </div>
            </section>

            {/* ── ご注意事項 ── */}
            <section
                style={{ backgroundColor: "#f2e8d0", padding: "3rem 1.5rem" }}
            >
                <div style={{ maxWidth: "820px", margin: "0 auto" }}>
                    <h3
                        style={{
                            fontFamily: "'Noto Serif JP', serif",
                            fontSize: "1.1rem",
                            fontWeight: 700,
                            color: "#1e3c0e",
                            marginBottom: "1.25rem",
                        }}
                    >
                        ご注意事項・お支払いについて
                    </h3>
                    <ul
                        style={{
                            listStyle: "none",
                            padding: 0,
                            margin: 0,
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.75rem",
                        }}
                    >
                        {[
                            "料金はすべて税込みです",
                            "お支払いはすべて来場時（当日）現金払いのみとなります",
                            "特別日（GW・お盆・年末年始等）は別途設定する場合があります",
                            "チェックイン・チェックアウト時間はご相談に応じます",
                            "ご不明な点はお気軽にお問い合わせください",
                        ].map((note) => (
                            <li
                                key={note}
                                style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "0.5rem",
                                    fontSize: "0.875rem",
                                    color: "#5a4838",
                                    lineHeight: 1.7,
                                }}
                            >
                                <FaChevronRight
                                    size={13}
                                    color="#7a4020"
                                    style={{ flexShrink: 0, marginTop: "3px" }}
                                />
                                {note}
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ── CTA ── */}
            <section
                style={{
                    background:
                        "linear-gradient(135deg, #1b2f0e 0%, #0e1a08 100%)",
                    padding: "4.5rem 1.5rem",
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
                <h2
                    style={{
                        fontFamily: "'Noto Serif JP', serif",
                        fontSize: "clamp(1.5rem, 3vw, 2rem)",
                        fontWeight: 700,
                        color: "#f0e8d0",
                        marginBottom: "0.75rem",
                    }}
                >
                    ご予約はこちらから
                </h2>
                <p
                    style={{
                        color: "rgba(240,232,208,0.7)",
                        marginBottom: "2rem",
                        fontSize: "0.88rem",
                        lineHeight: 1.9,
                    }}
                >
                    ご不明な点はお気軽にお問い合わせください
                </p>
                <div
                    style={{
                        display: "flex",
                        gap: "1rem",
                        justifyContent: "center",
                        flexWrap: "wrap",
                    }}
                >
                    <Link
                        to="/faq"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            backgroundColor: "transparent",
                            color: "#f0e8d0",
                            padding: "0.8rem 1.75rem",
                            borderRadius: "4px",
                            border: "1px solid rgba(240,232,208,0.4)",
                            textDecoration: "none",
                            fontWeight: 700,
                            fontSize: "0.9rem",
                        }}
                    >
                        よくある質問 <FaChevronRight size={12} />
                    </Link>
                    <Link
                        to="/reservation"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            backgroundColor: "#c47a30",
                            color: "#fff",
                            padding: "0.8rem 1.75rem",
                            borderRadius: "4px",
                            textDecoration: "none",
                            fontWeight: 700,
                            fontSize: "0.9rem",
                        }}
                    >
                        予約・お問い合わせ <FaChevronRight size={12} />
                    </Link>
                </div>
            </section>

            <style>{`
        /* ── 基本宿泊料テーブル ── */
        .rate-table-wrap {
          background: #faf5e8;
          border-radius: 4px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.07);
        }
        .rate-header-row {
          display: flex;
          align-items: center;
          background: #1b2f0e;
          padding: 1rem 1.5rem;
          gap: 1rem;
          color: #d4b070;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.05em;
        }
        .rate-data-row {
          display: flex;
          align-items: center;
          padding: 1.1rem 1.5rem;
          gap: 1rem;
          border-bottom: 1px solid rgba(180,140,80,0.15);
          transition: background 0.15s;
        }
        .rate-cell-label {
          flex: 2;
          display: flex;
          align-items: baseline;
          gap: 0.25rem;
          flex-wrap: wrap;
        }
        .rate-day-main {
          font-size: 0.95rem;
          font-weight: 600;
          color: #2c1e10;
        }
        .rate-day-sub {
          font-size: 0.78rem;
          color: #7a6858;
        }
        .rate-cell-base {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.15rem;
        }
        .rate-cell-extra {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.15rem;
        }
        .rate-base-value {
          font-size: 1.05rem;
          font-weight: 700;
          color: #1e3c0e;
        }
        .rate-extra-value {
          font-size: 0.9rem;
          font-weight: 600;
          color: #7a4020;
        }
        .rate-cell-mobile-label {
          display: none;
          font-size: 0.65rem;
          color: #8a7868;
          font-weight: 500;
        }

        @media (max-width: 560px) {
          .rate-header-row { display: none; }
          .rate-data-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
            padding: 1.1rem 1.25rem;
          }
          .rate-cell-label { flex: none; }
          .rate-cell-base, .rate-cell-extra {
            flex: none;
            align-items: flex-start;
            flex-direction: row;
            justify-content: space-between;
            width: 100%;
            padding: 0.45rem 0.75rem;
            background: rgba(180,140,80,0.07);
            border-radius: 3px;
          }
          .rate-cell-mobile-label { display: inline; }
          .rate-base-value { font-size: 1rem; }
          .rate-extra-value { font-size: 0.88rem; }
        }
      `}</style>
        </div>
    );
}
