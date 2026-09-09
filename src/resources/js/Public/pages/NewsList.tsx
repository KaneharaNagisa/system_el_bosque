import { useState } from "react";
import { usePage } from "@inertiajs/react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

interface NewsItem {
    id: string;
    title: string;
    content: string;
    publishDate: string;
    isNew?: boolean;
}

export function NewsList() {
    const { news = [] } = usePage().props as unknown as {
        news?: Array<{
            id: number;
            title: string;
            content: string;
            publish_date: string;
        }>;
    };
    const items: NewsItem[] = news.map((item) => ({
        id: String(item.id),
        title: item.title,
        content: item.content,
        publishDate: item.publish_date,
        isNew:
            Date.now() - new Date(item.publish_date).getTime() <= 7 * 86400000,
    }));
    const [expandedId, setExpandedId] = useState<string | null>(null);

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
                    News
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
                    お知らせ一覧
                </h1>
            </div>

            <section
                style={{ backgroundColor: "#f2e8d0", padding: "5rem 1.5rem" }}
            >
                <div style={{ maxWidth: "820px", margin: "0 auto" }}>
                    <div
                        style={{
                            backgroundColor: "#faf5e8",
                            borderRadius: "4px",
                            border: "1px solid rgba(180,140,80,0.18)",
                            overflow: "hidden",
                        }}
                    >
                        {items.length === 0 && (
                            <div
                                style={{
                                    padding: "2.5rem 1.5rem",
                                    textAlign: "center",
                                    color: "#8a7868",
                                    fontSize: "0.9rem",
                                }}
                            >
                                お知らせはありません
                            </div>
                        )}
                        {items.map((item, idx) => {
                            const isExpanded = expandedId === item.id;
                            const isLast = idx === items.length - 1;
                            const [y, m, d] = item.publishDate
                                .slice(0, 10)
                                .split("-")
                                .map(Number);
                            const dateStr = `${y}年${m}月${d}日`;

                            return (
                                <div
                                    key={item.id}
                                    style={{
                                        borderBottom: isLast
                                            ? "none"
                                            : "1px solid rgba(180,140,80,0.12)",
                                    }}
                                >
                                    <button
                                        onClick={() =>
                                            setExpandedId(
                                                isExpanded ? null : item.id,
                                            )
                                        }
                                        style={{
                                            width: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "1rem",
                                            padding: "1.1rem 1.5rem",
                                            backgroundColor: "transparent",
                                            border: "none",
                                            cursor: "pointer",
                                            textAlign: "left",
                                            fontFamily:
                                                "'Noto Sans JP', sans-serif",
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: "3px",
                                                alignSelf: "stretch",
                                                borderRadius: "2px",
                                                backgroundColor: isExpanded
                                                    ? "#5c2e12"
                                                    : "rgba(180,140,80,0.3)",
                                                flexShrink: 0,
                                            }}
                                        />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "0.5rem",
                                                    marginBottom: "0.3rem",
                                                    flexWrap: "wrap",
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontSize: "0.72rem",
                                                        color: "#8a7868",
                                                        fontWeight: 500,
                                                        letterSpacing: "0.02em",
                                                    }}
                                                >
                                                    {dateStr}
                                                </span>
                                                {item.isNew && (
                                                    <span
                                                        style={{
                                                            backgroundColor:
                                                                "#a03020",
                                                            color: "#fff",
                                                            fontSize: "0.6rem",
                                                            fontWeight: 700,
                                                            padding:
                                                                "0.1rem 0.45rem",
                                                            borderRadius: "2px",
                                                            letterSpacing:
                                                                "0.08em",
                                                        }}
                                                    >
                                                        NEW
                                                    </span>
                                                )}
                                            </div>
                                            <span
                                                style={{
                                                    fontSize: "0.92rem",
                                                    fontWeight: isExpanded
                                                        ? 700
                                                        : 500,
                                                    color: isExpanded
                                                        ? "#5c2e12"
                                                        : "#2c1e10",
                                                    lineHeight: 1.55,
                                                    display: "block",
                                                }}
                                            >
                                                {item.title}
                                            </span>
                                        </div>
                                        <span
                                            style={{
                                                color: "#8a7868",
                                                flexShrink: 0,
                                            }}
                                        >
                                            {isExpanded ? (
                                                <FaChevronUp size={12} />
                                            ) : (
                                                <FaChevronDown size={12} />
                                            )}
                                        </span>
                                    </button>

                                    {isExpanded && (
                                        <div
                                            style={{
                                                padding:
                                                    "0 1.5rem 1.25rem 3.5rem",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    backgroundColor:
                                                        "rgba(92,46,18,0.04)",
                                                    border: "1px solid rgba(92,46,18,0.1)",
                                                    borderLeft:
                                                        "3px solid #d4b070",
                                                    borderRadius: "2px",
                                                    padding: "1rem 1.25rem",
                                                }}
                                            >
                                                <p
                                                    style={{
                                                        fontSize: "0.87rem",
                                                        color: "#3a2c1e",
                                                        lineHeight: 1.9,
                                                        margin: 0,
                                                        whiteSpace: "pre-wrap",
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
                </div>
            </section>
        </div>
    );
}
