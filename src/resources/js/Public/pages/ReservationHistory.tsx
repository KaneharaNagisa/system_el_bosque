import { router, usePage } from "@inertiajs/react";
import { useState } from "react";
import {
    FaBan,
    FaCalendarAlt,
    FaChevronRight,
    FaExclamationTriangle,
    FaPaw,
    FaYenSign,
} from "react-icons/fa";
import { Link } from "../router";

type Reservation = {
    dbId: number;
    id: string;
    checkin: string;
    checkout: string;
    guests: number;
    status: string;
    statusLabel: string;
    pets: string;
    experiences: string[];
    supportPlan: string;
    totalAmount: number;
};

const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

function formatDate(dateString: string): string {
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return `${year}/${month}/${day}（${weekdays[date.getDay()]}）`;
}

function canCancel(checkin: string, status: string): boolean {
    if (status === "completed" || status === "cancelled") return false;
    const checkinDate = new Date(checkin);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return (
        Math.floor((checkinDate.getTime() - today.getTime()) / 86400000) >= 7
    );
}

function statusStyle(status: string) {
    if (status === "confirmed")
        return {
            bg: "rgba(30,60,14,0.08)",
            color: "#1e3c0e",
            border: "rgba(30,60,14,0.2)",
        };
    if (status === "pending")
        return {
            bg: "rgba(196,122,48,0.08)",
            color: "#7a4020",
            border: "rgba(196,122,48,0.2)",
        };
    if (status === "completed")
        return {
            bg: "rgba(138,120,104,0.08)",
            color: "#8a7868",
            border: "rgba(138,120,104,0.2)",
        };
    return { bg: "#f2e8d0", color: "#5a4838", border: "rgba(180,140,80,0.15)" };
}

export function ReservationHistory() {
    const { reservations = [] } = usePage<{ reservations?: Reservation[] }>()
        .props;
    const [cancelingId, setCancelingId] = useState<string | null>(null);
    const [canceledIds, setCanceledIds] = useState<Set<string>>(new Set());

    return (
        <div
            style={{
                backgroundColor: "#f2e8d0",
                minHeight: "100vh",
                padding: "5rem 1.5rem",
            }}
        >
            <div style={{ maxWidth: "900px", margin: "0 auto" }}>
                <div
                    style={{
                        backgroundColor: "#faf5e8",
                        borderRadius: "4px",
                        padding: "2rem",
                        border: "1px solid rgba(180,140,80,0.15)",
                    }}
                >
                    <h1
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.65rem",
                            fontFamily: "'Noto Serif JP', serif",
                            fontSize: "1.35rem",
                            color: "#1e3c0e",
                            margin: "0 0 1.5rem",
                            paddingBottom: "1rem",
                            borderBottom: "1px solid rgba(180,140,80,0.25)",
                        }}
                    >
                        <FaCalendarAlt size={16} /> 予約履歴
                    </h1>
                    {reservations.length === 0 ? (
                        <p
                            style={{
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
                            {reservations.map((reservation) => {
                                const canceled = canceledIds.has(
                                    reservation.id,
                                );
                                const style = canceled
                                    ? {
                                          bg: "rgba(160,48,32,0.06)",
                                          color: "#a03020",
                                          border: "rgba(160,48,32,0.2)",
                                      }
                                    : statusStyle(reservation.status);
                                const cancelable =
                                    !canceled &&
                                    canCancel(
                                        reservation.checkin,
                                        reservation.status,
                                    );
                                return (
                                    <div
                                        key={reservation.id}
                                        style={{
                                            backgroundColor: "#f2e8d0",
                                            border: `1px solid ${canceled ? "rgba(160,48,32,0.18)" : "rgba(180,140,80,0.15)"}`,
                                            borderRadius: "4px",
                                            overflow: "hidden",
                                            opacity: canceled ? 0.75 : 1,
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                gap: "0.5rem",
                                                flexWrap: "wrap",
                                                padding: "0.75rem 1.25rem",
                                                backgroundColor:
                                                    "rgba(30,60,14,0.04)",
                                                borderBottom:
                                                    "1px solid rgba(180,140,80,0.12)",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontSize: "0.78rem",
                                                    fontWeight: 700,
                                                    color: "#5a4838",
                                                }}
                                            >
                                                {reservation.id}
                                            </span>
                                            <span
                                                style={{
                                                    backgroundColor: style.bg,
                                                    color: style.color,
                                                    border: `1px solid ${style.border}`,
                                                    padding: "0.2rem 0.6rem",
                                                    borderRadius: "3px",
                                                    fontSize: "0.72rem",
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {canceled
                                                    ? "キャンセル済"
                                                    : reservation.statusLabel}
                                            </span>
                                        </div>
                                        <div
                                            style={{ padding: "1rem 1.25rem" }}
                                        >
                                            <div
                                                className="mypage-res-grid"
                                                style={{
                                                    display: "grid",
                                                    gridTemplateColumns:
                                                        "1fr 1fr",
                                                    gap: "0.75rem",
                                                    fontSize: "0.82rem",
                                                }}
                                            >
                                                <Info
                                                    label="チェックイン"
                                                    value={formatDate(
                                                        reservation.checkin,
                                                    )}
                                                />
                                                <Info
                                                    label="チェックアウト"
                                                    value={formatDate(
                                                        reservation.checkout,
                                                    )}
                                                />
                                                <Info
                                                    label="人数"
                                                    value={`${reservation.guests}名`}
                                                />
                                                <Info
                                                    label="ペット"
                                                    value={
                                                        <>
                                                            {reservation.pets !==
                                                                "なし" && (
                                                                <FaPaw
                                                                    size={11}
                                                                    color="#7a4020"
                                                                />
                                                            )}
                                                            {reservation.pets}
                                                        </>
                                                    }
                                                />
                                                <Info
                                                    label="滞在サポート"
                                                    value={
                                                        reservation.supportPlan ===
                                                        "yes"
                                                            ? "あり"
                                                            : "なし"
                                                    }
                                                />
                                            </div>
                                            {reservation.experiences.length >
                                                0 && (
                                                <div
                                                    style={{
                                                        marginTop: "0.75rem",
                                                        paddingTop: "0.6rem",
                                                        borderTop:
                                                            "1px solid rgba(180,140,80,0.12)",
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            color: "#8a7868",
                                                            fontSize: "0.7rem",
                                                        }}
                                                    >
                                                        体験オプション
                                                    </span>
                                                    <div
                                                        style={{
                                                            display: "flex",
                                                            gap: "0.35rem",
                                                            flexWrap: "wrap",
                                                            marginTop: "0.3rem",
                                                        }}
                                                    >
                                                        {reservation.experiences.map(
                                                            (experience) => (
                                                                <span
                                                                    key={
                                                                        experience
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
                                                                    }}
                                                                >
                                                                    {experience}
                                                                </span>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            <div
                                                style={{
                                                    marginTop: "0.85rem",
                                                    padding: "0.65rem 1rem",
                                                    backgroundColor:
                                                        "rgba(212,176,112,0.14)",
                                                    border: "1px solid rgba(212,176,112,0.35)",
                                                    borderRadius: "3px",
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems: "center",
                                                    gap: "1rem",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontSize: "0.72rem",
                                                        color: "#8a7868",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "0.3rem",
                                                    }}
                                                >
                                                    <FaYenSign
                                                        size={10}
                                                        color="#c47a30"
                                                    />
                                                    お支払い合計（税込・保証料含む）
                                                </span>
                                                <strong
                                                    style={{
                                                        fontFamily:
                                                            "'Noto Serif JP', serif",
                                                        fontSize: "1.1rem",
                                                        color: "#5c2e12",
                                                    }}
                                                >
                                                    ¥
                                                    {reservation.totalAmount.toLocaleString()}
                                                </strong>
                                            </div>
                                            {cancelable &&
                                                (cancelingId ===
                                                reservation.id ? (
                                                    <div
                                                        style={{
                                                            marginTop:
                                                                "0.75rem",
                                                            padding:
                                                                "0.85rem 1rem",
                                                            backgroundColor:
                                                                "rgba(160,48,32,0.05)",
                                                            border: "1px solid rgba(160,48,32,0.18)",
                                                            borderRadius: "3px",
                                                        }}
                                                    >
                                                        <p
                                                            style={{
                                                                fontSize:
                                                                    "0.78rem",
                                                                color: "#a03020",
                                                                fontWeight: 700,
                                                            }}
                                                        >
                                                            この予約をキャンセルしてよろしいですか？
                                                        </p>
                                                        <p
                                                            style={{
                                                                fontSize:
                                                                    "0.72rem",
                                                                color: "#8a7868",
                                                                lineHeight: 1.6,
                                                            }}
                                                        >
                                                            チェックイン7日前以降のキャンセルは料金が発生します。キャンセル後は取り消せません。
                                                        </p>
                                                        <div
                                                            style={{
                                                                display: "flex",
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
                                                                style={
                                                                    secondaryButton
                                                                }
                                                            >
                                                                戻る
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    router.delete(
                                                                        `/reservations/${reservation.dbId}/cancel`,
                                                                        {
                                                                            preserveScroll: true,
                                                                            onSuccess:
                                                                                () => {
                                                                                    setCanceledIds(
                                                                                        (
                                                                                            current,
                                                                                        ) =>
                                                                                            new Set(
                                                                                                [
                                                                                                    ...current,
                                                                                                    reservation.id,
                                                                                                ],
                                                                                            ),
                                                                                    );
                                                                                    setCancelingId(
                                                                                        null,
                                                                                    );
                                                                                },
                                                                        },
                                                                    )
                                                                }
                                                                style={
                                                                    dangerButton
                                                                }
                                                            >
                                                                <FaExclamationTriangle
                                                                    size={11}
                                                                />
                                                                キャンセルする
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() =>
                                                            setCancelingId(
                                                                reservation.id,
                                                            )
                                                        }
                                                        style={secondaryButton}
                                                    >
                                                        <FaBan size={11} />
                                                        予約をキャンセルする
                                                    </button>
                                                ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
                        <Link to="/mypage" style={secondaryLink}>
                            <FaChevronRight size={11} />
                            マイページへ戻る
                        </Link>
                        <Link to="/reservation" style={primaryLink}>
                            新しい予約をする
                            <FaChevronRight size={11} />
                        </Link>
                    </div>
                </div>
            </div>
            <style>{`@media (max-width: 640px) { .mypage-res-grid { grid-template-columns: 1fr !important; } }`}</style>
        </div>
    );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div>
            <span style={{ color: "#8a7868", fontSize: "0.7rem" }}>
                {label}
            </span>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    fontWeight: 500,
                    color: "#2c1e10",
                    marginTop: "0.15rem",
                }}
            >
                {value}
            </div>
        </div>
    );
}

const secondaryButton: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
    backgroundColor: "transparent",
    color: "#a03020",
    padding: "0.4rem 0.85rem",
    borderRadius: "3px",
    border: "1px solid rgba(160,48,32,0.22)",
    fontWeight: 700,
    fontSize: "0.78rem",
    cursor: "pointer",
};
const dangerButton: React.CSSProperties = {
    ...secondaryButton,
    backgroundColor: "#a03020",
    color: "#fff",
    border: "none",
};
const secondaryLink: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    color: "#1e3c0e",
    padding: "0.65rem 1.25rem",
    marginRight: "0.5rem",
    border: "1px solid rgba(30,60,14,0.25)",
    borderRadius: "3px",
    textDecoration: "none",
    fontWeight: 700,
    fontSize: "0.82rem",
};
const primaryLink: React.CSSProperties = {
    ...secondaryLink,
    backgroundColor: "#5c2e12",
    color: "#f0e8d0",
    border: "none",
};
