import { Link } from "../router";
import {
    FaMapMarkerAlt,
    FaTrain,
    FaCar,
    FaThermometerHalf,
    FaClock,
    FaExternalLinkAlt,
    FaCalendarAlt,
    FaGift,
    FaYenSign,
} from "react-icons/fa";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { usePage } from "@inertiajs/react";
import { responsiveImage, type PublicImages } from "../image";

import lakeImg from "../assets/22a4426011bdad96a789860b3ad337bbb50cb96f.png";

const AUTUMN_IMG =
    "https://images.unsplash.com/photo-1610238115729-2d54b7aa8498?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080";

const onsenFacilities = [
    {
        name: "南信州阿南温泉 かじかの湯",
        type: "ナトリウム・炭酸水素塩泉",
        description:
            "長野最大級の露天風呂、五種浴の露天風呂、スパ、レストラン（十利そば）、物産体験施設、民芸紹介所、キャンプ場も併設した総合型温泉施設。",
        hours: "10:00〜21:00（最終入場20:00）",
        price: "大人¥600、子供¥300",
        closed: "定休日：火曜",
        url: "#",
    },
    {
        name: "天龍温泉 おきよめの湯",
        type: "pHが高くつるつるの美肌の湯",
        description:
            "ぬるりとした内風呂と露天風呂、コテージも併設。2024年秋に「御魂経」にて日帰りにリニューアルオープン。",
        hours: "16:00〜21:00（最終入場20:00）",
        price: "大人¥600、子供¥300",
        closed: "定休日：火曜",
        url: "#",
    },
    {
        name: "売木温泉 こまどりの湯",
        type: "ナトリウム・炭酸水素塩泉",
        description:
            "内風呂・泡風呂・打たせ湯・露天風呂・ロビー・和室宴会、飲食が楽しめるのんびりくつろげます。",
        hours: "10:00〜20:00（最終入場19:30）",
        price: "大人¥600、子供¥300",
        closed: null,
        url: "#",
    },
];

const spots = [
    {
        emoji: "🏔️",
        name: "巣山湖",
        category: "自然・景観",
        distance: "徒歩圏内",
        desc: "エルボスケのすぐそばにある静かな湖。早朝の霧がかかる幻想的な景色や、湖面に映る緑が美しい。カヌーや釣りも楽しめます。",
    },
    {
        emoji: "⛰️",
        name: "南アルプス遠望",
        category: "自然・景観",
        distance: "周辺",
        desc: "新野は標高の高い高原地帯。晴れた日には南アルプスの山々を望め、雄大な自然のパノラマが広がります。",
    },
    {
        emoji: "🎑",
        name: "新野の雪まつり",
        category: "文化・観光",
        distance: "新野地区",
        desc: "毎年1月に行われる伝統的な民俗行事（営業外）。三信遠地区の冬の風物詩で、見ごたえのある雪の祭りです。",
    },
    {
        emoji: "🛣️",
        name: "新野の道の駅",
        category: "道の駅",
        distance: "車で約5分",
        desc: "道の駅 信州新野千石平。地元の新鮮野菜や特産品が並ぶ直売所があり、食堂では新野の郷土料理が楽しめます。ドライブの休憩にも最適です。",
    },
];

export function Area() {
    const { images = {} } = usePage().props as unknown as {
        images?: PublicImages;
    };
    const lakeImage = responsiveImage(images, "about.lake", lakeImg);
    const autumnImage = responsiveImage(images, "area.autumn", AUTUMN_IMG);

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
                    Area Guide
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
                    周辺情報
                </h1>
                <p
                    style={{
                        color: "rgba(240,232,208,0.7)",
                        marginTop: "1rem",
                        fontSize: "0.92rem",
                    }}
                >
                    長野県南信州、阿南町新野の自然と暮らし
                </p>
            </div>

            {/* Nearby Onsen Facilities */}
            <section
                style={{ backgroundColor: "#faf5e8", padding: "5rem 1.5rem" }}
            >
                <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
                    <div
                        style={{ textAlign: "center", marginBottom: "2.5rem" }}
                    >
                        <h2
                            style={{
                                fontFamily: "'Noto Serif JP', serif",
                                fontSize: "clamp(1.5rem, 3vw, 2rem)",
                                fontWeight: 700,
                                color: "#1e3c0e",
                                marginBottom: "0.5rem",
                                paddingBottom: "0.75rem",
                                borderBottom: "2px solid #5c2e12",
                                display: "inline-block",
                            }}
                        >
                            近隣温泉施設
                        </h2>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.5rem",
                                marginTop: "1rem",
                                color: "#c47a30",
                                fontSize: "0.88rem",
                                fontWeight: 600,
                            }}
                        >
                            <FaGift size={14} />
                            <span>宿泊者全員に入浴券プレゼント</span>
                        </div>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(300px, 1fr))",
                            gap: "1.5rem",
                        }}
                    >
                        {onsenFacilities.map((onsen) => (
                            <div
                                key={onsen.name}
                                style={{
                                    backgroundColor: "#fff",
                                    borderRadius: "6px",
                                    padding: "2rem 1.75rem",
                                    border: "1px solid rgba(180,140,80,0.2)",
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                <h3
                                    style={{
                                        fontFamily: "'Noto Serif JP', serif",
                                        fontSize: "1.05rem",
                                        fontWeight: 700,
                                        color: "#1e3c0e",
                                        marginBottom: "0.35rem",
                                    }}
                                >
                                    {onsen.name}
                                </h3>
                                <p
                                    style={{
                                        fontSize: "0.78rem",
                                        color: "#c47a30",
                                        fontWeight: 600,
                                        marginBottom: "1rem",
                                    }}
                                >
                                    {onsen.type}
                                </p>
                                <p
                                    style={{
                                        fontSize: "0.84rem",
                                        color: "#5a4838",
                                        lineHeight: 1.85,
                                        marginBottom: "1.5rem",
                                        flexGrow: 1,
                                    }}
                                >
                                    {onsen.description}
                                </p>

                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "0.6rem",
                                        marginBottom: "1.25rem",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.6rem",
                                        }}
                                    >
                                        <FaClock size={13} color="#7a4020" />
                                        <span
                                            style={{
                                                fontSize: "0.82rem",
                                                color: "#4a3828",
                                            }}
                                        >
                                            {onsen.hours}
                                        </span>
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.6rem",
                                        }}
                                    >
                                        <FaYenSign size={13} color="#7a4020" />
                                        <span
                                            style={{
                                                fontSize: "0.82rem",
                                                color: "#4a3828",
                                            }}
                                        >
                                            {onsen.price}
                                        </span>
                                    </div>
                                    {onsen.closed && (
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "0.6rem",
                                            }}
                                        >
                                            <FaCalendarAlt
                                                size={13}
                                                color="#7a4020"
                                            />
                                            <span
                                                style={{
                                                    fontSize: "0.82rem",
                                                    color: "#4a3828",
                                                }}
                                            >
                                                {onsen.closed}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <a
                                    href={onsen.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "0.4rem",
                                        color: "#7a4020",
                                        fontSize: "0.85rem",
                                        fontWeight: 700,
                                        textDecoration: "none",
                                        borderBottom: "1px solid #c47a30",
                                        alignSelf: "flex-start",
                                        paddingBottom: "2px",
                                    }}
                                >
                                    公式サイト
                                    <FaExternalLinkAlt size={11} />
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Climate */}
            <section
                style={{ backgroundColor: "#f2e8d0", padding: "5rem 1.5rem" }}
            >
                <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                        <p
                            style={{
                                color: "#7a4020",
                                fontSize: "0.72rem",
                                letterSpacing: "0.25em",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                marginBottom: "0.75rem",
                            }}
                        >
                            Climate
                        </p>
                        <h2
                            style={{
                                fontFamily: "'Noto Serif JP', serif",
                                fontSize: "clamp(1.5rem, 3vw, 2rem)",
                                fontWeight: 700,
                                color: "#1e3c0e",
                            }}
                        >
                            新野の気候・環境
                        </h2>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(280px, 1fr))",
                            gap: "2rem",
                            alignItems: "center",
                        }}
                    >
                        <div>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.75rem",
                                    marginBottom: "1.5rem",
                                }}
                            >
                                <FaThermometerHalf size={22} color="#1e3c0e" />
                                <h3
                                    style={{
                                        fontFamily: "'Noto Serif JP', serif",
                                        fontSize: "1.1rem",
                                        fontWeight: 700,
                                        color: "#1e3c0e",
                                    }}
                                >
                                    標高800m超の高原気候
                                </h3>
                            </div>
                            <p
                                style={{
                                    color: "#5a4838",
                                    lineHeight: 2,
                                    fontSize: "0.9rem",
                                    marginBottom: "1.25rem",
                                }}
                            >
                                新野は標高800m以上の高原地帯。夏でも涼しく、都市部に比べて5〜10℃ほど気温が低いため、避暑地として最適です。
                            </p>
                            <p
                                style={{
                                    color: "#5a4838",
                                    lineHeight: 2,
                                    fontSize: "0.9rem",
                                    marginBottom: "1.5rem",
                                }}
                            >
                                冬は積雪もありますが、3月〜12月の営業期間中は比較的過ごしやすく、四季折々の美しい自然を楽しめます。
                            </p>
                            <div
                                style={{
                                    backgroundColor: "#faf5e8",
                                    borderRadius: "4px",
                                    padding: "1.25rem",
                                    border: "1px solid rgba(180,140,80,0.18)",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "0.75rem",
                                    }}
                                >
                                    {[
                                        {
                                            season: "春（3〜5月）",
                                            temp: "5〜18℃",
                                            note: "新緑、田植え体験",
                                        },
                                        {
                                            season: "夏（6〜8月）",
                                            temp: "18〜28℃",
                                            note: "涼しい高原、夏野菜収穫",
                                        },
                                        {
                                            season: "秋（9〜11月）",
                                            temp: "8〜22℃",
                                            note: "紅葉、稲刈り体験",
                                        },
                                        {
                                            season: "初冬（12月）",
                                            temp: "0〜12℃",
                                            note: "雪景色、薪ストーブ",
                                        },
                                    ].map((item) => (
                                        <div
                                            key={item.season}
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                            }}
                                        >
                                            <div>
                                                <div
                                                    style={{
                                                        fontSize: "0.85rem",
                                                        color: "#2c1e10",
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    {item.season}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: "0.75rem",
                                                        color: "#8a7868",
                                                    }}
                                                >
                                                    {item.note}
                                                </div>
                                            </div>
                                            <span
                                                style={{
                                                    fontSize: "0.9rem",
                                                    color: "#1e3c0e",
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {item.temp}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.75rem",
                            }}
                        >
                            <ImageWithFallback
                                {...lakeImage}
                                alt="巣山湖"
                                style={{
                                    width: "100%",
                                    height: "220px",
                                    objectFit: "cover",
                                    borderRadius: "4px",
                                }}
                            />
                            <ImageWithFallback
                                {...autumnImage}
                                alt="秋の紅葉"
                                style={{
                                    width: "100%",
                                    height: "180px",
                                    objectFit: "cover",
                                    borderRadius: "4px",
                                }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Nearby Spots */}
            <section
                style={{ backgroundColor: "#1b2f0e", padding: "5rem 1.5rem" }}
            >
                <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: "3rem" }}>
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
                            Nearby Spots
                        </p>
                        <h2
                            style={{
                                fontFamily: "'Noto Serif JP', serif",
                                fontSize: "clamp(1.5rem, 3vw, 2rem)",
                                fontWeight: 700,
                                color: "#f0e8d0",
                            }}
                        >
                            周辺観光スポット
                        </h2>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fill, minmax(280px, 1fr))",
                            gap: "1rem",
                        }}
                    >
                        {spots.map((spot) => (
                            <div
                                key={spot.name}
                                style={{
                                    backgroundColor: "rgba(242,232,208,0.05)",
                                    border: "1px solid rgba(212,176,112,0.15)",
                                    borderRadius: "4px",
                                    padding: "1.5rem",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: "0.75rem",
                                        marginBottom: "0.75rem",
                                    }}
                                >
                                    <span style={{ fontSize: "1.4rem" }}>
                                        {spot.emoji}
                                    </span>
                                    <div>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "0.5rem",
                                                flexWrap: "wrap",
                                            }}
                                        >
                                            <h3
                                                style={{
                                                    fontSize: "0.95rem",
                                                    fontWeight: 700,
                                                    color: "#f0e8d0",
                                                    margin: 0,
                                                }}
                                            >
                                                {spot.name}
                                            </h3>
                                            <span
                                                style={{
                                                    fontSize: "0.65rem",
                                                    backgroundColor:
                                                        "rgba(212,176,112,0.15)",
                                                    color: "#d4b070",
                                                    padding: "0.12rem 0.5rem",
                                                    borderRadius: "2px",
                                                    border: "1px solid rgba(212,176,112,0.25)",
                                                }}
                                            >
                                                {spot.category}
                                            </span>
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "0.72rem",
                                                color: "#d4b070",
                                                fontWeight: 600,
                                                marginTop: "0.2rem",
                                            }}
                                        >
                                            {spot.distance}
                                        </div>
                                    </div>
                                </div>
                                <p
                                    style={{
                                        fontSize: "0.825rem",
                                        color: "rgba(240,232,208,0.68)",
                                        lineHeight: 1.8,
                                        margin: 0,
                                    }}
                                >
                                    {spot.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Access Section */}
            <section
                style={{ backgroundColor: "#f2e8d0", padding: "5rem 1.5rem" }}
            >
                <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                        <p
                            style={{
                                color: "#7a4020",
                                fontSize: "0.72rem",
                                letterSpacing: "0.25em",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                marginBottom: "0.75rem",
                            }}
                        >
                            Access
                        </p>
                        <h2
                            style={{
                                fontFamily: "'Noto Serif JP', serif",
                                fontSize: "clamp(1.5rem, 3vw, 2rem)",
                                fontWeight: 700,
                                color: "#1e3c0e",
                            }}
                        >
                            アクセス
                        </h2>
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(280px, 1fr))",
                            gap: "1.5rem",
                            marginBottom: "3rem",
                        }}
                    >
                        {/* Address */}
                        <div
                            style={{
                                backgroundColor: "#faf5e8",
                                borderRadius: "4px",
                                padding: "2rem",
                                border: "1px solid rgba(180,140,80,0.18)",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.75rem",
                                    marginBottom: "1.25rem",
                                }}
                            >
                                <div
                                    style={{
                                        width: "38px",
                                        height: "38px",
                                        backgroundColor: "#1e3c0e",
                                        borderRadius: "3px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <FaMapMarkerAlt size={17} color="#d4b070" />
                                </div>
                                <h3
                                    style={{
                                        fontFamily: "'Noto Serif JP', serif",
                                        fontSize: "1rem",
                                        fontWeight: 700,
                                        color: "#1e3c0e",
                                    }}
                                >
                                    所在地
                                </h3>
                            </div>
                            <p
                                style={{
                                    fontSize: "0.9rem",
                                    color: "#4a3828",
                                    lineHeight: 2,
                                }}
                            >
                                〒399-1612
                                <br />
                                長野県下伊那郡阿南町新野3728-96
                                <br />
                                <span
                                    style={{
                                        fontSize: "0.8rem",
                                        color: "#8a7868",
                                    }}
                                >
                                    巣山湖のほとり
                                </span>
                            </p>
                            <a
                                href="https://maps.google.com/?q=長野県下伊那郡阿南町新野3728-96"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: "inline-block",
                                    marginTop: "1rem",
                                    color: "#7a4020",
                                    fontSize: "0.85rem",
                                    fontWeight: 700,
                                    textDecoration: "none",
                                    borderBottom: "1px solid #c47a30",
                                }}
                            >
                                Google マップで見る →
                            </a>
                        </div>

                        {/* By Car */}
                        <div
                            style={{
                                backgroundColor: "#faf5e8",
                                borderRadius: "4px",
                                padding: "2rem",
                                border: "1px solid rgba(180,140,80,0.18)",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.75rem",
                                    marginBottom: "1.25rem",
                                }}
                            >
                                <div
                                    style={{
                                        width: "38px",
                                        height: "38px",
                                        backgroundColor: "#1e3c0e",
                                        borderRadius: "3px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <FaCar size={17} color="#d4b070" />
                                </div>
                                <h3
                                    style={{
                                        fontFamily: "'Noto Serif JP', serif",
                                        fontSize: "1rem",
                                        fontWeight: 700,
                                        color: "#1e3c0e",
                                    }}
                                >
                                    お車でのアクセス
                                </h3>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "0.6rem",
                                }}
                            >
                                {[
                                    { from: "飯田市内から", time: "約40分" },
                                    {
                                        from: "中央自動車道 飯田ICから",
                                        time: "約50分",
                                    },
                                    { from: "名古屋方面から", time: "約2時間" },
                                    { from: "東京方面から", time: "約4時間" },
                                ].map((route) => (
                                    <div
                                        key={route.from}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            padding: "0.5rem 0",
                                            borderBottom:
                                                "1px solid rgba(180,140,80,0.12)",
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: "0.85rem",
                                                color: "#5a4838",
                                            }}
                                        >
                                            {route.from}
                                        </span>
                                        <span
                                            style={{
                                                fontSize: "0.85rem",
                                                fontWeight: 700,
                                                color: "#1e3c0e",
                                            }}
                                        >
                                            {route.time}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <p
                                style={{
                                    fontSize: "0.78rem",
                                    color: "#8a7868",
                                    marginTop: "0.75rem",
                                }}
                            >
                                ※ 駐車場完備（無料）
                            </p>
                        </div>

                        {/* By Train */}
                        <div
                            style={{
                                backgroundColor: "#faf5e8",
                                borderRadius: "4px",
                                padding: "2rem",
                                border: "1px solid rgba(180,140,80,0.18)",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.75rem",
                                    marginBottom: "1.25rem",
                                }}
                            >
                                <div
                                    style={{
                                        width: "38px",
                                        height: "38px",
                                        backgroundColor: "#1e3c0e",
                                        borderRadius: "3px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <FaTrain size={17} color="#d4b070" />
                                </div>
                                <h3
                                    style={{
                                        fontFamily: "'Noto Serif JP', serif",
                                        fontSize: "1rem",
                                        fontWeight: 700,
                                        color: "#1e3c0e",
                                    }}
                                >
                                    電車でのアクセス
                                </h3>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "0.6rem",
                                }}
                            >
                                {[
                                    {
                                        from: "飯田線 平岡駅から",
                                        time: "車で約30分",
                                    },
                                    {
                                        from: "飯田線 天竜峡駅から",
                                        time: "車で約50分",
                                    },
                                    {
                                        from: "JR飯田駅から",
                                        time: "車で約45分",
                                    },
                                ].map((route) => (
                                    <div
                                        key={route.from}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            padding: "0.5rem 0",
                                            borderBottom:
                                                "1px solid rgba(180,140,80,0.12)",
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: "0.85rem",
                                                color: "#5a4838",
                                            }}
                                        >
                                            {route.from}
                                        </span>
                                        <span
                                            style={{
                                                fontSize: "0.85rem",
                                                fontWeight: 700,
                                                color: "#1e3c0e",
                                            }}
                                        >
                                            {route.time}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div
                                style={{
                                    marginTop: "1rem",
                                    backgroundColor: "rgba(30,60,14,0.07)",
                                    borderRadius: "3px",
                                    padding: "0.75rem",
                                }}
                            >
                                <p
                                    style={{
                                        fontSize: "0.8rem",
                                        color: "#1e3c0e",
                                        fontWeight: 600,
                                        margin: 0,
                                    }}
                                >
                                    🚗 送迎サービス対応
                                </p>
                                <p
                                    style={{
                                        fontSize: "0.75rem",
                                        color: "#6a5848",
                                        margin: "0.25rem 0 0",
                                    }}
                                >
                                    飯田市・各駅からの送迎（要事前予約）
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Map */}
                    <div
                        style={{
                            backgroundColor: "#e8ddc8",
                            borderRadius: "4px",
                            overflow: "hidden",
                        }}
                    >
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3274.5!2d137.85!3d35.25!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s%E9%95%B7%E9%87%8E%E7%9C%8C%E4%B8%8B%E4%BC%8A%E9%82%A3%E9%83%A1%E9%98%BF%E5%8D%97%E7%94%BA%E6%96%B0%E9%87%8E3728-96!5e0!3m2!1sja!2sjp!4v1"
                            width="100%"
                            height="380"
                            style={{ border: 0, display: "block" }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="エルボスケ地図"
                        />
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section
                style={{
                    backgroundColor: "#5c2e12",
                    padding: "3.5rem 1.5rem",
                    textAlign: "center",
                }}
            >
                <h2
                    style={{
                        fontFamily: "'Noto Serif JP', serif",
                        fontSize: "1.6rem",
                        fontWeight: 700,
                        color: "#f0e8d0",
                        marginBottom: "0.75rem",
                    }}
                >
                    南信州への旅をはじめましょう
                </h2>
                <p
                    style={{
                        color: "rgba(240,232,208,0.8)",
                        marginBottom: "1.75rem",
                        fontSize: "0.9rem",
                    }}
                >
                    送迎サービスもございますので、電車でのお越しも安心です
                </p>
                <Link
                    to="/reservation"
                    style={{
                        display: "inline-block",
                        backgroundColor: "#f0e8d0",
                        color: "#5c2e12",
                        padding: "0.875rem 2.5rem",
                        borderRadius: "3px",
                        textDecoration: "none",
                        fontWeight: 700,
                        fontSize: "1rem",
                    }}
                >
                    予約・お問い合わせ
                </Link>
            </section>
        </div>
    );
}
