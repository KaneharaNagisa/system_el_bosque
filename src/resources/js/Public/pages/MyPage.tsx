import { usePage } from "@inertiajs/react";
import { useState } from "react";
import { Link, useNavigate } from "../router";
import {
    FaUser,
    FaEdit,
    FaSave,
    FaTimes,
    FaKey,
    FaSignOutAlt,
    FaUserSlash,
    FaCalendarAlt,
    FaChevronRight,
    FaPaw,
    FaCheckCircle,
    FaExclamationTriangle,
    FaConciergeBell,
    FaBan,
    FaYenSign,
    FaBell,
    FaChevronDown,
    FaChevronUp,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.7rem 1rem",
    backgroundColor: "#faf5e8",
    border: "1px solid rgba(30,60,14,0.2)",
    borderRadius: "3px",
    fontSize: "0.88rem",
    color: "#2c1e10",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
    fontFamily: "'Noto Sans JP', sans-serif",
};

const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.78rem",
    fontWeight: 700,
    color: "#1e3c0e",
    marginBottom: "0.35rem",
    letterSpacing: "0.04em",
};

const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%235a4838' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 0.75rem center",
    paddingRight: "2rem",
};

const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: "4.5rem",
    resize: "vertical",
    lineHeight: 1.6,
};

const petLabelMap: Record<string, string> = {
    no: "なし",
    small: "小型犬1頭",
    small2: "小型犬2頭",
    large: "大型犬1頭",
    large2: "大型犬2頭",
};

const familyLabelMap: Record<string, string> = {
    individual: "個人",
    friends: "友人",
    couple: "カップル",
    married: "ご夫婦",
    family: "ご家族（お子さんあり）",
};

function formatPetDisplay(
    hasPet: string,
    petBreed: string,
    petBreed2?: string,
): string {
    if (!hasPet || hasPet === "no") return "なし";
    if (hasPet === "small2" || hasPet === "large2") {
        const breeds = [petBreed, petBreed2].filter(Boolean);
        const label = petLabelMap[hasPet] || hasPet;
        return breeds.length > 0 ? `${label}（${breeds.join(" / ")}）` : label;
    }
    const label = petLabelMap[hasPet] || hasPet;
    return petBreed ? `${label}（${petBreed}）` : label;
}

function formatFamilyDisplay(hasFamily: string): string {
    return familyLabelMap[hasFamily] || hasFamily || "−";
}

// ── マイページ向けお知らせ（管理画面の target:"mypage"|"both" × status:"published" と同期） ──
interface NewsItem {
    id: string;
    title: string;
    content: string;
    publishDate: string;
    isNew?: boolean; // 公開から7日以内
}

const mypageNews: NewsItem[] = [
    {
        id: "NEWS-004",
        title: "【会員様限定】リピーター特典のご案内",
        content:
            "2回目以降のご利用の会員様には、滞在サポート料を特別割引にてご提供いたします。ご予約の備考欄に「リピーター割引希望」とご記入ください。詳しくはお問い合わせフォームよりご連絡ください。",
        publishDate: "2026-07-01",
        isNew: true,
    },
    {
        id: "NEWS-005",
        title: "【会員様向け】2026年秋シーズン先行予約のご案内",
        content:
            "会員様限定で、2026年秋シーズン（9月〜11月）の先行予約を開始いたします。稲刈り体験・星空ガイドなど秋ならではのオプションもご用意しています。人気の連休はお早めにご予約ください。",
        publishDate: "2026-06-15",
        isNew: true,
    },
    {
        id: "NEWS-001",
        title: "2026年シーズン営業開始のお知らせ",
        content:
            "3月1日より2026年シーズンの営業を開始いたします。今シーズンも安心・快適な滞在をご提供できるよう、スタッフ一同心よりお待ちしております。皆様のご予約をお待ちしております。",
        publishDate: "2026-02-15",
    },
    {
        id: "NEWS-003",
        title: "GW期間の予約受付開始",
        content:
            "ゴールデンウィーク期間（4/29〜5/5）の予約受付を開始いたしました。特別料金期間となりますのでご注意ください。田植え体験もご予約いただけます。",
        publishDate: "2026-03-01",
    },
];

/* Mock reservation history */
const mockReservations = [
    {
        id: "RSV-2026-001",
        checkin: "2026-05-01",
        checkout: "2026-05-03",
        guests: 3,
        status: "confirmed",
        statusLabel: "予約確定",
        pets: "トイプードル 1頭",
        experiences: ["田植え体験"],
        supportPlan: "yes",
        totalAmount: 76500,
    },
    {
        id: "RSV-2026-002",
        checkin: "2026-08-14",
        checkout: "2026-08-16",
        guests: 4,
        status: "pending",
        statusLabel: "確認中",
        pets: "なし",
        experiences: ["BBQグリルレンタル", "夏野菜収穫体験"],
        supportPlan: "no",
        totalAmount: 55500,
    },
    {
        id: "RSV-2025-003",
        checkin: "2025-10-10",
        checkout: "2025-10-12",
        guests: 2,
        status: "completed",
        statusLabel: "利用済み",
        pets: "トイプードル 1頭",
        experiences: ["稲刈り体験", "星空ガイド"],
        supportPlan: "yes",
        totalAmount: 68000,
    },
];

function canCancel(checkin: string, status: string): boolean {
    if (status === "completed" || status === "cancelled") return false;
    const checkinDate = new Date(checkin);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.floor(
        (checkinDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diffDays >= 7;
}

const WEEKDAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

function formatDateJP(dateStr: string): string {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return `${y}/${m}/${d}（${WEEKDAY_NAMES[date.getDay()]}）`;
}

function statusColor(status: string) {
    switch (status) {
        case "confirmed":
            return {
                bg: "rgba(30,60,14,0.08)",
                color: "#1e3c0e",
                border: "rgba(30,60,14,0.2)",
            };
        case "pending":
            return {
                bg: "rgba(196,122,48,0.08)",
                color: "#7a4020",
                border: "rgba(196,122,48,0.2)",
            };
        case "completed":
            return {
                bg: "rgba(138,120,104,0.08)",
                color: "#8a7868",
                border: "rgba(138,120,104,0.2)",
            };
        default:
            return {
                bg: "#f2e8d0",
                color: "#5a4838",
                border: "rgba(180,140,80,0.15)",
            };
    }
}

export function MyPage() {
    const { user, isLoggedIn, logout, updateProfile, deleteAccount } =
        useAuth();
    const { news = [], reservations = [] } = usePage<{
        news?: Array<{
            id: number;
            title: string;
            content: string;
            publish_date: string;
        }>;
        reservations?: typeof mockReservations;
    }>().props;
    const databaseNews = news.map((item) => ({
        id: String(item.id),
        title: item.title,
        content: item.content,
        publishDate: item.publish_date,
    }));
    const displayedNews = databaseNews;
    const navigate = useNavigate();
    const [editing, setEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editSaved, setEditSaved] = useState(false);
    const [cancelingId, setCancelingId] = useState<string | null>(null);
    const [canceledIds, setCanceledIds] = useState<Set<string>>(new Set());
    const [expandedNewsId, setExpandedNewsId] = useState<string | null>(
        displayedNews[0]?.id ?? null,
    );

    const [editForm, setEditForm] = useState({
        lastName: user?.lastName || "",
        firstName: user?.firstName || "",
        lastNameKana: user?.lastNameKana || "",
        firstNameKana: user?.firstNameKana || "",
        postalCode: "",
        address: user?.address || "",
        hasPet: user?.hasPet || "no",
        petBreed: user?.petBreed || "",
        petBreed2: user?.petBreed2 || "",
        hasFamily: user?.hasFamily || "individual",
        concerns: user?.concerns || "",
        howFound: user?.howFound || "",
        expectations: user?.expectations || "",
    });

    if (!isLoggedIn || !user) {
        return (
            <div>
                <div
                    style={{
                        background:
                            "linear-gradient(135deg, #0e1a08 0%, #1b2f0e 60%, #254510 100%)",
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
                        マイページ
                    </h1>
                </div>
                <section
                    style={{
                        backgroundColor: "#f2e8d0",
                        padding: "5rem 1.5rem",
                        textAlign: "center",
                    }}
                >
                    <p style={{ color: "#5a4838", marginBottom: "1.5rem" }}>
                        マイページの閲覧にはログインが必要です。
                    </p>
                    <Link
                        to="/login"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            backgroundColor: "#5c2e12",
                            color: "#f0e8d0",
                            padding: "0.8rem 1.75rem",
                            borderRadius: "3px",
                            textDecoration: "none",
                            fontWeight: 700,
                            fontSize: "0.9rem",
                        }}
                    >
                        ログインページへ <FaChevronRight size={12} />
                    </Link>
                </section>
            </div>
        );
    }

    const handleEditChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
    ) => {
        const { name, value } = e.target;
        if (name === "hasPet") {
            if (value === "no") {
                setEditForm((prev) => ({
                    ...prev,
                    hasPet: value,
                    petBreed: "",
                    petBreed2: "",
                }));
            } else if (value !== "small2" && value !== "large2") {
                setEditForm((prev) => ({
                    ...prev,
                    hasPet: value,
                    petBreed2: "",
                }));
            } else {
                setEditForm((prev) => ({ ...prev, hasPet: value }));
            }
        } else {
            setEditForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const parseAddress = (
        addr: string,
    ): { postalCode: string; address: string } => {
        const match = addr.match(/^〒(\d{3}-?\d{4})\s*(.*)$/);
        if (match) return { postalCode: match[1], address: match[2] };
        return { postalCode: "", address: addr };
    };

    const handleSave = () => {
        const combinedAddress = editForm.postalCode
            ? `〒${editForm.postalCode} ${editForm.address}`
            : editForm.address;
        updateProfile(
            {
                lastName: editForm.lastName,
                firstName: editForm.firstName,
                lastNameKana: editForm.lastNameKana,
                firstNameKana: editForm.firstNameKana,
                address: combinedAddress,
                hasPet: editForm.hasPet,
                petBreed: editForm.petBreed,
                petBreed2: editForm.petBreed2,
                hasFamily: editForm.hasFamily,
                concerns: editForm.concerns,
                howFound: editForm.howFound,
                expectations: editForm.expectations,
            },
            () => {
                setEditing(false);
                setEditSaved(true);
                setTimeout(() => setEditSaved(false), 3000);
            },
        );
    };

    const handleDeleteAccount = () => {
        deleteAccount();
    };

    const handleLogout = () => {
        logout();
    };

    const sectionCard = (children: React.ReactNode) => (
        <div
            style={{
                backgroundColor: "#faf5e8",
                borderRadius: "4px",
                padding: "2rem",
                boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
                border: "1px solid rgba(180,140,80,0.15)",
                marginBottom: "1.5rem",
            }}
        >
            {children}
        </div>
    );

    const sectionTitle = (icon: React.ReactNode, title: string) => (
        <h2
            style={{
                fontFamily: "'Noto Serif JP', serif",
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "#1e3c0e",
                marginBottom: "1.5rem",
                paddingBottom: "0.75rem",
                borderBottom: "2px solid rgba(180,140,80,0.2)",
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
            }}
        >
            {icon}
            {title}
        </h2>
    );

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
                    My Page
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
                    マイページ
                </h1>
                <p
                    style={{
                        color: "rgba(240,232,208,0.7)",
                        marginTop: "1rem",
                        fontSize: "0.92rem",
                    }}
                >
                    {user.lastName} {user.firstName} 様
                </p>
            </div>

            <section
                style={{ backgroundColor: "#f2e8d0", padding: "4rem 1.5rem" }}
            >
                <div style={{ maxWidth: "780px", margin: "0 auto" }}>
                    {/* Save success message */}
                    {editSaved && (
                        <div
                            style={{
                                backgroundColor: "rgba(30,60,14,0.08)",
                                border: "1px solid rgba(30,60,14,0.2)",
                                borderRadius: "4px",
                                padding: "1rem 1.25rem",
                                marginBottom: "1.5rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.6rem",
                            }}
                        >
                            <FaCheckCircle size={16} color="#1e3c0e" />
                            <span
                                style={{
                                    fontSize: "0.88rem",
                                    color: "#1e3c0e",
                                    fontWeight: 500,
                                }}
                            >
                                会員情報を更新しました。
                            </span>
                        </div>
                    )}

                    {/* ========== 0. お知らせ ========== */}
                    {displayedNews.length > 0 &&
                        sectionCard(
                            <>
                                {sectionTitle(
                                    <FaBell size={16} color="#1e3c0e" />,
                                    "お知らせ",
                                )}
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "0",
                                    }}
                                >
                                    {displayedNews.map((item, idx) => {
                                        const isExpanded =
                                            expandedNewsId === item.id;
                                        const isLast =
                                            idx === displayedNews.length - 1;
                                        return (
                                            <div
                                                key={item.id}
                                                style={{
                                                    borderBottom: isLast
                                                        ? "none"
                                                        : "1px solid rgba(180,140,80,0.12)",
                                                }}
                                            >
                                                {/* タイトル行（クリックで開閉） */}
                                                <button
                                                    onClick={() =>
                                                        setExpandedNewsId(
                                                            isExpanded
                                                                ? null
                                                                : item.id,
                                                        )
                                                    }
                                                    style={{
                                                        width: "100%",
                                                        display: "flex",
                                                        alignItems:
                                                            "flex-start",
                                                        justifyContent:
                                                            "space-between",
                                                        gap: "0.75rem",
                                                        padding: "0.9rem 0",
                                                        backgroundColor:
                                                            "transparent",
                                                        border: "none",
                                                        cursor: "pointer",
                                                        textAlign: "left",
                                                        fontFamily:
                                                            "'Noto Sans JP', sans-serif",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            alignItems:
                                                                "flex-start",
                                                            gap: "0.6rem",
                                                            flex: 1,
                                                            minWidth: 0,
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                flexDirection:
                                                                    "column",
                                                                alignItems:
                                                                    "flex-start",
                                                                gap: "0.3rem",
                                                                flex: 1,
                                                                minWidth: 0,
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    gap: "0.5rem",
                                                                    flexWrap:
                                                                        "wrap",
                                                                }}
                                                            >
                                                                {item.isNew && (
                                                                    <span
                                                                        style={{
                                                                            backgroundColor:
                                                                                "#a03020",
                                                                            color: "#fff",
                                                                            fontSize:
                                                                                "0.62rem",
                                                                            fontWeight: 700,
                                                                            padding:
                                                                                "0.1rem 0.45rem",
                                                                            borderRadius:
                                                                                "2px",
                                                                            letterSpacing:
                                                                                "0.05em",
                                                                            flexShrink: 0,
                                                                        }}
                                                                    >
                                                                        NEW
                                                                    </span>
                                                                )}
                                                                <span
                                                                    style={{
                                                                        fontSize:
                                                                            "0.7rem",
                                                                        color: "#8a7868",
                                                                        flexShrink: 0,
                                                                    }}
                                                                >
                                                                    {item.publishDate.replace(
                                                                        /-/g,
                                                                        "/",
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <span
                                                                style={{
                                                                    fontSize:
                                                                        "0.9rem",
                                                                    fontWeight:
                                                                        isExpanded
                                                                            ? 700
                                                                            : 500,
                                                                    color: isExpanded
                                                                        ? "#1e3c0e"
                                                                        : "#2c1e10",
                                                                    lineHeight: 1.5,
                                                                    transition:
                                                                        "color 0.2s",
                                                                }}
                                                            >
                                                                {item.title}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span
                                                        style={{
                                                            color: "#8a7868",
                                                            flexShrink: 0,
                                                            marginTop: "0.2rem",
                                                        }}
                                                    >
                                                        {isExpanded ? (
                                                            <FaChevronUp
                                                                size={11}
                                                            />
                                                        ) : (
                                                            <FaChevronDown
                                                                size={11}
                                                            />
                                                        )}
                                                    </span>
                                                </button>

                                                {/* 本文（展開時） */}
                                                {isExpanded && (
                                                    <div
                                                        style={{
                                                            padding:
                                                                "0 0 1rem 0",
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                backgroundColor:
                                                                    "rgba(30,60,14,0.04)",
                                                                border: "1px solid rgba(30,60,14,0.1)",
                                                                borderRadius:
                                                                    "3px",
                                                                padding:
                                                                    "1rem 1.25rem",
                                                            }}
                                                        >
                                                            <p
                                                                style={{
                                                                    fontSize:
                                                                        "0.86rem",
                                                                    color: "#3a2c1e",
                                                                    lineHeight: 1.85,
                                                                    margin: 0,
                                                                    whiteSpace:
                                                                        "pre-wrap",
                                                                }}
                                                            >
                                                                {item.content}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </>,
                        )}

                    {/* ========== 1. Member Info ========== */}
                    {sectionCard(
                        <>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    flexWrap: "wrap",
                                    gap: "0.5rem",
                                }}
                            >
                                {sectionTitle(
                                    <FaUser size={16} color="#1e3c0e" />,
                                    "会員情報",
                                )}
                                {!editing && (
                                    <button
                                        onClick={() => {
                                            setEditForm({
                                                lastName: user.lastName,
                                                firstName: user.firstName,
                                                lastNameKana: user.lastNameKana,
                                                firstNameKana:
                                                    user.firstNameKana,
                                                postalCode: parseAddress(
                                                    user.address,
                                                ).postalCode,
                                                address: parseAddress(
                                                    user.address,
                                                ).address,
                                                hasPet: user.hasPet,
                                                petBreed: user.petBreed,
                                                petBreed2: user.petBreed2 || "",
                                                hasFamily: user.hasFamily,
                                                concerns: user.concerns,
                                                howFound: user.howFound,
                                                expectations: user.expectations,
                                            });
                                            setEditing(true);
                                        }}
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "0.35rem",
                                            backgroundColor:
                                                "rgba(30,60,14,0.06)",
                                            color: "#1e3c0e",
                                            border: "1px solid rgba(30,60,14,0.15)",
                                            borderRadius: "3px",
                                            padding: "0.5rem 1rem",
                                            fontSize: "0.82rem",
                                            fontWeight: 700,
                                            fontFamily:
                                                "'Noto Sans JP', sans-serif",
                                            cursor: "pointer",
                                            marginBottom: "1.5rem",
                                        }}
                                    >
                                        <FaEdit size={13} />
                                        編集
                                    </button>
                                )}
                            </div>

                            {editing ? (
                                /* Edit Mode */
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "1rem",
                                    }}
                                >
                                    {/* ── Non-editable fields ── */}
                                    <div
                                        style={{
                                            backgroundColor: "#f2e8d0",
                                            borderRadius: "3px",
                                            padding: "1rem 1.25rem",
                                            border: "1px solid rgba(180,140,80,0.12)",
                                        }}
                                    >
                                        <p
                                            style={{
                                                fontSize: "0.72rem",
                                                color: "#8a7868",
                                                marginBottom: "0.75rem",
                                                fontWeight: 600,
                                            }}
                                        >
                                            ※ 以下の項目は変更できません
                                        </p>
                                        <div
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns: "1fr 1fr",
                                                gap: "0.75rem",
                                            }}
                                            className="mypage-edit-grid"
                                        >
                                            <div>
                                                <label style={labelStyle}>
                                                    メールアドレス
                                                </label>
                                                <input
                                                    value={user.email}
                                                    disabled
                                                    style={{
                                                        ...inputStyle,
                                                        backgroundColor:
                                                            "#eee5d5",
                                                        color: "#8a7868",
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>
                                                    生年月日
                                                </label>
                                                <input
                                                    value={
                                                        user.birthDate
                                                            ? user.birthDate.replace(
                                                                  /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
                                                                  (
                                                                      _,
                                                                      y,
                                                                      m,
                                                                      d,
                                                                  ) =>
                                                                      `${y}年${parseInt(m)}月${parseInt(d)}日`,
                                                              )
                                                            : "未登録"
                                                    }
                                                    disabled
                                                    style={{
                                                        ...inputStyle,
                                                        backgroundColor:
                                                            "#eee5d5",
                                                        color: "#8a7868",
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── Editable fields ── */}
                                    <div
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "1fr 1fr",
                                            gap: "1rem",
                                        }}
                                        className="mypage-edit-grid"
                                    >
                                        {/* お名前 */}
                                        <div>
                                            <label style={labelStyle}>姓</label>
                                            <input
                                                name="lastName"
                                                value={editForm.lastName}
                                                onChange={handleEditChange}
                                                placeholder="例: 山田"
                                                style={inputStyle}
                                            />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>名</label>
                                            <input
                                                name="firstName"
                                                value={editForm.firstName}
                                                onChange={handleEditChange}
                                                placeholder="例: 太郎"
                                                style={inputStyle}
                                            />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>
                                                姓（ふりがな）
                                            </label>
                                            <input
                                                name="lastNameKana"
                                                value={editForm.lastNameKana}
                                                onChange={handleEditChange}
                                                placeholder="例: やまだ"
                                                style={inputStyle}
                                            />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>
                                                名（ふりがな）
                                            </label>
                                            <input
                                                name="firstNameKana"
                                                value={editForm.firstNameKana}
                                                onChange={handleEditChange}
                                                placeholder="例: たろう"
                                                style={inputStyle}
                                            />
                                        </div>

                                        {/* 郵便番号 + 住所 */}
                                        <div>
                                            <label style={labelStyle}>
                                                郵便番号
                                            </label>
                                            <input
                                                name="postalCode"
                                                value={editForm.postalCode}
                                                onChange={handleEditChange}
                                                placeholder="000-0000"
                                                style={inputStyle}
                                            />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>
                                                住所
                                            </label>
                                            <input
                                                name="address"
                                                value={editForm.address}
                                                onChange={handleEditChange}
                                                placeholder="都道府県市区町村番地"
                                                style={inputStyle}
                                            />
                                        </div>

                                        {/* ペット情報 */}
                                        <div>
                                            <label style={labelStyle}>
                                                ペットの有無
                                            </label>
                                            <select
                                                name="hasPet"
                                                value={editForm.hasPet}
                                                onChange={handleEditChange}
                                                style={selectStyle}
                                            >
                                                <option value="no">なし</option>
                                                <option value="small">
                                                    小型犬1頭
                                                </option>
                                                <option value="small2">
                                                    小型犬2頭
                                                </option>
                                                <option value="large">
                                                    大型犬1頭
                                                </option>
                                                <option value="large2">
                                                    大型犬2頭
                                                </option>
                                            </select>
                                        </div>
                                        {(editForm.hasPet === "small" ||
                                            editForm.hasPet === "large") && (
                                            <div>
                                                <label style={labelStyle}>
                                                    犬種
                                                </label>
                                                <input
                                                    name="petBreed"
                                                    value={editForm.petBreed}
                                                    onChange={handleEditChange}
                                                    placeholder="例：トイプードル"
                                                    style={inputStyle}
                                                />
                                            </div>
                                        )}
                                        {(editForm.hasPet === "small2" ||
                                            editForm.hasPet === "large2") && (
                                            <>
                                                <div>
                                                    <label
                                                        style={{
                                                            ...labelStyle,
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                display:
                                                                    "inline-flex",
                                                                alignItems:
                                                                    "center",
                                                                justifyContent:
                                                                    "center",
                                                                backgroundColor:
                                                                    "#5c2e12",
                                                                color: "#f0e8d0",
                                                                width: "18px",
                                                                height: "18px",
                                                                borderRadius:
                                                                    "50%",
                                                                fontSize:
                                                                    "0.65rem",
                                                                fontWeight: 700,
                                                                marginRight:
                                                                    "0.4rem",
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            1
                                                        </span>
                                                        1頭目 ─ 犬種
                                                    </label>
                                                    <input
                                                        name="petBreed"
                                                        value={
                                                            editForm.petBreed
                                                        }
                                                        onChange={
                                                            handleEditChange
                                                        }
                                                        placeholder="例：トイプードル"
                                                        style={inputStyle}
                                                    />
                                                </div>
                                                <div>
                                                    <label
                                                        style={{
                                                            ...labelStyle,
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                display:
                                                                    "inline-flex",
                                                                alignItems:
                                                                    "center",
                                                                justifyContent:
                                                                    "center",
                                                                backgroundColor:
                                                                    "#5c2e12",
                                                                color: "#f0e8d0",
                                                                width: "18px",
                                                                height: "18px",
                                                                borderRadius:
                                                                    "50%",
                                                                fontSize:
                                                                    "0.65rem",
                                                                fontWeight: 700,
                                                                marginRight:
                                                                    "0.4rem",
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            2
                                                        </span>
                                                        2頭目 ─ 犬種
                                                    </label>
                                                    <input
                                                        name="petBreed2"
                                                        value={
                                                            editForm.petBreed2
                                                        }
                                                        onChange={
                                                            handleEditChange
                                                        }
                                                        placeholder="例：チワワ"
                                                        style={inputStyle}
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {/* 利用頻度の高い宿泊形態 */}
                                        <div style={{ gridColumn: "1 / -1" }}>
                                            <label style={labelStyle}>
                                                利用頻度の高い宿泊形態
                                            </label>
                                            <select
                                                name="hasFamily"
                                                value={editForm.hasFamily}
                                                onChange={handleEditChange}
                                                style={selectStyle}
                                            >
                                                <option value="individual">
                                                    個人
                                                </option>
                                                <option value="friends">
                                                    友人
                                                </option>
                                                <option value="couple">
                                                    カップル
                                                </option>
                                                <option value="married">
                                                    ご夫婦
                                                </option>
                                                <option value="family">
                                                    ご家族（お子さんあり）
                                                </option>
                                            </select>
                                        </div>

                                        {/* 宿泊の際に気になること */}
                                        <div style={{ gridColumn: "1 / -1" }}>
                                            <label style={labelStyle}>
                                                宿泊の際に気になること
                                            </label>
                                            <textarea
                                                name="concerns"
                                                value={editForm.concerns}
                                                onChange={handleEditChange}
                                                placeholder="ご不明な点やご要望などをお書きください"
                                                style={textareaStyle}
                                            />
                                        </div>

                                        {/* 何でこのログハウスを知りましたか？ */}
                                        <div style={{ gridColumn: "1 / -1" }}>
                                            <label style={labelStyle}>
                                                何でこのログハウスを知りましたか？
                                            </label>
                                            <input
                                                name="howFound"
                                                value={editForm.howFound}
                                                onChange={handleEditChange}
                                                placeholder="例：インターネット検索、友人の紹介"
                                                style={inputStyle}
                                            />
                                        </div>

                                        {/* エルボスケに期待すること */}
                                        <div style={{ gridColumn: "1 / -1" }}>
                                            <label style={labelStyle}>
                                                エルボスケに期待すること
                                            </label>
                                            <textarea
                                                name="expectations"
                                                value={editForm.expectations}
                                                onChange={handleEditChange}
                                                placeholder="滞在で楽しみにしていることなどをお書きください"
                                                style={textareaStyle}
                                            />
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "0.75rem",
                                            justifyContent: "flex-end",
                                            marginTop: "0.5rem",
                                        }}
                                    >
                                        <button
                                            onClick={() => setEditing(false)}
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "0.3rem",
                                                backgroundColor: "transparent",
                                                color: "#8a7868",
                                                border: "1px solid rgba(180,140,80,0.2)",
                                                borderRadius: "3px",
                                                padding: "0.6rem 1.25rem",
                                                fontSize: "0.85rem",
                                                fontFamily:
                                                    "'Noto Sans JP', sans-serif",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <FaTimes size={12} />
                                            キャンセル
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "0.3rem",
                                                backgroundColor: "#1e3c0e",
                                                color: "#f0e8d0",
                                                border: "none",
                                                borderRadius: "3px",
                                                padding: "0.6rem 1.25rem",
                                                fontSize: "0.85rem",
                                                fontWeight: 700,
                                                fontFamily:
                                                    "'Noto Sans JP', sans-serif",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <FaSave size={12} />
                                            保存する
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Display Mode */
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "0.6rem",
                                    }}
                                >
                                    {[
                                        {
                                            label: "お名前",
                                            value: `${user.lastName} ${user.firstName}`,
                                        },
                                        {
                                            label: "ふりがな",
                                            value: `${user.lastNameKana} ${user.firstNameKana}`,
                                        },
                                        {
                                            label: "メールアドレス",
                                            value: user.email,
                                        },
                                        {
                                            label: "電話番号",
                                            value: user.phone,
                                        },
                                        { label: "住所", value: user.address },
                                        {
                                            label: "生年月日",
                                            value: user.birthDate
                                                ? user.birthDate.replace(
                                                      /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
                                                      (_, y, m, d) =>
                                                          `${y}年${parseInt(m)}月${parseInt(d)}日`,
                                                  )
                                                : "−",
                                        },
                                        {
                                            label: "ペット同伴",
                                            value: formatPetDisplay(
                                                user.hasPet || "no",
                                                user.petBreed || "",
                                                user.petBreed2 || "",
                                            ),
                                        },
                                        {
                                            label: "利用頻度の高い宿泊形態",
                                            value: formatFamilyDisplay(
                                                user.hasFamily || "",
                                            ),
                                        },
                                        {
                                            label: "宿泊の際に気になること",
                                            value: user.concerns || "−",
                                        },
                                        {
                                            label: "知ったきっかけ",
                                            value: user.howFound || "−",
                                        },
                                        {
                                            label: "エルボスケに期待すること",
                                            value: user.expectations || "−",
                                        },
                                    ].map((item) => (
                                        <div
                                            key={item.label}
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                padding: "0.55rem 0",
                                                borderBottom:
                                                    "1px solid rgba(180,140,80,0.12)",
                                                flexWrap: "wrap",
                                                gap: "0.5rem",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: "0.82rem",
                                                    color: "#8a7868",
                                                    minWidth: "100px",
                                                }}
                                            >
                                                {item.label}
                                            </span>
                                            <span
                                                style={{
                                                    fontSize: "0.88rem",
                                                    fontWeight: 500,
                                                    color: "#2c1e10",
                                                    textAlign: "right",
                                                    flex: 1,
                                                }}
                                            >
                                                {item.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>,
                    )}

                    {/* ========== 2. Password Reset & 3. Withdrawal ========== */}
                    {sectionCard(
                        <>
                            {sectionTitle(
                                <FaKey size={16} color="#1e3c0e" />,
                                "アカウント管理",
                            )}
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "1rem",
                                }}
                            >
                                {/* Password Reset */}
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "1rem 1.25rem",
                                        backgroundColor: "#f2e8d0",
                                        borderRadius: "3px",
                                        border: "1px solid rgba(180,140,80,0.15)",
                                        flexWrap: "wrap",
                                        gap: "0.75rem",
                                    }}
                                >
                                    <div>
                                        <h3
                                            style={{
                                                fontSize: "0.9rem",
                                                fontWeight: 700,
                                                color: "#2c1e10",
                                                marginBottom: "0.2rem",
                                            }}
                                        >
                                            パスワード再設定
                                        </h3>
                                        <p
                                            style={{
                                                fontSize: "0.75rem",
                                                color: "#8a7868",
                                                margin: 0,
                                            }}
                                        >
                                            現在のパスワードを変更します
                                        </p>
                                    </div>
                                    <Link
                                        to="/password-reset"
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "0.35rem",
                                            backgroundColor: "#5c2e12",
                                            color: "#f0e8d0",
                                            padding: "0.55rem 1.1rem",
                                            borderRadius: "3px",
                                            textDecoration: "none",
                                            fontWeight: 700,
                                            fontSize: "0.82rem",
                                        }}
                                    >
                                        <FaKey size={12} />
                                        パスワード変更
                                        <FaChevronRight size={10} />
                                    </Link>
                                </div>

                                {/* Logout */}
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "1rem 1.25rem",
                                        backgroundColor: "#f2e8d0",
                                        borderRadius: "3px",
                                        border: "1px solid rgba(180,140,80,0.15)",
                                        flexWrap: "wrap",
                                        gap: "0.75rem",
                                    }}
                                >
                                    <div>
                                        <h3
                                            style={{
                                                fontSize: "0.9rem",
                                                fontWeight: 700,
                                                color: "#2c1e10",
                                                marginBottom: "0.2rem",
                                            }}
                                        >
                                            ログアウト
                                        </h3>
                                        <p
                                            style={{
                                                fontSize: "0.75rem",
                                                color: "#8a7868",
                                                margin: 0,
                                            }}
                                        >
                                            このデバイスからログアウトします
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "0.35rem",
                                            backgroundColor: "transparent",
                                            color: "#5a4838",
                                            padding: "0.55rem 1.1rem",
                                            borderRadius: "3px",
                                            border: "1px solid rgba(180,140,80,0.25)",
                                            fontWeight: 700,
                                            fontSize: "0.82rem",
                                            fontFamily:
                                                "'Noto Sans JP', sans-serif",
                                            cursor: "pointer",
                                        }}
                                    >
                                        <FaSignOutAlt size={12} />
                                        ログアウト
                                    </button>
                                </div>

                                {/* Account Deletion */}
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "1rem 1.25rem",
                                        backgroundColor: showDeleteConfirm
                                            ? "rgba(160,48,32,0.04)"
                                            : "#f2e8d0",
                                        borderRadius: "3px",
                                        border: showDeleteConfirm
                                            ? "1px solid rgba(160,48,32,0.15)"
                                            : "1px solid rgba(180,140,80,0.15)",
                                        flexWrap: "wrap",
                                        gap: "0.75rem",
                                        transition: "all 0.2s",
                                    }}
                                >
                                    <div>
                                        <h3
                                            style={{
                                                fontSize: "0.9rem",
                                                fontWeight: 700,
                                                color: showDeleteConfirm
                                                    ? "#a03020"
                                                    : "#2c1e10",
                                                marginBottom: "0.2rem",
                                            }}
                                        >
                                            会員退会
                                        </h3>
                                        <p
                                            style={{
                                                fontSize: "0.75rem",
                                                color: "#8a7868",
                                                margin: 0,
                                            }}
                                        >
                                            {showDeleteConfirm
                                                ? "退会すると全データが削除されます。この操作は取り消せません。"
                                                : "アカウントと予約情報をすべて削除します"}
                                        </p>
                                    </div>
                                    {showDeleteConfirm ? (
                                        <div
                                            style={{
                                                display: "flex",
                                                gap: "0.5rem",
                                            }}
                                        >
                                            <button
                                                onClick={() =>
                                                    setShowDeleteConfirm(false)
                                                }
                                                style={{
                                                    backgroundColor:
                                                        "transparent",
                                                    color: "#5a4838",
                                                    padding: "0.5rem 0.85rem",
                                                    borderRadius: "3px",
                                                    border: "1px solid rgba(180,140,80,0.25)",
                                                    fontSize: "0.78rem",
                                                    fontFamily:
                                                        "'Noto Sans JP', sans-serif",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                キャンセル
                                            </button>
                                            <button
                                                onClick={handleDeleteAccount}
                                                style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: "0.3rem",
                                                    backgroundColor: "#a03020",
                                                    color: "#fff",
                                                    padding: "0.5rem 0.85rem",
                                                    borderRadius: "3px",
                                                    border: "none",
                                                    fontWeight: 700,
                                                    fontSize: "0.78rem",
                                                    fontFamily:
                                                        "'Noto Sans JP', sans-serif",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                <FaExclamationTriangle
                                                    size={11}
                                                />
                                                退会する
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() =>
                                                setShowDeleteConfirm(true)
                                            }
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "0.35rem",
                                                backgroundColor: "transparent",
                                                color: "#a03020",
                                                padding: "0.55rem 1.1rem",
                                                borderRadius: "3px",
                                                border: "1px solid rgba(160,48,32,0.2)",
                                                fontWeight: 700,
                                                fontSize: "0.82rem",
                                                fontFamily:
                                                    "'Noto Sans JP', sans-serif",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <FaUserSlash size={12} />
                                            退会する
                                        </button>
                                    )}
                                </div>
                            </div>
                        </>,
                    )}

                    {/* ========== 4. Reservation History ========== */}
                    {sectionCard(
                        <>
                            {sectionTitle(
                                <FaCalendarAlt size={16} color="#1e3c0e" />,
                                "予約履歴",
                            )}
                            {reservations.length === 0 ? (
                                <p
                                    style={{
                                        fontSize: "0.88rem",
                                        color: "#8a7868",
                                        textAlign: "center",
                                        padding: "2rem 0",
                                    }}
                                >
                                    予約履歴はありません。
                                </p>
                            ) : (
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "1rem",
                                    }}
                                >
                                    {reservations.map((r) => {
                                        const isCanceled = canceledIds.has(
                                            r.id,
                                        );
                                        const effectiveStatus = isCanceled
                                            ? "cancelled"
                                            : r.status;
                                        const effectiveStatusLabel = isCanceled
                                            ? "キャンセル済"
                                            : r.statusLabel;
                                        const sc = isCanceled
                                            ? {
                                                  bg: "rgba(160,48,32,0.06)",
                                                  color: "#a03020",
                                                  border: "rgba(160,48,32,0.2)",
                                              }
                                            : statusColor(r.status);
                                        const cancelable =
                                            !isCanceled &&
                                            canCancel(r.checkin, r.status);
                                        const isConfirmingCancel =
                                            cancelingId === r.id;

                                        return (
                                            <div
                                                key={r.id}
                                                style={{
                                                    backgroundColor: "#f2e8d0",
                                                    borderRadius: "4px",
                                                    border: isCanceled
                                                        ? "1px solid rgba(160,48,32,0.18)"
                                                        : "1px solid rgba(180,140,80,0.15)",
                                                    overflow: "hidden",
                                                    opacity: isCanceled
                                                        ? 0.75
                                                        : 1,
                                                    transition: "opacity 0.2s",
                                                }}
                                            >
                                                {/* Reservation Header */}
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "space-between",
                                                        padding:
                                                            "0.75rem 1.25rem",
                                                        backgroundColor:
                                                            "rgba(30,60,14,0.04)",
                                                        borderBottom:
                                                            "1px solid rgba(180,140,80,0.12)",
                                                        flexWrap: "wrap",
                                                        gap: "0.5rem",
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            fontSize: "0.78rem",
                                                            fontWeight: 700,
                                                            color: "#5a4838",
                                                            letterSpacing:
                                                                "0.04em",
                                                        }}
                                                    >
                                                        {r.id}
                                                    </span>
                                                    <span
                                                        style={{
                                                            backgroundColor:
                                                                sc.bg,
                                                            color: sc.color,
                                                            border: `1px solid ${sc.border}`,
                                                            padding:
                                                                "0.2rem 0.6rem",
                                                            borderRadius: "3px",
                                                            fontSize: "0.72rem",
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        {effectiveStatusLabel}
                                                    </span>
                                                </div>

                                                {/* Reservation Body */}
                                                <div
                                                    style={{
                                                        padding: "1rem 1.25rem",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            display: "grid",
                                                            gridTemplateColumns:
                                                                "1fr 1fr",
                                                            gap: "0.75rem",
                                                            fontSize: "0.82rem",
                                                        }}
                                                        className="mypage-res-grid"
                                                    >
                                                        <div>
                                                            <span
                                                                style={{
                                                                    color: "#8a7868",
                                                                    fontSize:
                                                                        "0.7rem",
                                                                }}
                                                            >
                                                                チェックイン
                                                            </span>
                                                            <div
                                                                style={{
                                                                    fontWeight: 700,
                                                                    color: "#2c1e10",
                                                                    marginTop:
                                                                        "0.15rem",
                                                                }}
                                                            >
                                                                {formatDateJP(
                                                                    r.checkin,
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span
                                                                style={{
                                                                    color: "#8a7868",
                                                                    fontSize:
                                                                        "0.7rem",
                                                                }}
                                                            >
                                                                チェックアウト
                                                            </span>
                                                            <div
                                                                style={{
                                                                    fontWeight: 700,
                                                                    color: "#2c1e10",
                                                                    marginTop:
                                                                        "0.15rem",
                                                                }}
                                                            >
                                                                {formatDateJP(
                                                                    r.checkout,
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span
                                                                style={{
                                                                    color: "#8a7868",
                                                                    fontSize:
                                                                        "0.7rem",
                                                                }}
                                                            >
                                                                人数
                                                            </span>
                                                            <div
                                                                style={{
                                                                    fontWeight: 500,
                                                                    color: "#2c1e10",
                                                                    marginTop:
                                                                        "0.15rem",
                                                                }}
                                                            >
                                                                {r.guests}名
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span
                                                                style={{
                                                                    color: "#8a7868",
                                                                    fontSize:
                                                                        "0.7rem",
                                                                }}
                                                            >
                                                                ペット
                                                            </span>
                                                            <div
                                                                style={{
                                                                    fontWeight: 500,
                                                                    color: "#2c1e10",
                                                                    marginTop:
                                                                        "0.15rem",
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    gap: "0.3rem",
                                                                }}
                                                            >
                                                                {r.pets !==
                                                                    "なし" && (
                                                                    <FaPaw
                                                                        size={
                                                                            11
                                                                        }
                                                                        color="#7a4020"
                                                                    />
                                                                )}
                                                                {r.pets}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span
                                                                style={{
                                                                    color: "#8a7868",
                                                                    fontSize:
                                                                        "0.7rem",
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    gap: "0.25rem",
                                                                }}
                                                            >
                                                                <FaConciergeBell
                                                                    size={10}
                                                                />
                                                                滞在サポート
                                                            </span>
                                                            <div
                                                                style={{
                                                                    fontWeight: 500,
                                                                    color:
                                                                        r.supportPlan ===
                                                                        "yes"
                                                                            ? "#1e3c0e"
                                                                            : "#8a7868",
                                                                    marginTop:
                                                                        "0.15rem",
                                                                }}
                                                            >
                                                                {r.supportPlan ===
                                                                "yes"
                                                                    ? "あり"
                                                                    : "なし"}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {r.experiences.length >
                                                        0 && (
                                                        <div
                                                            style={{
                                                                marginTop:
                                                                    "0.75rem",
                                                                paddingTop:
                                                                    "0.6rem",
                                                                borderTop:
                                                                    "1px solid rgba(180,140,80,0.12)",
                                                            }}
                                                        >
                                                            <span
                                                                style={{
                                                                    color: "#8a7868",
                                                                    fontSize:
                                                                        "0.7rem",
                                                                }}
                                                            >
                                                                体験オプション
                                                            </span>
                                                            <div
                                                                style={{
                                                                    display:
                                                                        "flex",
                                                                    gap: "0.35rem",
                                                                    flexWrap:
                                                                        "wrap",
                                                                    marginTop:
                                                                        "0.3rem",
                                                                }}
                                                            >
                                                                {r.experiences.map(
                                                                    (exp) => (
                                                                        <span
                                                                            key={
                                                                                exp
                                                                            }
                                                                            style={{
                                                                                backgroundColor:
                                                                                    "rgba(30,60,14,0.06)",
                                                                                color: "#1e3c0e",
                                                                                border: "1px solid rgba(30,60,14,0.12)",
                                                                                padding:
                                                                                    "0.15rem 0.5rem",
                                                                                borderRadius:
                                                                                    "2px",
                                                                                fontSize:
                                                                                    "0.72rem",
                                                                                fontWeight: 500,
                                                                            }}
                                                                        >
                                                                            {
                                                                                exp
                                                                            }
                                                                        </span>
                                                                    ),
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Total amount */}
                                                    <div
                                                        style={{
                                                            marginTop:
                                                                "0.85rem",
                                                            padding:
                                                                "0.65rem 1rem",
                                                            backgroundColor:
                                                                "rgba(212,176,112,0.14)",
                                                            border: "1px solid rgba(212,176,112,0.35)",
                                                            borderRadius: "3px",
                                                            display: "flex",
                                                            alignItems:
                                                                "center",
                                                            justifyContent:
                                                                "space-between",
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                fontSize:
                                                                    "0.72rem",
                                                                color: "#8a7868",
                                                                fontWeight: 500,
                                                                display: "flex",
                                                                alignItems:
                                                                    "center",
                                                                gap: "0.3rem",
                                                            }}
                                                        >
                                                            <FaYenSign
                                                                size={10}
                                                                color="#c47a30"
                                                            />
                                                            お支払い合計（税込・保証料含む）
                                                        </span>
                                                        <span
                                                            style={{
                                                                fontFamily:
                                                                    "'Noto Serif JP', serif",
                                                                fontSize:
                                                                    "1.1rem",
                                                                fontWeight: 700,
                                                                color: "#5c2e12",
                                                            }}
                                                        >
                                                            ¥
                                                            {r.totalAmount.toLocaleString()}
                                                        </span>
                                                    </div>

                                                    {/* Cancel section */}
                                                    {cancelable && (
                                                        <div
                                                            style={{
                                                                marginTop:
                                                                    "0.75rem",
                                                                paddingTop:
                                                                    "0.75rem",
                                                                borderTop:
                                                                    "1px solid rgba(180,140,80,0.12)",
                                                            }}
                                                        >
                                                            {isConfirmingCancel ? (
                                                                <div
                                                                    style={{
                                                                        backgroundColor:
                                                                            "rgba(160,48,32,0.05)",
                                                                        border: "1px solid rgba(160,48,32,0.18)",
                                                                        borderRadius:
                                                                            "3px",
                                                                        padding:
                                                                            "0.85rem 1rem",
                                                                    }}
                                                                >
                                                                    <p
                                                                        style={{
                                                                            fontSize:
                                                                                "0.78rem",
                                                                            color: "#a03020",
                                                                            fontWeight: 700,
                                                                            marginBottom:
                                                                                "0.4rem",
                                                                        }}
                                                                    >
                                                                        この予約をキャンセルしてよろしいですか？
                                                                    </p>
                                                                    <p
                                                                        style={{
                                                                            fontSize:
                                                                                "0.72rem",
                                                                            color: "#8a7868",
                                                                            marginBottom:
                                                                                "0.75rem",
                                                                            lineHeight: 1.6,
                                                                        }}
                                                                    >
                                                                        チェックイン7日前以降のキャンセルは料金が発生します。キャンセル後は取り消せません。
                                                                    </p>
                                                                    <div
                                                                        style={{
                                                                            display:
                                                                                "flex",
                                                                            gap: "0.5rem",
                                                                            justifyContent:
                                                                                "flex-end",
                                                                        }}
                                                                    >
                                                                        <button
                                                                            onClick={() =>
                                                                                setCancelingId(
                                                                                    null,
                                                                                )
                                                                            }
                                                                            style={{
                                                                                backgroundColor:
                                                                                    "transparent",
                                                                                color: "#5a4838",
                                                                                padding:
                                                                                    "0.4rem 0.85rem",
                                                                                borderRadius:
                                                                                    "3px",
                                                                                border: "1px solid rgba(180,140,80,0.25)",
                                                                                fontSize:
                                                                                    "0.78rem",
                                                                                fontFamily:
                                                                                    "'Noto Sans JP', sans-serif",
                                                                                cursor: "pointer",
                                                                            }}
                                                                        >
                                                                            戻る
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                setCanceledIds(
                                                                                    (
                                                                                        prev,
                                                                                    ) =>
                                                                                        new Set(
                                                                                            [
                                                                                                ...prev,
                                                                                                r.id,
                                                                                            ],
                                                                                        ),
                                                                                );
                                                                                setCancelingId(
                                                                                    null,
                                                                                );
                                                                            }}
                                                                            style={{
                                                                                display:
                                                                                    "inline-flex",
                                                                                alignItems:
                                                                                    "center",
                                                                                gap: "0.3rem",
                                                                                backgroundColor:
                                                                                    "#a03020",
                                                                                color: "#fff",
                                                                                padding:
                                                                                    "0.4rem 0.85rem",
                                                                                borderRadius:
                                                                                    "3px",
                                                                                border: "none",
                                                                                fontWeight: 700,
                                                                                fontSize:
                                                                                    "0.78rem",
                                                                                fontFamily:
                                                                                    "'Noto Sans JP', sans-serif",
                                                                                cursor: "pointer",
                                                                            }}
                                                                        >
                                                                            <FaExclamationTriangle
                                                                                size={
                                                                                    11
                                                                                }
                                                                            />
                                                                            キャンセルする
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() =>
                                                                        setCancelingId(
                                                                            r.id,
                                                                        )
                                                                    }
                                                                    style={{
                                                                        display:
                                                                            "inline-flex",
                                                                        alignItems:
                                                                            "center",
                                                                        gap: "0.35rem",
                                                                        backgroundColor:
                                                                            "transparent",
                                                                        color: "#a03020",
                                                                        padding:
                                                                            "0.4rem 0.85rem",
                                                                        borderRadius:
                                                                            "3px",
                                                                        border: "1px solid rgba(160,48,32,0.22)",
                                                                        fontWeight: 700,
                                                                        fontSize:
                                                                            "0.78rem",
                                                                        fontFamily:
                                                                            "'Noto Sans JP', sans-serif",
                                                                        cursor: "pointer",
                                                                    }}
                                                                >
                                                                    <FaBan
                                                                        size={
                                                                            11
                                                                        }
                                                                    />
                                                                    予約をキャンセルする
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}

                                                    {isCanceled && (
                                                        <div
                                                            style={{
                                                                marginTop:
                                                                    "0.75rem",
                                                                paddingTop:
                                                                    "0.6rem",
                                                                borderTop:
                                                                    "1px solid rgba(180,140,80,0.12)",
                                                            }}
                                                        >
                                                            <span
                                                                style={{
                                                                    fontSize:
                                                                        "0.75rem",
                                                                    color: "#a03020",
                                                                    fontWeight: 500,
                                                                }}
                                                            >
                                                                この予約はキャンセル済みです。
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* New reservation CTA */}
                            <div
                                style={{
                                    marginTop: "1.5rem",
                                    textAlign: "center",
                                }}
                            >
                                <Link
                                    to="/reservation"
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "0.4rem",
                                        backgroundColor: "#5c2e12",
                                        color: "#f0e8d0",
                                        padding: "0.75rem 1.5rem",
                                        borderRadius: "3px",
                                        textDecoration: "none",
                                        fontWeight: 700,
                                        fontSize: "0.88rem",
                                    }}
                                >
                                    新しい予約をする
                                    <FaChevronRight size={12} />
                                </Link>
                            </div>
                        </>,
                    )}
                </div>
            </section>

            <style>{`
        @media (max-width: 640px) {
          .mypage-edit-grid {
            grid-template-columns: 1fr !important;
          }
          .mypage-res-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
        </div>
    );
}
